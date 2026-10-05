SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS threat_logs (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    prompt TEXT,
    system_instruction TEXT,
    conversation_history JSONB,
    client_ip TEXT,
    application_id TEXT,
    target_model TEXT,
    decision TEXT NOT NULL,
    layer TEXT,
    trigger_label TEXT,
    detected_patterns TEXT[],
    layer_scores JSONB,
    rationale TEXT,
    output_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    latency_ms DOUBLE PRECISION,
    http_status INTEGER
);

CREATE INDEX IF NOT EXISTS idx_threat_logs_created ON threat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_logs_decision ON threat_logs (decision);
CREATE INDEX IF NOT EXISTS idx_threat_logs_patterns ON threat_logs USING GIN (detected_patterns);

CREATE TABLE IF NOT EXISTS firewall_rules (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rule_type TEXT NOT NULL,
    pattern TEXT NOT NULL,
    category TEXT,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    source TEXT NOT NULL DEFAULT 'MANUAL',
    suggestion_id UUID
);

CREATE TABLE IF NOT EXISTS hourly_metrics (
    hour_start TIMESTAMPTZ PRIMARY KEY,
    inspected INTEGER NOT NULL DEFAULT 0,
    allowed INTEGER NOT NULL DEFAULT 0,
    blocked INTEGER NOT NULL DEFAULT 0,
    redacted INTEGER NOT NULL DEFAULT 0,
    throttled INTEGER NOT NULL DEFAULT 0,
    layer_1_blocks INTEGER NOT NULL DEFAULT 0,
    layer_2_blocks INTEGER NOT NULL DEFAULT 0,
    layer_3_blocks INTEGER NOT NULL DEFAULT 0,
    output_flags INTEGER NOT NULL DEFAULT 0,
    rate_limit_events INTEGER NOT NULL DEFAULT 0,
    anomaly_events INTEGER NOT NULL DEFAULT 0,
    avg_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB
);

CREATE TABLE IF NOT EXISTS rule_suggestions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING',
    pattern TEXT NOT NULL,
    pattern_type TEXT NOT NULL DEFAULT 'KEYWORD',
    category TEXT,
    occurrence_count INTEGER NOT NULL DEFAULT 0,
    window_hours INTEGER NOT NULL DEFAULT 24,
    sample_prompt TEXT,
    rationale TEXT,
    accepted_rule_id UUID
);

CREATE TABLE IF NOT EXISTS runtime_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""
