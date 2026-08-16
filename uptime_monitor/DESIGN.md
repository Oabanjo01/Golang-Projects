# Uptime Monitor — System Design & Build Guide

A concurrent HTTP health-checking platform. Go backend (API + monitoring engine), React dashboard, Postgres, n8n for notification fan-out.

This is a **learning project**. Every decision below is annotated with *why* — where a faster option exists, it's noted along with what you'd give up by taking it.

---

## 0. Decision Log

| Decision | Choice | Rationale |
| --- | --- | --- |
| Auth in Week 1 | Email/password + JWT only | Google OAuth deferred to Week 3. Password auth teaches bcrypt, JWT signing, cookies, and middleware. OAuth adds a redirect dance and a second identity path on top of plumbing that isn't proven yet. |
| Postgres driver | Native `pgx/v5` + `pgxpool` | Hand-written SQL, typed scanning via `pgx.RowToStructByName`, and a real connection pool — the Week 1 learning goals, on the interface pgx is actually designed around. `lib/pq` is in maintenance mode. Originally planned as `database/sql` + the `pgx/v5/stdlib` adapter for the familiar stdlib interface, but the adapter layer buys nothing once you're using pgx directly — see §4.1a. |
| Backend pattern | Layered + dependency struct | `handler → service → repository`. An `Application` struct holds deps; handlers are methods on it. Phase 2's worker pool reuses the repository layer instead of duplicating SQL. |
| Frontend stack | Vite + TS + TanStack Query + Tailwind | This app is ~95% server state with live polling. TanStack Query handles caching/polling/refetch natively. No Redux. |
| Frontend delivery | Interleaved, not a separate phase | See §7 — the original roadmap listed 4 weeks of work for a 3-week project. |

---

## 1. Architecture Overview

```
[ React SPA (Vercel) ]
       │  HTTPS + JWT cookie (credentials: include)
       ▼
┌──────────────────────────────────────────────────────┐
│ Go Service (single binary, Render container)         │
│                                                      │
│  HTTP Router ──► Middleware ──► Handlers             │
│                  (auth, CORS,      │                 │
│                   logging)         ▼                 │
│                              Service Layer           │
│                                    │                 │
│  Scheduler ──► Job Queue ──► Workers                 │
│  (ticker)      (chan)        (goroutines)            │
│                                    │                 │
│                              Incident Engine         │
│                                    │                 │
│                              Repository Layer        │
└────────────────────────────────────┼─────────────────┘
                                     │
                    ┌────────────────┴──────────┐
                    ▼                           ▼
             [ Postgres ]                  [ n8n webhook ]
```

The API and the engine share one binary and one repository layer. They are separate concurrent subsystems, not separate services.

---

## 2. Database Schema

Corrections to the original draft are marked `-- FIX:` with reasoning in §3.

