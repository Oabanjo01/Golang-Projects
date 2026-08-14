/**
 * In-memory stand-in for the Go API, so the frontend is testable before the
 * backend exists. Enabled with VITE_API_MOCK=true. Delete this directory once
 * the real API is up — nothing outside src/api/client.ts imports it.
 *
 * It deliberately mirrors real server behaviour that the UI must handle:
 *   - 401 from /api/auth/me when there is no session
 *   - artificial latency, so loading states are actually visible
 *   - 404 (not 403) for a monitor you don't own
 *   - a save failure path, to exercise the error UI (see FAIL_SENTINEL)
 */
import { ApiError } from '../api/client'
import type {
  CheckLog,
  CreateMonitorInput,
  Credentials,
  Incident,
  Monitor,
  UpdateMonitorInput,
  User,
} from '../types/api'

/** Name a monitor "fail" to make saving it error, for exercising the error state. */
const FAIL_SENTINEL = 'fail'

const USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'dev@acme.io',
  created_at: new Date('2026-07-01T09:00:00Z').toISOString(),
}

const ago = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString()

/**
 * The real session lives in an HttpOnly cookie, which survives a page reload —
 * so the mock has to survive one too, or "log in, reload, still logged in"
 * (the Phase 1 acceptance test) fails against the mock but passes against the
 * API. Module state alone resets on every reload, hence localStorage.
 */
const SESSION_KEY = 'pulse-mock-session'
const MONITORS_KEY = 'pulse-mock-monitors'

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

let session: User | null = load<User>(SESSION_KEY)
let nextId = 100

function seedMonitor(
  partial: Pick<Monitor, 'name' | 'url' | 'status' | 'interval_seconds'> & Partial<Monitor>,
): Monitor {
  return {
    id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
    user_id: USER.id,
    timeout_seconds: 10,
    expected_status_code: 200,
    failure_threshold: 3,
    recovery_threshold: 2,
    consecutive_failures: 0,
    consecutive_successes: 0,
    is_active: true,
    last_checked_at: ago(20),
    next_check_at: new Date(Date.now() + 40_000).toISOString(),
    created_at: ago(86_400 * 12),
    updated_at: ago(3600),
    last_latency_ms: null,
    uptime_24h: null,
    ...partial,
  }
}

/* Seeded from the Pulse design's fixture set — every status is represented, so
   the dashboard exercises all five row treatments in one screen. */
const SEED: Monitor[] = [
  seedMonitor({
    name: 'Checkout API',
    url: 'https://checkout.acme.io/healthz',
    status: 'DOWN',
    interval_seconds: 30,
    consecutive_failures: 82,
    last_checked_at: ago(8),
    uptime_24h: 97.41,
  }),
  seedMonitor({
    name: 'Payments webhook',
    url: 'https://webhooks.acme.io/stripe',
    status: 'DOWN',
    interval_seconds: 60,
    consecutive_failures: 6,
    last_checked_at: ago(12),
    uptime_24h: 99.02,
  }),
  seedMonitor({
    name: 'Auth service',
    url: 'https://auth.acme.io/v2/session',
    status: 'PENDING_DOWN',
    interval_seconds: 30,
    consecutive_failures: 2,
    last_checked_at: ago(5),
    last_latency_ms: 4820,
    uptime_24h: 99.88,
  }),
  seedMonitor({
    name: 'Marketing site',
    url: 'https://acme.io',
    status: 'UP',
    interval_seconds: 300,
    last_checked_at: ago(22),
    last_latency_ms: 142,
    uptime_24h: 100,
  }),
  seedMonitor({
    name: 'App dashboard',
    url: 'https://app.acme.io',
    status: 'UP',
    interval_seconds: 60,
    last_checked_at: ago(14),
    last_latency_ms: 318,
    uptime_24h: 99.94,
  }),
  seedMonitor({
    name: 'Static CDN',
    url: 'https://cdn.acme.io/build/manifest.json',
    status: 'UP',
    interval_seconds: 120,
    last_checked_at: ago(31),
    last_latency_ms: 37,
    uptime_24h: 100,
  }),
  seedMonitor({
    name: 'Search cluster',
    url: 'https://search.acme.io/_cluster/health',
    status: 'UP',
    interval_seconds: 60,
    last_checked_at: ago(19),
    last_latency_ms: 96,
    uptime_24h: 99.79,
  }),
  seedMonitor({
    name: 'Status page',
    url: 'https://status.acme.io',
    status: 'UP',
    interval_seconds: 300,
    last_checked_at: ago(44),
    last_latency_ms: 61,
    uptime_24h: 100,
  }),
  seedMonitor({
    name: 'Docs',
    url: 'https://docs.acme.io',
    status: 'UP',
    interval_seconds: 300,
    last_checked_at: ago(27),
    last_latency_ms: 204,
    uptime_24h: 99.99,
  }),
  // Never checked: last_checked_at and both Phase 2 metrics are null. This is
  // the row that must never render as healthy.
  seedMonitor({
    name: 'Billing worker',
    url: 'https://billing.acme.io/internal/ping',
    status: 'PENDING',
    interval_seconds: 60,
    last_checked_at: null,
    created_at: ago(12),
  }),
  seedMonitor({
    name: 'Legacy v1 API',
    url: 'https://v1.acme.io/ping',
    status: 'UP',
    interval_seconds: 300,
    is_active: false,
    last_checked_at: null,
    uptime_24h: 99.31,
  }),
]

