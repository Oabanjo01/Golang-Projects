import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Panel } from '../components/ui/Panel'
import { StatusGlyph } from '../components/ui/StatusGlyph'
import { STATUS, displayStatus, statusLabel } from '../lib/status'
import { fmtAgo, fmtDuration, fmtInterval, fmtLatency, fmtUptime } from '../lib/format'
import { LatencyChart } from '../features/monitors/LatencyChart'
import {
  useChecks,
  useDeleteMonitor,
  useIncidents,
  useMonitor,
  useUpdateMonitor,
} from '../features/monitors/useMonitors'
import { OCTAGON } from '../lib/status'

export function MonitorDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: monitor, isLoading, error } = useMonitor(id)
  const checks = useChecks(id)
  const incidents = useIncidents(id)
  const update = useUpdateMonitor()
  const remove = useDeleteMonitor()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <main className="mx-auto max-w-[1180px] px-5 py-6" />

  if (error || !monitor) {
    return (
      <main className="mx-auto max-w-[1180px] px-5 py-6">
        <Link to="/" className="font-mono text-[11px] tracking-[.1em] no-underline">
          ← ALL MONITORS
        </Link>
        <div className="mt-4 border border-[var(--down)] bg-[var(--down-tint)] p-4 text-[14px]">
          {error?.message ?? 'Monitor not found.'}
        </div>
      </main>
    )
  }

  const status = displayStatus(monitor)
  const meta = STATUS[status]
  const paused = status === 'PAUSED'
  const openIncident = incidents.data?.find((i) => i.status === 'OPEN')

  const stats = [
    {
      label: 'Status',
      value: statusLabel(monitor),
      sub: paused ? 'checks disabled' : `every ${fmtInterval(monitor.interval_seconds)}`,
      color: meta.color,
    },
    {
      label: 'Last latency',
      value: fmtLatency(monitor.last_latency_ms),
      sub: monitor.last_checked_at ? fmtAgo(monitor.last_checked_at) : 'never checked',
      color: 'var(--text)',
    },
    {
      label: 'Uptime 24h',
      value: fmtUptime(monitor.uptime_24h),
      sub: `expects HTTP ${monitor.expected_status_code}`,
      color: 'var(--text)',
    },
    {
      label: 'Failures',
      value: `${monitor.consecutive_failures}/${monitor.failure_threshold}`,
      sub: 'consecutive / threshold',
      color: monitor.consecutive_failures > 0 ? 'var(--warn)' : 'var(--text)',
    },
  ]

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-[22px] pb-16">
      <Link
        to="/"
        className="mb-3.5 inline-block font-mono text-[11px] tracking-[.1em] text-muted no-underline hover:text-text"
      >
        ← ALL MONITORS
      </Link>

      <div className="flex flex-wrap items-start gap-[18px] border-b border-divider pb-[18px]">
        <div className="flex-[1_1_280px]">
          <div className="mb-1 flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-[7px] border px-2.5 py-[3px] font-cond text-[13px] font-semibold tracking-[.08em]"
              style={{ borderColor: meta.color, background: meta.tint, color: meta.color }}
            >
              <StatusGlyph status={status} size={10} />
              {statusLabel(monitor)}
            </span>
            <span className="font-mono text-[11px] text-faint">
              {paused ? 'CHECKS PAUSED' : `CHECKED EVERY ${fmtInterval(monitor.interval_seconds)}`}
            </span>
          </div>
          <h1 className="m-0 font-cond text-[34px] leading-[1.1] font-semibold">{monitor.name}</h1>
          <a
            href={monitor.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12.5px] break-all"
          >
            {monitor.url}
          </a>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={update.isPending}
            onClick={() => update.mutate({ id, input: { is_active: !monitor.is_active } })}
            className="h-[34px] cursor-pointer border border-divider bg-transparent px-3.5 font-cond text-[14px] font-semibold tracking-[.04em] hover:border-[var(--text)] disabled:opacity-50"
          >
            {paused ? 'Resume checks' : 'Pause checks'}
          </button>
          <Link
            to={`/monitors/${id}/edit`}
            className="inline-flex h-[34px] items-center border border-divider px-3.5 font-cond text-[14px] font-semibold tracking-[.04em] text-text no-underline hover:border-[var(--text)]"
          >
            Edit
          </Link>
          {/* Two-step rather than a modal: destructive, but not worth a dialog
              that has to be dismissed on the common path. */}
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              remove.mutate(id, { onSuccess: () => navigate('/') })
            }}
            onBlur={() => setConfirmDelete(false)}
            className="h-[34px] cursor-pointer border px-3.5 font-cond text-[14px] font-semibold tracking-[.04em] disabled:opacity-50"
            style={{
              borderColor: confirmDelete ? 'var(--down)' : 'var(--divider)',
              color: confirmDelete ? 'var(--down)' : 'var(--muted)',
              background: confirmDelete ? 'var(--down-tint)' : 'transparent',
            }}
          >
            {confirmDelete ? 'Click again to delete' : 'Delete'}
          </button>
        </div>
      </div>

      {openIncident && (
        <div className="mt-[18px] flex flex-wrap items-center gap-3.5 border border-[var(--down)] bg-[var(--down-tint)] px-4 py-3.5">
          <div className="flex-[1_1_240px]">
            <div className="font-cond text-[17px] font-semibold tracking-[.04em] text-[var(--down)]">
              INCIDENT OPEN
            </div>
            <div className="text-[13px] text-muted">
              {openIncident.cause} · started{' '}
              {new Date(openIncident.opened_at).toLocaleString([], { hour12: false })}
            </div>
          </div>
          <div className="num min-w-[96px] text-right text-[24px] text-[var(--down)]">
            {fmtDuration(openIncident.opened_at)}
          </div>
        </div>
      )}

      <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] border border-divider">
        {stats.map((s) => (
          <div key={s.label} className="border-r border-hair px-4 py-3.5 last:border-r-0">
            <div className="mb-[3px] text-[10px] tracking-[.1em] text-muted uppercase">
              {s.label}
            </div>
            <div className="num text-[23px] leading-[1.15]" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] tabular-nums text-faint">{s.sub}</div>
          </div>
        ))}
      </div>

      <section className="mt-[26px]">
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="m-0 font-cond text-[20px] font-semibold tracking-[.04em]">
            RESPONSE TIME
          </h2>
          <span className="font-mono text-[11px] text-faint">
            ms · last {checks.data?.length ?? 0} checks
          </span>
        </div>
        <Panel className="px-3.5 pt-4 pb-2.5">
          {checks.isError ? (
            <div className="grid h-[200px] place-items-center px-6 text-center font-mono text-[12px] text-faint">
              Check history arrives with the Phase 2 engine.
            </div>
          ) : (
            <LatencyChart checks={checks.data ?? []} />
          )}
        </Panel>
      </section>

      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[26px]">
        <section>
          <h2 className="m-0 mb-2.5 font-cond text-[20px] font-semibold tracking-[.04em]">
            RECENT CHECKS
          </h2>
          <div className="border-t border-divider">
            {(checks.data ?? []).slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="num flex items-center gap-3 border-b border-hair px-0.5 py-2.5 text-[12.5px]"
              >
                <span
                  className="h-[9px] w-[9px] flex-none"
                  style={{
                    background: c.is_success ? 'var(--up)' : 'var(--down)',
                    clipPath: c.is_success ? undefined : OCTAGON,
                  }}
                />
                <span className="w-[64px] flex-none text-muted">
                  {new Date(c.checked_at).toLocaleTimeString([], { hour12: false })}
                </span>
                <span
                  className="w-[64px] flex-none"
                  style={{ color: c.is_success ? 'var(--up)' : 'var(--down)' }}
                >
                  {c.status_code ?? 'timeout'}
                </span>
                <span className="flex-1 text-right text-muted">
                  {c.is_success ? fmtLatency(c.latency_ms) : '—'}
                </span>
              </div>
            ))}
            {!checks.isLoading && (checks.data ?? []).length === 0 && (
              <div className="py-4 font-mono text-[12px] text-faint">No checks recorded yet.</div>
            )}
          </div>
        </section>

        <section>
          <h2 className="m-0 mb-2.5 font-cond text-[20px] font-semibold tracking-[.04em]">
            INCIDENTS
          </h2>
          <div className="border-t border-divider">
            {(incidents.data ?? []).map((inc) => (
              <div key={inc.id} className="flex gap-3 border-b border-hair px-0.5 py-3">
                <span
                  className="mt-[5px] h-[9px] w-[9px] flex-none"
                  style={{
                    background: inc.status === 'OPEN' ? 'var(--down)' : 'var(--idle)',
                    clipPath: OCTAGON,
                  }}
                />
                <div className="flex-1">
                  <div className="text-[14px]">{inc.cause}</div>
                  <div className="num text-[11.5px] text-faint">
                    {new Date(inc.opened_at).toLocaleString([], { hour12: false })} →{' '}
                    {inc.resolved_at
                      ? new Date(inc.resolved_at).toLocaleTimeString([], { hour12: false })
                      : 'ongoing'}
                  </div>
                </div>
                <div
                  className="num text-[13px]"
                  style={{ color: inc.status === 'OPEN' ? 'var(--down)' : 'var(--muted)' }}
                >
                  {fmtDuration(inc.opened_at, inc.resolved_at)}
                </div>
              </div>
            ))}
            {!incidents.isLoading && (incidents.data ?? []).length === 0 && (
              <div className="py-4 font-mono text-[12px] text-faint">
                No incidents recorded. {incidents.isError && 'Incidents arrive with Phase 2.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
