# Frontend Design Prompt

Paste everything below the line into a fresh Claude conversation. It's written to be self-contained — no prior context needed.

---

You are designing the UI for **Pulse**, an uptime monitoring dashboard. Act as a senior product designer: make opinionated decisions and justify them briefly, rather than offering me menus of options.

## The product

Pulse pings a list of URLs on a schedule and tells you when they break. A user adds a monitor (name + URL + check interval), and the system checks it every 30–300 seconds, records latency and status code, and opens an "incident" when a site fails repeatedly.

## Who uses it

A solo developer or small team running a handful of services. They check it in two very different modes, and the design has to serve both:

1. **The 3-second glance** — "is anything broken right now?" Answered from across the room, on a second monitor, often at night. This is 95% of sessions.
2. **The incident dig** — something *is* broken; now they need latency history, status codes, and when it started.

Optimise the default view hard for mode 1. Mode 2 is one click deeper.

## Screens to design

1. **Login / Register** — email + password. Minimal, centred, fast.
2. **Dashboard** — the monitor list. The primary screen. Must answer "is anything broken" instantly.
3. **Add / Edit monitor** — form: name, URL, check interval, request timeout, expected status code, failure threshold.
4. **Monitor detail** — latency chart over time, uptime percentage, recent check history, incident list.

Also design these states explicitly, not as afterthoughts — they are most of what a real user sees:
- Dashboard with zero monitors (first run)
- Dashboard while loading
- A monitor in each status (see below)
- A failed action (network error on save)

## Hard constraints

**Status semantics.** Five states, and each must be distinguishable **without relying on colour** — this is a red/green product and roughly 8% of men have some red/green colour deficiency. Every status carries a shape or text cue in addition to its hue:

| State | Meaning | Colour |
| --- | --- | --- |
| `UP` | Last check passed | emerald |
| `PENDING_DOWN` | Failing, but under the alert threshold | amber |
| `DOWN` | Confirmed down, incident open | red |
| `PENDING` | Created, never checked yet | slate |
| `PAUSED` | Checks disabled by the user | slate, muted |

`PENDING` must never read as healthy. A monitor created ten seconds ago has no idea whether the site is up, and the UI must not imply otherwise.

**Dark mode is the primary theme**, with a light theme also designed. Ops tools live on second monitors at night.

**Numbers must not jitter.** Latency and uptime percentages refresh every few seconds. Use tabular figures and fixed-width containers so digits don't shift the layout on every poll.

**Skeleton loaders, not spinners**, for the monitor list — the shape of the content is known in advance.

**Empty states contain the action.** The zero-monitor dashboard has the "Add your first monitor" control inside it, not a pointer to a button elsewhere.

## Technical constraints

- React + TypeScript + Tailwind CSS. Design in a way that maps cleanly to Tailwind's default scale — don't invent arbitrary spacing or colour values.
- Responsive: usable from 375px to 1440px. The dashboard is checked on a phone.
- Icons: assume Lucide is available.
- Charts: assume Recharts is available.

## What to give me

1. **A working React artifact** with all four screens, navigable, using realistic mock data — at least 8 monitors spread across every status, and a latency series with a visible outage in it. I want to click through it, not read a description of it.
2. **A design system section** at the end: the colour tokens (light + dark), type scale, spacing rhythm, and the status-badge component spec.
3. **Three or four sentences** on the core layout decision for the dashboard — why that structure serves the 3-second glance better than the alternatives you rejected.

## Anti-goals

- No landing page, marketing copy, or pricing table. This is the authenticated product only.
- No AI features, chat panels, or assistants.
- Don't design a settings/billing/team-management area.
- Avoid generic SaaS dashboard filler: no decorative stat cards that nobody acts on, no gradient hero blocks, no fake sparkline noise. Every element should answer a question a user actually asks.