```sql
-- PG13+ has gen_random_uuid() built in. On PG12 or older:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id     VARCHAR(255) UNIQUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- FIX: both columns are nullable, so nothing stopped a user row with no
    -- way to authenticate at all. This makes that state unrepresentable.
    CONSTRAINT chk_auth_method
        CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

CREATE TABLE monitors (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                  VARCHAR(100) NOT NULL,
    url                   TEXT NOT NULL,

    interval_seconds      INT NOT NULL DEFAULT 60 CHECK (interval_seconds >= 30),
    timeout_seconds       INT NOT NULL DEFAULT 5  CHECK (timeout_seconds BETWEEN 1 AND 30),
    expected_status_code  INT NOT NULL DEFAULT 200,

    failure_threshold     INT NOT NULL DEFAULT 3 CHECK (failure_threshold >= 1),
    -- FIX: the state machine requires 2 consecutive successes to recover,
    -- but there was no column to configure or count that.
    recovery_threshold    INT NOT NULL DEFAULT 2 CHECK (recovery_threshold >= 1),
    consecutive_failures  INT NOT NULL DEFAULT 0,
    consecutive_successes INT NOT NULL DEFAULT 0,

    -- FIX: default was 'UP'. A monitor created 2 seconds ago has never been
    -- checked and must not render green. 'PENDING' is the honest initial state.
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'UP', 'PENDING_DOWN', 'DOWN')),

    -- FIX: lets a user pause a monitor without deleting its history.
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,

    last_checked_at       TIMESTAMPTZ,
    -- FIX: see §3.2 — this replaces computing the due time in the WHERE clause.
    next_check_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- A check that can outlive its own interval will queue on top of itself.
    CONSTRAINT chk_timeout_fits CHECK (timeout_seconds < interval_seconds)
);

CREATE TABLE check_logs (
    id            BIGSERIAL PRIMARY KEY,
    monitor_id    UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status_code   INT,                    -- NULL on DNS failure / timeout
    latency_ms    INT NOT NULL,           -- time until success or timeout
    is_success    BOOLEAN NOT NULL,
    error_message TEXT,
    checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE incidents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id  UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'RESOLVED')),
    cause       TEXT NOT NULL,
    opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- FIX: the most frequent Phase 1 query is "list monitors for this user".
-- The original schema had no index supporting it.
CREATE INDEX idx_monitors_user ON monitors (user_id);

-- FIX: replaces idx_monitors_next_check. See §3.2.
CREATE INDEX idx_monitors_due ON monitors (next_check_at) WHERE is_active;

CREATE INDEX idx_check_logs_monitor_time ON check_logs (monitor_id, checked_at DESC);
CREATE INDEX idx_incidents_monitor ON incidents (monitor_id, opened_at DESC);

-- FIX: makes "two OPEN incidents for one monitor" impossible at the DB level,
-- rather than something the Go code has to get right under concurrency.
CREATE UNIQUE INDEX idx_incidents_one_open
    ON incidents (monitor_id) WHERE status = 'OPEN';
```

---

## 3. Review of the Original Design

You asked me to act as check-and-balance. These are the issues worth knowing about, ordered by how much pain they'd cause.

### 3.1 Recovery was unimplementable as specified — blocking

The state machine says: *"If a check succeeds once while DOWN, require 2 consecutive successful checks before transitioning back to UP."* The schema had `consecutive_failures` but no `consecutive_successes`. You'd have hit this on day 1 of Phase 2 and patched it under pressure. Both a counter and a configurable `recovery_threshold` are now in the schema.

### 3.2 The scheduler index would not have been used — performance

```sql
CREATE INDEX idx_monitors_next_check ON monitors (last_checked_at, interval_seconds);
```

The query this is meant to serve looks like:

```sql
WHERE last_checked_at + (interval_seconds * INTERVAL '1 second') <= NOW()
```

Postgres cannot use a plain B-tree index for that predicate. The indexed columns appear inside an expression, so the planner has no sorted structure to seek into — it falls back to a sequential scan on every scheduler tick. The index costs write throughput and returns nothing.

The fix is to **store the answer instead of computing it**: a `next_check_at` column, indexed directly, queried with `WHERE next_check_at <= NOW()`. That's a plain range scan. It also makes retry backoff and jitter trivial later — you just write a different timestamp.

This generalises into a rule worth internalising: *index the column you filter on, not the ingredients of a calculation.*

### 3.3 New monitors would display as UP — correctness

`status VARCHAR(20) NOT NULL DEFAULT 'UP'`. A monitor created seconds ago has never been checked, but the dashboard would show it green. On an uptime tool specifically, that's the one thing that must never lie. Added `'PENDING'` as the initial state.

### 3.4 Cross-site cookies between Vercel and Render — will bite you in Week 1

This is the trap I most want you to see coming. Your frontend is on `*.vercel.app` and your API on `*.onrender.com`. Those are **different sites**, so an HTTP-only auth cookie is a third-party cookie. To make it work at all you need:

- Backend sets `SameSite=None; Secure; HttpOnly` on the cookie
- Backend CORS echoes the **exact** origin (`*` is illegal with credentials) and sends `Access-Control-Allow-Credentials: true`
- Frontend sends `credentials: 'include'` on every request

