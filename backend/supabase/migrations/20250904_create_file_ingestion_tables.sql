-- Maya File Ingestion System - Complete Migration
-- Creates all tables needed for file upload, processing, embeddings, and citations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Main user files table
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Content and processing
    content TEXT,
    summary TEXT,
    key_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    emotional_tone TEXT,
    elemental_resonance TEXT,
    
    -- Vector embedding for semantic search
    embedding VECTOR(1536),
    
    -- Metadata includes pages, sections, processing info
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT user_files_user_id_file_name_key UNIQUE(user_id, file_name)
);

-- 2. File chunks table (for large files split into pieces)
CREATE TABLE IF NOT EXISTS file_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Chunk details
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    
    -- Location within document
    start_char INTEGER,
    end_char INTEGER,
    page_number INTEGER,
    section_title TEXT,
    
    -- Vector embedding for this chunk
    embedding VECTOR(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT file_chunks_file_chunk_unique UNIQUE(file_id, chunk_index)
);

-- 3. File citations table (tracks when files are referenced)
CREATE TABLE IF NOT EXISTS file_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    -- Citation context
    cited_in_context TEXT, -- What conversation/query led to this citation
    page_number INTEGER,
    section_title TEXT,
    snippet TEXT,
    confidence REAL DEFAULT 0.0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User memory updates (track when files affect memory)
CREATE TABLE IF NOT EXISTS user_memory_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    update_type TEXT NOT NULL, -- 'file_upload', 'file_delete', 'citation'
    context JSONB DEFAULT '{}'::JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Processing queue table (track ingestion jobs)
CREATE TABLE IF NOT EXISTS ingestion_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    file_id UUID REFERENCES user_files(id) ON DELETE CASCADE,
    
    -- Job details
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    job_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_embedding ON user_files USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_user_files_tags ON user_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_chunks_file_id ON file_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_file_chunks_embedding ON file_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_file_chunks_page ON file_chunks(page_number);

CREATE INDEX IF NOT EXISTS idx_file_citations_file_id ON file_citations(file_id);
CREATE INDEX IF NOT EXISTS idx_file_citations_user_id ON file_citations(user_id);
CREATE INDEX IF NOT EXISTS idx_file_citations_created_at ON file_citations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_updates_user_id ON user_memory_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_updates_timestamp ON user_memory_updates(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_queue_status ON ingestion_queue(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_queue_user_id ON ingestion_queue(user_id);

-- Create updated_at trigger for user_files
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_files_updated_at 
    BEFORE UPDATE ON user_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RPC Functions for semantic search

-- Function to search files by embedding similarity
CREATE OR REPLACE FUNCTION match_file_embeddings(
    query_embedding VECTOR(1536),
    match_threshold REAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 5,
    target_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    content TEXT,
    summary TEXT,
    key_topics TEXT[],
    emotional_tone TEXT,
    elemental_resonance TEXT,
    similarity REAL,
    created_at TIMESTAMPTZ,
    metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
    SELECT 
        uf.id,
        uf.file_name,
        uf.content,
        uf.summary,
        uf.key_topics,
        uf.emotional_tone,
        uf.elemental_resonance,
        1 - (uf.embedding <=> query_embedding) AS similarity,
        uf.created_at,
        uf.metadata
    FROM user_files uf
    WHERE 
        uf.embedding IS NOT NULL
        AND (target_user_id IS NULL OR uf.user_id = target_user_id)
        AND 1 - (uf.embedding <=> query_embedding) > match_threshold
    ORDER BY uf.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to search file chunks by embedding similarity  
CREATE OR REPLACE FUNCTION match_file_chunks(
    query_embedding VECTOR(1536),
    match_threshold REAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 10,
    target_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    file_id UUID,
    file_name TEXT,
    content TEXT,
    page_number INTEGER,
    section_title TEXT,
    similarity REAL,
    chunk_index INTEGER,
    metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
    SELECT 
        fc.id,
        fc.file_id,
        uf.file_name,
        fc.content,
        fc.page_number,
        fc.section_title,
        1 - (fc.embedding <=> query_embedding) AS similarity,
        fc.chunk_index,
        fc.metadata
    FROM file_chunks fc
    JOIN user_files uf ON fc.file_id = uf.id
    WHERE 
        fc.embedding IS NOT NULL
        AND (target_user_id IS NULL OR fc.user_id = target_user_id)
        AND 1 - (fc.embedding <=> query_embedding) > match_threshold
    ORDER BY fc.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to get file statistics for a user
CREATE OR REPLACE FUNCTION get_file_stats(target_user_id TEXT)
RETURNS TABLE (
    total_files BIGINT,
    processed_files BIGINT,
    total_size BIGINT,
    recent_uploads BIGINT,
    top_topics TEXT[]
)
LANGUAGE SQL STABLE
AS $$
    SELECT 
        COUNT(*)::BIGINT as total_files,
        COUNT(CASE WHEN content IS NOT NULL AND embedding IS NOT NULL THEN 1 END)::BIGINT as processed_files,
        COALESCE(SUM(file_size), 0)::BIGINT as total_size,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END)::BIGINT as recent_uploads,
        (
            SELECT ARRAY_AGG(DISTINCT topic) 
            FROM (
                SELECT UNNEST(key_topics) as topic 
                FROM user_files 
                WHERE user_id = target_user_id 
                AND key_topics IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 50
            ) topics
            LIMIT 10
        ) as top_topics
    FROM user_files 
    WHERE user_id = target_user_id;
$$;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_chunks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE file_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_queue ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can manage their own files" ON user_files
    FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own chunks" ON file_chunks
    FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own citations" ON file_citations
    FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own memory updates" ON user_memory_updates
    FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage their own ingestion jobs" ON ingestion_queue
    FOR ALL USING (auth.uid()::TEXT = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON file_chunks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON file_citations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_memory_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ingestion_queue TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION match_file_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION match_file_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION get_file_stats TO authenticated;

-- Sample data for testing (optional - remove for production)
-- INSERT INTO user_files (
--     user_id, file_name, file_path, file_type, file_size,
--     content, summary, key_topics, emotional_tone, elemental_resonance
-- ) VALUES (
--     'demo-user-123',
--     'flow-states-research.pdf',
--     'demo-user-123/flow-states-research.pdf',
--     'application/pdf',
--     156789,
--     'Flow states represent the optimal experience where individuals become fully absorbed in activities...',
--     'Research on optimal psychological states during peak performance',
--     ARRAY['flow states', 'peak performance', 'psychology'],
--     'contemplative',
--     'water'
-- );

-- Migration completion log
INSERT INTO user_memory_updates (user_id, update_type, context)
VALUES ('system', 'migration', '{"migration": "file_ingestion_system", "timestamp": "' || NOW() || '"}');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Maya File Ingestion System migration completed successfully!';
    RAISE NOTICE 'Tables created: user_files, file_chunks, file_citations, user_memory_updates, ingestion_queue';
    RAISE NOTICE 'RPC functions available: match_file_embeddings, match_file_chunks, get_file_stats';
    RAISE NOTICE 'Ready for file uploads and semantic search!';
END
$$;