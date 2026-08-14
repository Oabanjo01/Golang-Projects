# Pulse — frontend

React dashboard for the uptime monitor. Implements the Pulse design system.
Architecture decisions live in [`../DESIGN.md`](../DESIGN.md) §5.

## Running

```bash
npm install
npm run dev          # http://localhost:5173
```

`.env.local` ships with `VITE_API_MOCK=true`, so the UI runs against the
in-memory mock in `src/mocks/` and needs no backend. Set it to `false` once the
Go API is listening on `:8080` — Vite proxies `/api` there.

The mock persists to `localStorage`, so created monitors and your session
survive a reload the way real rows and a real cookie would. `localStorage.clear()`
resets it to the seed data.

Two mock affordances for exercising states that are otherwise hard to reach:

| To see | Do this |
| --- | --- |
| Save-error UI | Name a monitor anything containing `fail` |
| Empty dashboard | `localStorage.setItem('pulse-mock-monitors', '[]')` |

## Layout

```
src/
├── api/            fetch wrapper + typed endpoint functions
├── features/       auth/ and monitors/ — components + hooks, grouped by feature
├── components/ui/  shared primitives (Panel, Button, Field, StatusGlyph)
├── lib/            query keys, query client, status table, formatters
├── routes/         one file per screen
├── types/api.ts    wire types, mirroring the Go structs field-for-field
└── mocks/          delete once the API exists
```

## Things worth knowing before you change something

**`src/types/api.ts` is snake_case on purpose.** It mirrors the Go structs
exactly, so there is no mapping layer to keep in sync. Tag your Go fields
`json:"interval_seconds"` and the two sides stay identical.

**PAUSED is not a database status.** The schema stores `status` (what the last
check said) and `is_active` (whether we check at all) as independent columns.
`displayStatus()` in `lib/status.ts` folds them into the one label a user thinks
in. Don't add PAUSED to the `MonitorStatus` union.

**`lib/status.ts` is the single source of truth for status appearance.** Label,
colour, silhouette, and sort order all live in one table. Adding a state means
editing that file and nothing else.

**Colour is never the only signal.** Every status carries a distinct shape and a
text label, because this is a red/green product and ~8% of men have some
red/green colour deficiency. If you add a state, give it a shape.

**Numbers use `.num` or `tabular-nums`.** The dashboard re-polls every 10s;
proportional digits would make values jitter and shift the layout on each poll.
The metric columns are fixed-width for the same reason.

## Verifying

```bash
npm run build        # tsc -b && vite build
```

Note that Tailwind v4 silently generates nothing for an invalid utility — a
typo'd class produces no CSS and no error. If spacing looks wrong, grep the
built CSS in `dist/assets/*.css` for the class name before debugging anything else.