Even then, Safari and Brave block third-party cookies by default, so your app silently fails to stay logged in for some users. And `SameSite=None` removes the CSRF protection `Lax` was giving you, so you'd need a CSRF token on state-changing routes.

**The clean fix is a shared parent domain**: `app.yourdomain.com` and `api.yourdomain.com`. Same site, so `SameSite=Lax` works, third-party blocking doesn't apply, and CSRF is largely handled. Both Vercel and Render support custom domains on free tiers.

Flagging this in Week 1 because it changes how you write the cookie code, not just where you deploy. For local dev (`localhost:5173` → `localhost:8080`), ports don't break same-site, so `Lax` works and you won't notice the problem until deploy day.

### 3.5 Duplicate check dispatch — Phase 2, but the schema must support it now

If the scheduler ticks every 10s and a check takes 30s, the same monitor is selected and queued three times. The fix belongs in the fetch query — claim the row as you read it:

```sql
UPDATE monitors
SET next_check_at = NOW() + (interval_seconds * INTERVAL '1 second')
WHERE id IN (
    SELECT id FROM monitors
    WHERE is_active AND next_check_at <= NOW()
    ORDER BY next_check_at
    LIMIT $1
    FOR UPDATE SKIP LOCKED
)
RETURNING id, url, timeout_seconds, expected_status_code, failure_threshold;
```

`FOR UPDATE SKIP LOCKED` is the standard Postgres job-queue idiom. Noting it now because `next_check_at` is what makes it possible.

### 3.6 `check_logs` grows without bound — Phase 3

One monitor at 60s = 1,440 rows/day. Twenty monitors ≈ 10.5M rows/year. Render's free Postgres tier is 1GB. You'll want a retention job (`DELETE FROM check_logs WHERE checked_at < NOW() - INTERVAL '30 days'`) and, for the uptime graph, hourly rollups rather than querying raw rows. Not Week 1 work, but don't let it surprise you.

### 3.7 Smaller notes

- **`lib/pq` is in maintenance mode.** Already addressed — using native `pgx/v5` + `pgxpool`.
- **Status columns had no CHECK constraints.** A typo'd `'DWON'` would have been accepted silently. Now constrained.
- **`expected_status_code` as a single int** can't express "any 2xx". Fine for now; if you want ranges later, store a small text pattern instead.
- **No `updated_at`** anywhere. Added.
- **No unique constraint on `(user_id, url)`** — I've left it off deliberately, since monitoring one URL at two intervals is legitimate.

---

## 4. Backend Architecture

### 4.1 Package layout

```
uptime_monitor/
├── cmd/
│   └── api/
│       └── main.go              # wiring + startup + graceful shutdown only
├── internal/
│   ├── config/                  # env → typed Config struct
│   ├── database/                # pgxpool setup + generic query helpers (see §4.1a)
│   ├── models/                  # domain structs (User, Monitor, Incident)
│   ├── repository/              # SQL. Nothing else.
│   ├── service/                 # business rules. No http, no SQL strings.
│   ├── handlers/                # decode request → call service → encode response
│   ├── middleware/              # auth, CORS, logging, recovery
│   └── validator/               # input validation helpers
├── migrations/
│   ├── 001_init.up.sql
│   └── 001_init.down.sql
├── DESIGN.md
└── go.mod
```

### 4.1a Connection pooling — `pgxpool`, not a single `pgx.Conn`

`pgx.Connect` returns one `*pgx.Conn`, which is **not safe for concurrent use** — the pgx docs say this explicitly. `net/http` handles requests concurrently by design, so the moment two requests land at once they race on that single connection. `pgxpool.Pool` hands each caller its own connection for the duration of a query and returns it after, which is what makes it safe under concurrent handlers now and concurrent Phase 2 workers later.

```go
cfg, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
if err != nil { /* ... */ }
cfg.MaxConns = 10 // stay under Render free tier's connection cap

pool, err := pgxpool.NewWithConfig(ctx, cfg)
if err != nil { /* ... */ }
if err := pool.Ping(ctx); err != nil { /* ... */ }
```

`*pgxpool.Pool` is what the repository layer holds, not `*pgx.Conn` or `*sql.DB`.

