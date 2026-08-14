-- We create users first, monitor references it (user ids)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL CONSTRAINT uq_users_email UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- References users; referenced by check_logs and incidents.
CREATE TABLE monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    timeout_seconds INT NOT NULL DEFAULT 10 
        CONSTRAINT chk_monitors_timeout CHECK (timeout_seconds >= 1),
    interval_seconds INT NOT NULL DEFAULT 60 
        CONSTRAINT chk_monitors_interval CHECK (interval_seconds >= 10),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CONSTRAINT chk_monitors_status CHECK (status IN ('PENDING', 'UP', 'DOWN', 'PENDING_DOWN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    consecutive_failures INT NOT NULL DEFAULT 0 
        CONSTRAINT chk_monitors_consecutive_failures CHECK (consecutive_failures >= 0),
    consecutive_successes INT NOT NULL DEFAULT 0 
        CONSTRAINT chk_monitors_consecutive_successes CHECK (consecutive_successes >= 0),
    failure_threshold INT NOT NULL DEFAULT 3 
        CONSTRAINT chk_monitors_failure_threshold CHECK (failure_threshold >= 1),
    recovery_threshold INT NOT NULL DEFAULT 2 
        CONSTRAINT chk_monitors_recovery_threshold CHECK (recovery_threshold >= 1),
    next_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_status_code INT NOT NULL DEFAULT 200 
        CONSTRAINT chk_monitors_expected_status CHECK (expected_status_code BETWEEN 100 AND 599),
    CONSTRAINT chk_monitors_timeout_fits CHECK (timeout_seconds < interval_seconds)
);

-- -- High-write append-only table storing historical ping results.
CREATE TABLE check_logs (
    id BIGSERIAL PRIMARY KEY,
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status_code INT,
    latency_ms INT,
    error_message TEXT,
    is_success BOOLEAN NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tracks downtime events from failure trigger to recovery.
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
        CONSTRAINT chk_incident_status CHECK (status IN ('RESOLVED', 'OPEN')),
    cause TEXT
);

CREATE INDEX idx_monitors_users_id ON monitors(user_id);
CREATE INDEX idx_monitors_next_check ON monitors(next_check_at) WHERE is_active = TRUE;
CREATE INDEX idx_check_logs_monitor_checked ON check_logs(monitor_id, checked_at DESC);
CREATE INDEX idx_incidents_monitor_id ON incidents(monitor_id);
CREATE UNIQUE INDEX idx_incident_monitor ON incidents(monitor_id) WHERE status = 'OPEN'