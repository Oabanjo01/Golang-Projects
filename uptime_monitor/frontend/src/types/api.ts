/**
 * Wire types — these mirror the Go structs exactly, including snake_case field
 * names. Keeping the JSON shape identical on both sides means no mapping layer
 * and one less thing to drift; tag the Go structs `json:"interval_seconds"` etc.
 */

/** Matches the CHECK constraint on monitors.status in migrations/001_init.up.sql. */
export type MonitorStatus = 'PENDING' | 'UP' | 'PENDING_DOWN' | 'DOWN';

/**
 * What the UI renders. PAUSED is deliberately NOT a database status — the
 * schema models pausing as `is_active = false`, which keeps status meaning
 * "what did the last check say" and pausing meaning "should we check at all".
 * Those are independent facts, so they get independent columns. The UI folds
 * them into one label because a user thinks of it as one thing.
 */
export type DisplayStatus = MonitorStatus | 'PAUSED';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Monitor {
  id: string;
  user_id: string;
  name: string;
  url: string;
  interval_seconds: number;
  timeout_seconds: number;
  expected_status_code: number;
  failure_threshold: number;
  recovery_threshold: number;
  consecutive_failures: number;
  consecutive_successes: number;
  status: MonitorStatus;
  is_active: boolean;
  last_checked_at: string | null;
  next_check_at: string;
  created_at: string;
  updated_at: string;

  /**
   * Phase 2 fields. The engine that populates these does not exist yet, so the
   * Phase 1 API omits them entirely and the UI renders its "no data" states.
   * Optional rather than nullable so the compiler forces you to handle absence.
   */
  last_latency_ms?: number | null;
  uptime_24h?: number | null;
}

export interface CreateMonitorInput {
  name: string;
  url: string;
  interval_seconds: number;
  timeout_seconds: number;
  expected_status_code: number;
  failure_threshold: number;
}

export type UpdateMonitorInput = Partial<CreateMonitorInput> & {
  is_active?: boolean;
};

export interface Credentials {
  email: string;
  password: string;
}

/** Phase 2. Shapes are fixed now so the detail screen has something to compile against. */
export interface CheckLog {
  id: number;
  monitor_id: string;
  status_code: number | null;
  latency_ms: number;
  is_success: boolean;
  error_message: string | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  monitor_id: string;
  status: 'OPEN' | 'RESOLVED';
  cause: string;
  opened_at: string;
  resolved_at: string | null;
}