A small generic helper avoids hand-writing `rows.Scan(&m.ID, &m.Name, ...)` per query while keeping one named, typed method per operation — see §4.3 for why the method still needs to be named rather than folded into one universal `Query(sql, args...)` function:

```go
func QueryMany[T any](ctx context.Context, pool *pgxpool.Pool, sql string, args ...any) ([]T, error) {
    rows, err := pool.Query(ctx, sql, args...)
    if err != nil {
        return nil, err
    }
    return pgx.CollectRows(rows, pgx.RowToStructByName[T])
}
```

### 4.2 The dependency struct

`main.go` builds one struct and hands it to the router. No globals, no `init()`.

```go
type Application struct {
    Config   config.Config
    Logger   *slog.Logger
    Services *service.Services
}

// Handlers are methods on it:
func (app *Application) handleCreateMonitor(w http.ResponseWriter, r *http.Request) { ... }
```

**Why this over passing `*sql.DB` into each handler:** in Phase 2 the scheduler and workers need the same queries the API uses. With SQL living in handler functions, you'd copy it. With a repository layer, the engine imports the same `MonitorRepository` and there's exactly one definition of "fetch due monitors".

### 4.3 Where interfaces go

Define the interface in the package that **consumes** it, not the one that implements it:

```go
// internal/service/monitor.go
type MonitorRepository interface {
    Create(ctx context.Context, m *models.Monitor) error
    ListByUser(ctx context.Context, userID uuid.UUID) ([]models.Monitor, error)
}
```

`repository.PostgresMonitorRepo` satisfies it without importing `service`. This is idiomatic Go and the opposite of the Java/C# habit of shipping interfaces next to implementations. It's what makes the service layer testable with a fake repo and no database.

### 4.4 Layer rules

| Layer | May import | Must never contain |
| --- | --- | --- |
| `handlers` | service, models | SQL, business rules |
| `service` | repository interfaces, models | `http.ResponseWriter`, SQL strings |
| `repository` | models, `pgxpool`, `pgx` | business rules, HTTP |

If you find yourself reaching for `http.Request` inside a service, the logic is in the wrong layer.

### 4.5 Phase 1 API surface

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create user, set JWT cookie |
| POST | `/api/auth/login` | — | Verify bcrypt, set JWT cookie |
| POST | `/api/auth/logout` | ✓ | Clear cookie |
| GET | `/api/auth/me` | ✓ | Current user (frontend session bootstrap) |
| GET | `/api/monitors` | ✓ | List caller's monitors |
| POST | `/api/monitors` | ✓ | Create monitor |
| GET | `/api/monitors/{id}` | ✓ | Single monitor |
| PATCH | `/api/monitors/{id}` | ✓ | Update |
| DELETE | `/api/monitors/{id}` | ✓ | Delete (cascades logs + incidents) |
| GET | `/health` | — | Liveness for Render |

**Ownership rule:** every `{id}` query filters `WHERE id = $1 AND user_id = $2`. Never fetch-then-compare in Go — one query, both conditions. A 404 (not 403) for someone else's monitor, so the API doesn't confirm the resource exists.

Router: **stdlib `net/http`**. Go 1.22+ supports `"GET /api/monitors/{id}"` patterns with `r.PathValue("id")`. No chi or gorilla needed.

### 4.6 Auth mechanics

- **bcrypt** cost 12. Compare with `bcrypt.CompareHashAndPassword` — never `==`.
- **JWT** HS256, secret from env, claims `sub` (user id), `iat`, `exp` (24h).
- **Cookie**: `HttpOnly`, `Secure`, `SameSite` per §3.4, `Path=/`.
- **Middleware** validates the token and puts the user ID in the request context:

```go
type contextKey string
const userIDKey contextKey = "userID"   // unexported type prevents collisions
ctx := context.WithValue(r.Context(), userIDKey, userID)
```

Always use an unexported named type as the context key. A bare string can collide with any other package writing to the same context.

- **Login must not reveal which field was wrong.** "Invalid email or password" for both cases, or you've built an account enumeration oracle.

