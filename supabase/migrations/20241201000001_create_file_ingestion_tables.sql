-- Create file ingestion tables for Maya's knowledge library
-- Migration: 20241201000001_create_file_ingestion_tables

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- File metadata storage
CREATE TABLE user_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'reference' CHECK (category IN ('journal', 'reference', 'wisdom', 'personal')),
  tags TEXT[] DEFAULT '{}',
  emotional_weight DECIMAL(3,2) DEFAULT 0.5 CHECK (emotional_weight >= 0 AND emotional_weight <= 1),
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  maya_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File content chunks with embeddings
CREATE TABLE file_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}', -- Page number, section, etc
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, chunk_index)
);

-- Track file citations in conversations
CREATE TABLE file_citations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
  conversation_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cited_chunk_id UUID REFERENCES file_embeddings(id) ON DELETE SET NULL,
  relevance_score DECIMAL(5,4),
  context TEXT, -- How Maya used it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_status ON user_files(status);
CREATE INDEX idx_user_files_category ON user_files(category);
CREATE INDEX idx_user_files_created_at ON user_files(created_at DESC);

CREATE INDEX idx_file_embeddings_user ON file_embeddings(user_id);
CREATE INDEX idx_file_embeddings_file ON file_embeddings(file_id);
CREATE INDEX idx_file_embeddings_vector ON file_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_file_citations_file ON file_citations(file_id);
CREATE INDEX idx_file_citations_user ON file_citations(user_id);
CREATE INDEX idx_file_citations_conversation ON file_citations(conversation_id);
CREATE INDEX idx_file_citations_created_at ON file_citations(created_at DESC);

-- Updated at trigger for user_files
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

-- RLS (Row Level Security) policies
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_citations ENABLE ROW LEVEL SECURITY;

-- User can only access their own files
CREATE POLICY "Users can manage their own files" ON user_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own file embeddings" ON file_embeddings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own file citations" ON file_citations
  FOR ALL USING (auth.uid() = user_id);

-- Function to search file embeddings by similarity
CREATE OR REPLACE FUNCTION match_file_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE(
  id uuid,
  file_id uuid,
  content text,
  similarity float,
  metadata jsonb,
  filename text,
  category text,
  chunk_index integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.id,
    fe.file_id,
    fe.content,
    1 - (fe.embedding <=> query_embedding) AS similarity,
    fe.metadata,
    uf.filename,
    uf.category,
    fe.chunk_index
  FROM file_embeddings fe
  JOIN user_files uf ON fe.file_id = uf.id
  WHERE 
    fe.user_id = match_file_embeddings.user_id
    AND uf.status = 'ready'
    AND 1 - (fe.embedding <=> query_embedding) > match_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get file statistics
CREATE OR REPLACE FUNCTION get_file_stats(target_user_id uuid)
RETURNS TABLE(
  total_files bigint,
  ready_files bigint,
  processing_files bigint,
  total_chunks bigint,
  categories jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_files,
    COUNT(*) FILTER (WHERE status = 'ready') as ready_files,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_files,
    (SELECT COUNT(*) FROM file_embeddings WHERE user_id = target_user_id) as total_chunks,
    jsonb_object_agg(category, category_count) as categories
  FROM (
    SELECT 
      category,
      COUNT(*) as category_count,
      status
    FROM user_files 
    WHERE user_id = target_user_id
    GROUP BY category, status
  ) grouped
  WHERE grouped.category IS NOT NULL;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE user_files IS 'Stores metadata for user-uploaded files in Maya system';
COMMENT ON TABLE file_embeddings IS 'Vectorized chunks of file content for semantic search';
COMMENT ON TABLE file_citations IS 'Tracks when and how Maya references uploaded files in conversations';
COMMENT ON FUNCTION match_file_embeddings IS 'Semantic similarity search across user file embeddings';
COMMENT ON FUNCTION get_file_stats IS 'Get comprehensive statistics about user file library';