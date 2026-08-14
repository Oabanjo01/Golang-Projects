import type { DisplayStatus, Monitor } from '../types/api'

/**
 * Everything the design says about a status, in one table. Adding a state means
 * editing this file and nothing else.
 *
 * `shape` is the non-colour cue. This is a red/green product and roughly 8% of
 * men have some red/green colour deficiency, so colour is never the only signal
 * — every row carries a distinct silhouette AND a text label.
 */
export interface StatusMeta {
  label: string
  color: string
  tint: string
  shape: 'square' | 'triangle' | 'octagon' | 'dashed-ring' | 'bars'
  /** Severity sort. Broken things rise to the top of the list. */
  order: number
  /** Compact glyph for the detail-page badge. */
  glyph: string
}

export const OCTAGON =
  'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)'
export const TRIANGLE = 'polygon(50% 0,100% 100%,0 100%)'

export const STATUS: Record<DisplayStatus, StatusMeta> = {
  DOWN: {
    label: 'DOWN',
    color: 'var(--down)',
    tint: 'var(--down-tint)',
    shape: 'octagon',
    order: 0,
    glyph: '⬢',
  },
  PENDING_DOWN: {
    label: 'FAILING',
    color: 'var(--warn)',
    tint: 'var(--warn-tint)',
    shape: 'triangle',
    order: 1,
    glyph: '▲',
  },
  PENDING: {
    label: 'PENDING',
    color: 'var(--idle)',
    tint: 'var(--idle-tint)',
    shape: 'dashed-ring',
    order: 2,
    glyph: '◌',
  },
  UP: {
    label: 'UP',
    color: 'var(--up)',
    tint: 'var(--up-tint)',
    shape: 'square',
    order: 3,
    glyph: '■',
  },
  PAUSED: {
    label: 'PAUSED',
    color: 'var(--idle)',
    tint: 'var(--idle-tint)',
    shape: 'bars',
    order: 4,
    glyph: '❙❙',
  },
}

/** Folds the schema's two independent facts (status + is_active) into one label. */
export function displayStatus(m: Monitor): DisplayStatus {
  return m.is_active ? m.status : 'PAUSED'
}

/**
 * FAILING carries its live count, so it can never be mistaken for DOWN —
 * "FAILING 2/3" tells you an incident has not opened yet.
 */
export function statusLabel(m: Monitor): string {
  const s = displayStatus(m)
  if (s === 'PENDING_DOWN') {
    return `FAILING ${m.consecutive_failures}/${m.failure_threshold}`
  }
  return STATUS[s].label
}

export function bySeverity(a: Monitor, b: Monitor): number {
  const d = STATUS[displayStatus(a)].order - STATUS[displayStatus(b)].order
  return d !== 0 ? d : a.name.localeCompare(b.name)
}