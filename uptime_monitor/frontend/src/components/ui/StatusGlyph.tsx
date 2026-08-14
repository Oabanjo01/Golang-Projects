import type { DisplayStatus } from '../../types/api'
import { OCTAGON, STATUS, TRIANGLE } from '../../lib/status'

/**
 * The non-colour half of a status signal. Each state gets a distinct
 * silhouette so the five statuses stay separable in greyscale:
 *
 *   UP           solid square      — the only shape with four straight edges
 *   FAILING      triangle          — a caution sign
 *   DOWN         octagon           — a stop sign
 *   PENDING      dashed hollow ring— reads as absent data, never as healthy
 *   PAUSED       two bars          — the universal pause mark
 *
 * Always rendered next to a text label; it is reinforcement, never the only cue.
 */
export function StatusGlyph({ status, size = 11 }: { status: DisplayStatus; size?: number }) {
  const meta = STATUS[status]
  const base = { width: size, height: size, flex: 'none' as const }

  if (meta.shape === 'dashed-ring') {
    return (
      <span
        aria-hidden
        style={{ ...base, border: '1.5px dashed var(--idle)', borderRadius: '50%' }}
      />
    )
  }

  if (meta.shape === 'bars') {
    return (
      <span aria-hidden style={{ ...base, display: 'flex', gap: 3 }}>
        <span style={{ width: size / 3, height: size, background: meta.color, opacity: 0.7 }} />
        <span style={{ width: size / 3, height: size, background: meta.color, opacity: 0.7 }} />
      </span>
    )
  }

  const clip =
    meta.shape === 'octagon' ? OCTAGON : meta.shape === 'triangle' ? TRIANGLE : undefined

  return <span aria-hidden style={{ ...base, background: meta.color, clipPath: clip }} />
}
