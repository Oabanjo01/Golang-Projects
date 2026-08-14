import { Link } from 'react-router-dom'
import { Panel } from '../../components/ui/Panel'

const SKELETONS = [
  { w1: '58%', w2: '38%' },
  { w1: '44%', w2: '52%' },
  { w1: '66%', w2: '31%' },
  { w1: '38%', w2: '46%' },
  { w1: '52%', w2: '36%' },
  { w1: '46%', w2: '49%' },
]

/**
 * Skeletons rather than a spinner: the shape of a monitor row is known before
 * the data arrives, so the layout can settle first and only the values pop in.
 * Varying the bar widths stops it reading as a loading graphic.
 */
export function MonitorListSkeleton() {
  return (
    <div>
      <div className="eyebrow flex gap-4 border-b border-divider px-1 pb-2">
        <span className="w-[150px]">STATUS</span>
        <span className="flex-1">MONITOR</span>
        <span>CHECKING…</span>
      </div>
      {SKELETONS.map((s, i) => (
        <div
          key={i}
          className="animate-skel flex items-center gap-4 border-b border-hair px-1 py-4"
        >
          <div className="h-[11px] w-[11px] flex-none bg-skel-hi" />
          <div className="h-[10px] w-[76px] flex-none bg-skel-hi" />
          <div className="flex min-w-[120px] flex-1 flex-col gap-[7px]">
            <div className="h-[12px] bg-skel-hi" style={{ width: s.w1 }} />
            <div className="h-[9px] bg-skel" style={{ width: s.w2 }} />
          </div>
          <div className="h-[11px] w-[58px] flex-none bg-skel" />
          <div className="h-[11px] w-[52px] flex-none bg-skel" />
        </div>
      ))}
    </div>
  )
}

/** The empty state carries the action itself rather than pointing at the header. */
export function MonitorListEmpty() {
  return (
    <Panel
      className="mt-[22px] px-6 py-14 text-center"
      // Hatching marks the region as deliberately unoccupied, not broken.
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(135deg,transparent,transparent 9px,var(--hair) 9px,var(--hair) 10px)',
        }}
      />
      <div className="relative mx-auto max-w-[420px] bg-bg px-3 py-2">
        <h2 className="m-0 mb-1.5 font-cond text-[28px] font-semibold">
          Nothing is being watched yet
        </h2>
        <p className="m-0 mb-5 text-[14px] text-muted">
          Add a URL and Pulse will check it on your schedule, record latency and status codes,
          and open an incident when it fails.
        </p>
        <Link
          to="/monitors/new"
          className="inline-flex min-h-[42px] items-center gap-2 border border-[var(--accent)] bg-accent px-5 font-cond text-[16px] font-semibold tracking-[.04em] text-bg no-underline hover:border-[var(--text)] hover:bg-[var(--text)]"
        >
          + Add your first monitor
        </Link>
        <div className="mt-3.5 font-mono text-[11px] text-faint">Takes about 20 seconds</div>
      </div>
    </Panel>
  )
}

export function MonitorListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-[22px] border border-[var(--down)] bg-[var(--down-tint)] p-4">
      <div className="font-cond text-[16px] font-semibold tracking-[.03em] text-[var(--down)]">
        COULDN’T LOAD MONITORS
      </div>
      <div className="mt-0.5 text-[13px] text-muted">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2.5 h-[30px] cursor-pointer border border-[var(--down)] bg-transparent px-3 font-cond text-[13px] font-semibold tracking-[.04em] text-[var(--down)] hover:bg-[var(--down-tint)]"
      >
        Retry
      </button>
    </div>
  )
}
