-- Event Sourcing Table for Domain Events
-- Stores all domain events for the Soul Memory System

CREATE TABLE IF NOT EXISTS event_log (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate_id ON event_log(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(type);
CREATE INDEX IF NOT EXISTS idx_event_log_created_at ON event_log(created_at);
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate_type ON event_log(aggregate_type);

-- Composite index for aggregate event ordering
CREATE INDEX IF NOT EXISTS idx_event_log_aggregate_version 
    ON event_log(aggregate_id, (metadata->>'version'));

-- Enable Row Level Security
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access events for their own data
CREATE POLICY event_log_user_policy ON event_log
    USING ((metadata->>'userId') = auth.uid()::text);

-- Grant permissions
GRANT ALL ON event_log TO authenticated;
GRANT ALL ON event_log TO service_role;