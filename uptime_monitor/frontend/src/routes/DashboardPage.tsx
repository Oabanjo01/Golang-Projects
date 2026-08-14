import { useEffect, useState } from 'react'
import { bySeverity } from '../lib/status'
import { fmtClock } from '../lib/format'
import { POLL_MS, useMonitors } from '../features/monitors/useMonitors'
import { MonitorRow } from '../features/monitors/MonitorRow'
import { VerdictHeader } from '../features/monitors/VerdictHeader'
import {
  MonitorListEmpty,
  MonitorListError,
  MonitorListSkeleton,
} from '../features/monitors/MonitorListStates'

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useMonitors()
  const [clock, setClock] = useState(() => fmtClock())

  useEffect(() => {
    const t = setInterval(() => setClock(fmtClock()), 1000)
    return () => clearInterval(t)
  }, [])

  // Broken monitors sort to the top, so the answer to "what is wrong" is always
  // in the same place — the first row.
  const monitors = data ? data.slice().sort(bySeverity) : []

  return (
    <main className="mx-auto max-w-[1180px] px-5 pb-16">
      <VerdictHeader monitors={monitors} />

      {isLoading && (
        <div className="pt-4">
          <MonitorListSkeleton />
        </div>
      )}

      {error && <MonitorListError message={error.message} onRetry={() => void refetch()} />}

      {!isLoading && !error && monitors.length === 0 && <MonitorListEmpty />}

      {!isLoading && !error && monitors.length > 0 && (
        <div className="pt-4">
          <div className="eyebrow flex flex-wrap items-center gap-4 border-b border-divider px-1 pb-2">
            <span className="w-[158px] flex-none">STATUS</span>
            <span className="flex-[1_1_150px]">MONITOR</span>
            <span className="flex flex-[1_1_268px] justify-end gap-4">
              <span className="w-[86px] text-right">LATENCY</span>
              <span className="w-[78px] text-right">24H</span>
              <span className="w-[96px] text-right">LAST CHECK</span>
            </span>
          </div>

          {monitors.map((m) => (
            <MonitorRow key={m.id} monitor={m} />
          ))}

          <div className="flex flex-wrap justify-between gap-2 px-1 py-3.5 font-mono text-[11px] text-faint">
            <span>
              {monitors.length} MONITOR{monitors.length === 1 ? '' : 'S'}
            </span>
            <span className="tabular-nums">
              AUTO-REFRESH {POLL_MS / 1000}s · {clock}
            </span>
          </div>
        </div>
      )}
    </main>
  )
}