/* Anything created or deleted in the UI outlives a reload, the way rows in
   Postgres would. Clear it with localStorage.clear() to get the seed back. */
let monitors: Monitor[] = load<Monitor[]>(MONITORS_KEY) ?? SEED

// Keep issuing fresh ids after a reload rather than colliding with stored ones.
nextId = Math.max(nextId, ...monitors.map((m) => Number(m.id.slice(-12)) + 1))

function persist() {
  save(MONITORS_KEY, monitors)
}

const incidents: Incident[] = [
  {
    id: 'inc-1',
    monitor_id: SEED[0].id,
    status: 'OPEN',
    cause: 'Connection timeout after 10s',
    opened_at: ago(41 * 60),
    resolved_at: null,
  },
  {
    id: 'inc-2',
    monitor_id: SEED[0].id,
    status: 'RESOLVED',
    cause: 'HTTP 502 from origin',
    opened_at: ago(86_400 * 3),
    resolved_at: ago(86_400 * 3 - 420),
  },
  {
    id: 'inc-3',
    monitor_id: SEED[0].id,
    status: 'RESOLVED',
    cause: 'HTTP 500 on /healthz',
    opened_at: ago(86_400 * 10),
    resolved_at: ago(86_400 * 10 - 360),
  },
]

function checksFor(monitorId: string): CheckLog[] {
  const m = monitors.find((x) => x.id === monitorId)
  const failing = m?.status === 'DOWN' || m?.status === 'PENDING_DOWN'
  return Array.from({ length: 12 }, (_, i) => {
    const bad = failing && i < 3
    return {
      id: i + 1,
      monitor_id: monitorId,
      status_code: bad ? (i === 2 ? 503 : null) : 200,
      latency_ms: bad ? 10_000 : 140 + Math.round(Math.sin(i * 1.7) * 30) + (i % 4) * 8,
      is_success: !bad,
      error_message: bad && i !== 2 ? 'context deadline exceeded' : null,
      checked_at: ago((i + 1) * 30),
    }
  })
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function requireSession(): User {
  if (!session) throw new ApiError(401, 'Not authenticated')
  return session
}

function findOwned(id: string): Monitor {
  requireSession()
  const m = monitors.find((x) => x.id === id)
  // 404 rather than 403 — a 403 would confirm the resource exists.
  if (!m) throw new ApiError(404, 'Monitor not found')
  return m
}

export async function mockApi<T>(path: string, init: RequestInit): Promise<T> {
  await delay(220 + Math.random() * 380)

  const method = (init.method ?? 'GET').toUpperCase()
  const body = init.body ? (JSON.parse(init.body as string) as unknown) : undefined

  if (path === '/api/auth/register' && method === 'POST') {
    const { email, password } = body as Credentials
    if (!email || password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters.')
    }
    session = { ...USER, email }
    save(SESSION_KEY, session)
    return session as T
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = body as Credentials
    if (!email || !password) {
      // Never say which field was wrong — that builds an account oracle.
      throw new ApiError(401, 'Invalid email or password.')
    }
    session = { ...USER, email }
    save(SESSION_KEY, session)
    return session as T
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    session = null
    localStorage.removeItem(SESSION_KEY)
    return undefined as T
  }

  if (path === '/api/auth/me' && method === 'GET') {
    return requireSession() as T
  }

  if (path === '/api/monitors' && method === 'GET') {
    requireSession()
    return monitors.slice() as T
  }

  if (path === '/api/monitors' && method === 'POST') {
    requireSession()
    const input = body as CreateMonitorInput
    if (input.name.toLowerCase().includes(FAIL_SENTINEL)) {
      throw new ApiError(0, 'Network error — could not reach the API.')
    }
    const created = seedMonitor({
      ...input,
      status: 'PENDING',
      last_checked_at: null,
      created_at: new Date().toISOString(),
    })
    monitors = [...monitors, created]
    persist()
    return created as T
  }

  const idMatch = /^\/api\/monitors\/([^/]+)$/.exec(path)
  if (idMatch) {
    const m = findOwned(idMatch[1])
    if (method === 'GET') return m as T
    if (method === 'PATCH') {
      const input = body as UpdateMonitorInput
      if (input.name?.toLowerCase().includes(FAIL_SENTINEL)) {
        throw new ApiError(0, 'Network error — could not reach the API.')
      }
      Object.assign(m, input, { updated_at: new Date().toISOString() })
      // Resuming a paused monitor has no fresh check yet, so it goes back to
      // PENDING rather than claiming its pre-pause status still holds.
      if (input.is_active === true) m.status = 'PENDING'
      persist()
      return m as T
    }
    if (method === 'DELETE') {
      monitors = monitors.filter((x) => x.id !== m.id)
      persist()
      return undefined as T
    }
  }

  const checksMatch = /^\/api\/monitors\/([^/]+)\/checks$/.exec(path)
  if (checksMatch) return checksFor(findOwned(checksMatch[1]).id) as T

  const incMatch = /^\/api\/monitors\/([^/]+)\/incidents$/.exec(path)
  if (incMatch) {
    const m = findOwned(incMatch[1])
    return incidents.filter((i) => i.monitor_id === m.id) as T
  }

  throw new ApiError(404, `No mock handler for ${method} ${path}`)
}
