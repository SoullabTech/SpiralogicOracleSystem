-- Database Optimization - Indexes, Partitioning, and Performance Tuning
-- Optimizes the memories table and related structures

-- Optimize memories table
CREATE INDEX IF NOT EXISTS idx_memories_user_element ON memories(user_id, element);
CREATE INDEX IF NOT EXISTS idx_memories_user_created_at ON memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_source_agent ON memories(source_agent);
CREATE INDEX IF NOT EXISTS idx_memories_confidence ON memories(confidence) WHERE confidence IS NOT NULL;

-- Full text search index for memory content
CREATE INDEX IF NOT EXISTS idx_memories_content_fts ON memories 
    USING GIN (to_tsvector('english', content));

-- JSON index for metadata searches
CREATE INDEX IF NOT EXISTS idx_memories_metadata ON memories USING GIN (metadata);

-- Symbols array index for theme analysis
CREATE INDEX IF NOT EXISTS idx_memories_symbols ON memories USING GIN (symbols);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_memories_user_element_created_at 
    ON memories(user_id, element, created_at DESC);

-- Partitioning for large datasets (optional - uncomment if needed)
-- CREATE TABLE memories_current PARTITION OF memories FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
-- CREATE TABLE memories_archive PARTITION OF memories FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- Performance settings (adjust based on your database configuration)
-- ALTER TABLE memories SET (fillfactor = 90);
-- ALTER TABLE event_log SET (fillfactor = 90);

-- Statistics optimization
ANALYZE memories;
ANALYZE event_log;

-- Vacuum and reindex for maintenance
-- VACUUM ANALYZE memories;
-- VACUUM ANALYZE event_log;