---

## 5. Frontend Architecture

### 5.1 Structure — feature folders

```
frontend/src/
├── api/
│   ├── client.ts          # fetch wrapper, credentials: 'include', error normalisation
│   ├── auth.ts
│   └── monitors.ts
├── features/
│   ├── auth/              # LoginForm, RegisterForm, useAuth, ProtectedRoute
│   └── monitors/          # MonitorList, MonitorCard, MonitorForm, useMonitors
├── components/ui/         # Button, Input, Badge, Dialog, EmptyState
├── lib/
│   ├── queryClient.ts
│   └── queryKeys.ts       # key factory
├── routes/
└── types/api.ts           # mirrors Go response structs
```

Group by **feature**, not by file type. A `components/` folder holding 40 unrelated components stops being navigable around week 2; `features/monitors/` keeps everything about monitors in one place.

### 5.2 Server state via TanStack Query

Query key factory, so cache invalidation is never a guessing game:

```ts
export const monitorKeys = {
  all:    ['monitors'] as const,
  lists:  () => [...monitorKeys.all, 'list'] as const,
  detail: (id: string) => [...monitorKeys.all, 'detail', id] as const,
};
```

Phase 2 adds `refetchInterval` for live status. That's the entire live-dashboard implementation — no websockets, no polling code of your own.

Auth state is a `useQuery` on `/api/auth/me`, not a context holding a token. The token lives in an HTTP-only cookie the JS can't read, so the server is the only source of truth about who you are.

### 5.3 Design direction

Status colour is the single most important visual decision — it must be readable at a glance and not rely on colour alone.

| State | Colour | Shape cue |
| --- | --- | --- |
| `UP` | emerald | solid filled dot |
| `PENDING_DOWN` | amber | pulsing ring |
| `DOWN` | red | solid dot + left border on the card |
| `PENDING` | slate | hollow dot |
| Paused | slate, 60% opacity | hollow dot, muted card |

Roughly 8% of men have some red/green colour deficiency, and this is a red/green product. Every status therefore carries a shape and a text label, not just a hue.

Other commitments: dark mode from day one (ops tools live on second monitors at night); tabular figures for latency numbers so they don't jitter on refresh; skeleton loaders rather than spinners for the monitor list; and an empty state on the dashboard that contains the "Add your first monitor" action rather than pointing elsewhere.

---

## 6. Phase Plan

### Phase 1 — Foundation (Week 1)

**Backend**
1. `go mod init`, package skeleton, config loading
2. Postgres running locally (Docker), migrations applied
3. `users` repository + registration with bcrypt
4. JWT issue/verify + cookie handling
5. Auth middleware + request context
6. Monitor CRUD, ownership-scoped
7. CORS middleware for the Vite dev origin

**Frontend**
1. Vite + TS + Tailwind + TanStack Query setup
2. API client with `credentials: 'include'`
3. Register / login pages
4. `ProtectedRoute` + session bootstrap via `/api/auth/me`
5. Monitor list, create form, delete

**Done when:** you can register in the browser, log in, create a monitor, reload the page, and still be logged in with your monitor listed.

### Phase 2 — Engine (Week 2)
Ticker scheduler with the claim query from §3.5, buffered channel queue, bounded worker pool with `context.WithTimeout`, incident state machine in a DB transaction. Frontend gains live status polling, latency sparklines, incident history.

### Phase 3 — Dispatch & Ops (Week 3)
n8n webhook publisher with retry, Google OAuth, multi-stage Dockerfile (`CGO_ENABLED=0`), graceful shutdown on `SIGTERM`, deploy to Render + Vercel, `check_logs` retention job.

---

## 7. Note on Timeline

The original roadmap listed four phases across Weeks 1–4, but the project is three weeks. Rather than cutting scope, the frontend is **interleaved** — each week ships the API and the UI that consumes it.

This is also better practice than the alternative. Building three weeks of API against no consumer means discovering your response shapes are wrong in week 4, when they're most expensive to change. Consuming each endpoint the same week you write it surfaces those problems immediately.
