import type { Monitor } from '../../types/api'
import { displayStatus } from '../../lib/status'

/**
 * The 3-second glance. One sentence at the top-left of the screen answers
 * "is anything broken", and the four counts next to it are the only numbers
 * that change what you do next — deliberately not uptime averages or check
 * totals, which nobody acts on at 2am.
 */
export function VerdictHeader({ monitors }: { monitors: Monitor[] }) {
  const count = (fn: (m: Monitor) => boolean) => monitors.filter(fn).length

  const down = count((m) => displayStatus(m) === 'DOWN')
  const failing = count((m) => displayStatus(m) === 'PENDING_DOWN')
  const up = count((m) => displayStatus(m) === 'UP')
  const idle = count((m) => ['PENDING', 'PAUSED'].includes(displayStatus(m)))

  const none = monitors.length === 0

  const verdict = none
    ? 'NOTHING WATCHED'
    : down
      ? `${down} SERVICE${down === 1 ? '' : 'S'} DOWN`
      : failing
        ? `${failing} SERVICE${failing === 1 ? '' : 'S'} FAILING`
        : 'ALL SYSTEMS OPERATIONAL'

  const color = none
    ? 'var(--idle)'
    : down
      ? 'var(--down)'
      : failing
        ? 'var(--warn)'
        : 'var(--up)'

  const broken = monitors.filter((m) => displayStatus(m) === 'DOWN').map((m) => m.name)

  const sub = none
    ? 'No monitors yet — nothing is being checked, so nothing can be called healthy.'
    : down
      ? `${broken.slice(0, 2).join(' · ')}${broken.length > 2 ? ` · +${broken.length - 2} more` : ''} · ${up} of ${monitors.length} healthy`
      : failing
        ? `${failing} monitor${failing === 1 ? '' : 's'} failing but under threshold — no incident open yet`
        : `${up} monitor${up === 1 ? '' : 's'} healthy`

  const stats = [
    { label: 'Down', value: down, color: 'var(--down)' },
    { label: 'Failing', value: failing, color: 'var(--warn)' },
    { label: 'Up', value: up, color: 'var(--up)' },
    { label: 'Idle', value: idle, color: 'var(--idle)' },
  ]

  return (
    <section className="flex flex-wrap items-end gap-5 border-b border-divider pt-[26px] pb-5">
      <div className="min-w-[260px] flex-[1_1_300px]">
        <div className="mb-1.5 font-mono text-[11px] tracking-[.14em] text-faint">
          SYSTEM STATUS
        </div>
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-[14px] w-[14px] flex-none">
            <span className="absolute inset-0" style={{ background: color }} />
            <span className="animate-ring absolute inset-0" style={{ background: color }} />
          </span>
          <h1
            className="m-0 font-cond text-[38px] leading-none font-semibold tracking-[-.01em]"
            style={{ color }}
          >
            {verdict}
          </h1>
        </div>
        <div className="mt-2 text-[13px] tabular-nums text-muted">{sub}</div>
      </div>

      <div className="flex flex-wrap border border-divider">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`min-w-[74px] px-3.5 py-2.5 ${i < stats.length - 1 ? 'border-r border-hair' : ''}`}
          >
            <div className="num text-[20px]" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[10px] tracking-[.1em] text-muted uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
