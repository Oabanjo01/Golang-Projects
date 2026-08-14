import type { CheckLog } from '../../types/api'

const W = 720
const H = 170
const X0 = 46
const VIEW_H = 200

/**
 * Latency over time. Hand-rolled SVG rather than a chart library: the one
 * feature that matters here — failed checks breaking the line and shading the
 * span underneath — is exactly the thing a generic charting library makes
 * awkward, and this is ~60 lines with no dependency.
 *
 * Expects checks newest-first (as the API returns them) and reverses internally.
 */
export function LatencyChart({ checks }: { checks: CheckLog[] }) {
  if (checks.length < 2) {
    return (
      <div className="grid h-[200px] place-items-center font-mono text-[12px] text-faint">
        Not enough checks yet to draw a series.
      </div>
    )
  }

  const points = checks.slice().reverse()
  const max = Math.max(...points.filter((p) => p.is_success).map((p) => p.latency_ms), 100) * 1.15

  const px = (i: number) => X0 + (i * (W - X0)) / (points.length - 1)
  const py = (ms: number) => H - (Math.min(ms, max) / max) * (H - 12)

  // A failed check is a gap, not a zero — drawing it at the axis would read as
  // "very fast" instead of "no response".
  const segments: string[][] = []
  let current: string[] = []
  points.forEach((p, i) => {
    if (p.is_success) {
      current.push(`${px(i).toFixed(1)},${py(p.latency_ms).toFixed(1)}`)
    } else if (current.length) {
      segments.push(current)
      current = []
    }
  })
  if (current.length) segments.push(current)

  const area = segments
    .filter((s) => s.length > 1)
    .map((s) => {
      const first = s[0].split(',')[0]
      const last = s[s.length - 1].split(',')[0]
      return `M${first},${H} ${s.map((pt) => `L${pt}`).join(' ')} L${last},${H} Z`
    })
    .join(' ')

  // Contiguous runs of failures, shaded as outage bands.
  const bands: { x: number; w: number }[] = []
  let start: number | null = null
  points.forEach((p, i) => {
    if (!p.is_success && start === null) start = i
    if (p.is_success && start !== null) {
      bands.push({ x: px(start), w: px(i) - px(start) })
      start = null
    }
  })
  if (start !== null) bands.push({ x: px(start), w: px(points.length - 1) - px(start) })

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))
  const timeLabel = (p: CheckLog) =>
    new Date(p.checked_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  const xTickIdx = [0, Math.floor(points.length / 2), points.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${VIEW_H}`} width="100%" className="block h-auto overflow-visible">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={X0} y1={py(v)} x2={W} y2={py(v)} stroke="var(--hair)" strokeWidth={1} />
          <text
            x={X0 - 8}
            y={py(v) + 3.5}
            textAnchor="end"
            fill="var(--faint)"
            fontFamily="IBM Plex Mono, monospace"
            fontSize={10}
          >
            {v}
          </text>
        </g>
      ))}

      {bands.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={0} width={Math.max(b.w, 2)} height={H} fill="var(--down-tint)" />
          <line
            x1={b.x}
            y1={0}
            x2={b.x}
            y2={H}
            stroke="var(--down)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </g>
      ))}

      {area && <path d={area} fill="var(--accent-tint)" />}

      {segments.map((s, i) => (
        <polyline
          key={i}
          points={s.join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}

      {xTickIdx.map((i) => (
        <text
          key={i}
          x={px(i)}
          y={VIEW_H - 10}
          textAnchor="middle"
          fill="var(--faint)"
          fontFamily="IBM Plex Mono, monospace"
          fontSize={10}
        >
          {timeLabel(points[i])}
        </text>
      ))}
    </svg>
  )
}
