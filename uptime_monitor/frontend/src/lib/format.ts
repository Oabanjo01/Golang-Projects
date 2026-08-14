/** Formatters. Every one returns a placeholder rather than throwing on absent data. */

export function fmtInterval(seconds: number): string {
  return seconds < 60 ? `${seconds}s` : `${seconds / 60}m`
}

export function fmtAgo(iso: string | null | undefined): string {
  if (!iso) return '—'
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`
  return `${Math.round(secs / 3600)}h ago`
}

export function fmtDuration(fromIso: string, toIso?: string | null): string {
  const end = toIso ? new Date(toIso).getTime() : Date.now()
  const mins = Math.max(0, Math.round((end - new Date(fromIso).getTime()) / 60000))
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  return `${h}h ${mins % 60}m`
}

export function fmtLatency(ms: number | null | undefined): string {
  if (ms == null) return '—'
  return `${ms.toLocaleString()} ms`
}

/** Distinguishes "measured 0%" from "we have never checked this". */
export function fmtUptime(pct: number | null | undefined): string {
  if (pct == null) return 'no data'
  return `${pct.toFixed(2)}%`
}

export function fmtClock(d: Date = new Date()): string {
  return d.toLocaleTimeString([], { hour12: false })
}
