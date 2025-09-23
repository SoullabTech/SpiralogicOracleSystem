-- Export tracking and job management tables

-- Track export jobs and their outcomes
CREATE TABLE export_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL, -- 'obsidian_export', 'manual_export', etc.
    export_type VARCHAR(50) NOT NULL, -- 'nightly_batch', 'single_session', 'custom_range'

    -- Job execution details
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),

    -- Export statistics
    total_sessions INTEGER DEFAULT 0,
    successful_exports INTEGER DEFAULT 0,
    failed_exports INTEGER DEFAULT 0,

    -- Configuration
    vault_path TEXT,
    date_range_start TIMESTAMPTZ,
    date_range_end TIMESTAMPTZ,

    -- Results and errors
    export_summary JSONB, -- Summary of what was exported
    error_details TEXT,

    -- Metadata
    triggered_by VARCHAR(50), -- 'cron', 'manual', 'api', 'auto'
    system_info JSONB, -- System details for debugging

    INDEX idx_export_jobs_type_status (job_type, status, started_at DESC),
    INDEX idx_export_jobs_completed (completed_at DESC) WHERE completed_at IS NOT NULL
);

-- Track individual session exports within jobs
CREATE TABLE session_exports (
    id BIGSERIAL PRIMARY KEY,
    export_job_id BIGINT REFERENCES export_jobs(id) ON DELETE CASCADE,

    -- Session details
    session_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    session_created_at TIMESTAMPTZ NOT NULL,

    -- Export details
    exported_at TIMESTAMPTZ DEFAULT NOW(),
    export_status VARCHAR(20) DEFAULT 'pending' CHECK (export_status IN ('pending', 'success', 'failed', 'skipped')),

    -- File paths
    markdown_path TEXT,
    canvas_path TEXT,

    -- Export metadata
    file_size_bytes INTEGER,
    export_duration_ms INTEGER,
    error_message TEXT,

    -- Session data snapshot
    risk_level VARCHAR(20),
    safety_events_count INTEGER DEFAULT 0,
    breakthroughs_count INTEGER DEFAULT 0,
    coherence_score DECIMAL(5,3),

    INDEX idx_session_exports_job (export_job_id, exported_at DESC),
    INDEX idx_session_exports_session (session_id),
    INDEX idx_session_exports_user (user_id, exported_at DESC)
);

-- Track vault synchronization status
CREATE TABLE vault_sync_status (
    id BIGSERIAL PRIMARY KEY,
    vault_path TEXT NOT NULL,

    -- Sync tracking
    last_sync_at TIMESTAMPTZ,
    last_successful_sync_at TIMESTAMPTZ,
    total_syncs INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    failed_syncs INTEGER DEFAULT 0,

    -- Content statistics
    total_sessions_in_vault INTEGER DEFAULT 0,
    total_files_created INTEGER DEFAULT 0,
    vault_size_bytes BIGINT DEFAULT 0,

    -- Health monitoring
    sync_health_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    last_health_check TIMESTAMPTZ DEFAULT NOW(),
    issues JSONB DEFAULT '[]', -- Array of current issues

    -- Configuration
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_frequency_hours INTEGER DEFAULT 24,
    retention_days INTEGER DEFAULT 365,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(vault_path)
);

-- Track exported files for cleanup and management
CREATE TABLE exported_files (
    id BIGSERIAL PRIMARY KEY,
    session_export_id BIGINT REFERENCES session_exports(id) ON DELETE CASCADE,

    -- File details
    file_path TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('markdown', 'canvas', 'index', 'digest')),
    file_size_bytes INTEGER,

    -- Content metadata
    session_id VARCHAR(255),
    user_id UUID,
    risk_level VARCHAR(20),

    -- File lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,

    -- Cleanup tracking
    marked_for_deletion BOOLEAN DEFAULT FALSE,
    deletion_scheduled_for TIMESTAMPTZ,

    INDEX idx_exported_files_path (file_path),
    INDEX idx_exported_files_session (session_id),
    INDEX idx_exported_files_type (file_type, created_at DESC),
    INDEX idx_exported_files_cleanup (marked_for_deletion, deletion_scheduled_for) WHERE marked_for_deletion = TRUE
);

-- Export configuration and preferences
CREATE TABLE export_configurations (
    id BIGSERIAL PRIMARY KEY,
    config_name VARCHAR(100) NOT NULL UNIQUE,

    -- Target configuration
    vault_path TEXT NOT NULL,
    export_format JSONB DEFAULT '{"markdown": true, "canvas": true, "index": true}',

    -- Scheduling
    schedule_enabled BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(100), -- Cron expression
    schedule_timezone VARCHAR(50) DEFAULT 'UTC',

    -- Content filters
    include_risk_levels VARCHAR(50)[] DEFAULT ARRAY['none', 'moderate', 'high', 'crisis'],
    exclude_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
    minimum_session_duration_minutes INTEGER DEFAULT 0,

    -- Export options
    include_user_data BOOLEAN DEFAULT TRUE,
    include_conversation_content BOOLEAN DEFAULT FALSE, -- Privacy setting
    anonymize_user_ids BOOLEAN DEFAULT TRUE,
    generate_weekly_digest BOOLEAN DEFAULT TRUE,
    generate_canvas_maps BOOLEAN DEFAULT TRUE,

    -- Retention and cleanup
    auto_cleanup_enabled BOOLEAN DEFAULT FALSE,
    retention_days INTEGER DEFAULT 365,
    max_vault_size_gb INTEGER DEFAULT 10,

    -- Notifications
    notify_on_completion BOOLEAN DEFAULT FALSE,
    notify_on_failure BOOLEAN DEFAULT TRUE,
    notification_email TEXT,
    notification_webhook TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID, -- Admin user who created config

    INDEX idx_export_configs_schedule (schedule_enabled, schedule_cron) WHERE schedule_enabled = TRUE
);

