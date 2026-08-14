import { Link } from 'react-router-dom'
import type { Monitor } from '../../types/api'
import { STATUS, displayStatus, statusLabel } from '../../lib/status'
import { fmtAgo, fmtLatency, fmtUptime } from '../../lib/format'
import { StatusGlyph } from '../../components/ui/StatusGlyph'

/**
 * The inline reason a row is not healthy, derived from real fields rather than
 * stored as text. A broken row explains itself without a hover or a click,
 * which is what keeps the 3-second glance at the top of the screen.
 */
function rowNote(m: Monitor): string | null {
  const status = displayStatus(m)

  if (status === 'DOWN') {
    return `${m.consecutive_failures} consecutive failures · incident open`
  }
  if (status === 'PENDING_DOWN') {
    return `${m.consecutive_failures} of ${m.failure_threshold} failures — not an incident yet`
  }
  if (status === 'PENDING') {
    return `Created ${fmtAgo(m.created_at)} · no check has returned yet`
  }
  return null
}

export function MonitorRow({ monitor }: { monitor: Monitor }) {
  const status = displayStatus(monitor)
  const meta = STATUS[status]
  const note = rowNote(monitor)
  const paused = status === 'PAUSED'

  return (
    <Link
      to={`/monitors/${monitor.id}`}
      className="flex flex-wrap items-center gap-4 border-b border-hair px-1 py-3.5 no-underline hover:bg-accent-tint"
      style={{ opacity: paused ? 0.55 : 1, color: 'var(--text)' }}
    >
      <div className="flex w-[158px] flex-none items-center gap-2.5">
        <StatusGlyph status={status} />
        <span
          className="font-cond text-[15px] font-semibold tracking-[.06em] whitespace-nowrap"
          style={{ color: meta.color }}
        >
          {statusLabel(monitor)}
        </span>
      </div>

      <div className="min-w-[140px] flex-[1_1_150px]">
        <div className="text-[15px] leading-[1.25] font-medium">{monitor.name}</div>
        <div className="overflow-hidden font-mono text-[11.5px] text-ellipsis whitespace-nowrap text-faint">
          {monitor.url}
        </div>
      </div>

      {/* Fixed-width metric columns. These widths are what stop polled digits
          from shifting the layout every few seconds. */}
      <div className="flex flex-[1_1_268px] items-center justify-end gap-4">
        <div
          className="num w-[86px] text-right text-[13px]"
          style={{
            color:
              status === 'PENDING_DOWN'
                ? 'var(--warn)'
                : monitor.last_latency_ms == null
                  ? 'var(--faint)'
                  : 'var(--text)',
          }}
        >
          {fmtLatency(monitor.last_latency_ms)}
        </div>
        <div className="num w-[78px] text-right text-[13px] text-muted">
          {fmtUptime(monitor.uptime_24h)}
        </div>
        <div className="num w-[96px] text-right text-[11.5px] text-faint">
          {paused ? 'paused' : fmtAgo(monitor.last_checked_at)}
        </div>
      </div>

      {note && (
        <div
          className="mt-0.5 flex-[1_1_100%] px-2.5 py-2 font-mono text-[12.5px] text-muted"
          style={{ borderLeft: `2px solid ${meta.color}`, background: meta.tint }}
        >
          {note}
        </div>
      )}
    </Link>
  )
}