-- Insert default configuration
INSERT INTO export_configurations (
    config_name,
    vault_path,
    schedule_enabled,
    schedule_cron,
    generate_weekly_digest,
    generate_canvas_maps,
    anonymize_user_ids
) VALUES (
    'default_nightly',
    COALESCE(current_setting('app.obsidian_vault_path', true), './obsidian-vault'),
    TRUE,
    '0 2 * * *', -- 2 AM daily
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (config_name) DO NOTHING;

-- Function to update vault sync status
CREATE OR REPLACE FUNCTION update_vault_sync_status(
    p_vault_path TEXT,
    p_success BOOLEAN,
    p_sessions_count INTEGER DEFAULT 0,
    p_files_created INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO vault_sync_status (
        vault_path,
        last_sync_at,
        last_successful_sync_at,
        total_syncs,
        successful_syncs,
        failed_syncs,
        total_sessions_in_vault,
        total_files_created
    ) VALUES (
        p_vault_path,
        NOW(),
        CASE WHEN p_success THEN NOW() ELSE NULL END,
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        p_sessions_count,
        p_files_created
    )
    ON CONFLICT (vault_path)
    DO UPDATE SET
        last_sync_at = NOW(),
        last_successful_sync_at = CASE
            WHEN p_success THEN NOW()
            ELSE vault_sync_status.last_successful_sync_at
        END,
        total_syncs = vault_sync_status.total_syncs + 1,
        successful_syncs = vault_sync_status.successful_syncs + CASE WHEN p_success THEN 1 ELSE 0 END,
        failed_syncs = vault_sync_status.failed_syncs + CASE WHEN p_success THEN 0 ELSE 1 END,
        total_sessions_in_vault = GREATEST(vault_sync_status.total_sessions_in_vault, p_sessions_count),
        total_files_created = vault_sync_status.total_files_created + p_files_created,
        sync_health_score = CASE
            WHEN p_success THEN LEAST(1.0, vault_sync_status.sync_health_score + 0.1)
            ELSE GREATEST(0.0, vault_sync_status.sync_health_score - 0.2)
        END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to start an export job
CREATE OR REPLACE FUNCTION start_export_job(
    p_job_type VARCHAR(50),
    p_export_type VARCHAR(50),
    p_triggered_by VARCHAR(50) DEFAULT 'manual',
    p_vault_path TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    job_id BIGINT;
BEGIN
    INSERT INTO export_jobs (
        job_type,
        export_type,
        triggered_by,
        vault_path,
        system_info
    ) VALUES (
        p_job_type,
        p_export_type,
        p_triggered_by,
        p_vault_path,
        jsonb_build_object(
            'started_at', NOW(),
            'server_version', current_setting('server_version'),
            'timezone', current_setting('timezone')
        )
    ) RETURNING id INTO job_id;

    RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete an export job
CREATE OR REPLACE FUNCTION complete_export_job(
    p_job_id BIGINT,
    p_status VARCHAR(20),
    p_total_sessions INTEGER DEFAULT 0,
    p_successful_exports INTEGER DEFAULT 0,
    p_failed_exports INTEGER DEFAULT 0,
    p_error_details TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE export_jobs SET
        completed_at = NOW(),
        status = p_status,
        total_sessions = p_total_sessions,
        successful_exports = p_successful_exports,
        failed_exports = p_failed_exports,
        error_details = p_error_details,
        export_summary = jsonb_build_object(
            'duration_seconds', EXTRACT(EPOCH FROM (NOW() - started_at)),
            'success_rate', CASE
                WHEN p_total_sessions > 0 THEN p_successful_exports::DECIMAL / p_total_sessions
                ELSE 0
            END,
            'completed_at', NOW()
        )
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old export jobs (keep last 100 jobs)
CREATE OR REPLACE FUNCTION cleanup_old_export_jobs() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH old_jobs AS (
        SELECT id FROM export_jobs
        ORDER BY started_at DESC
        OFFSET 100
    )
    DELETE FROM export_jobs
    WHERE id IN (SELECT id FROM old_jobs);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_export_jobs_composite ON export_jobs (job_type, status, started_at DESC);
CREATE INDEX CONCURRENTLY idx_session_exports_composite ON session_exports (export_job_id, export_status, exported_at DESC);
CREATE INDEX CONCURRENTLY idx_exported_files_composite ON exported_files (file_type, created_at DESC, file_size_bytes);

-- Set up row level security (if needed)
-- ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE session_exports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vault_sync_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exported_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE export_configurations ENABLE ROW LEVEL SECURITY;