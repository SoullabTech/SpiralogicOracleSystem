-- Maya File Ingestion System
-- Tables for file upload, processing, and memory integration

-- Enable the pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- User Files table - tracks uploaded files and metadata
CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Email from NextAuth
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- File categorization
  category TEXT DEFAULT 'reference' CHECK (category IN ('journal', 'reference', 'wisdom', 'personal')),
  tags TEXT[] DEFAULT '{}',
  emotional_weight REAL DEFAULT 0.5 CHECK (emotional_weight >= 0 AND emotional_weight <= 1),
  
  -- Processing status
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  upload_status TEXT DEFAULT 'uploaded',
  processing_status TEXT DEFAULT 'pending',
  processing_notes TEXT,
  
  -- Content preview
  text_preview TEXT,
  total_chunks INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX (user_id),
  INDEX (status),
  INDEX (category),
  INDEX (created_at DESC)
);

-- File Embeddings table - searchable chunks for Maya's memory
CREATE TABLE IF NOT EXISTS file_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Chunk information
  chunk_index INTEGER NOT NULL,
  text_content TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  start_index INTEGER,
  end_index INTEGER,
  
  -- Vector embedding for semantic search
  embedding vector(1536) NOT NULL, -- text-embedding-3-small dimensions
  
  -- Memory weighting for retrieval
  relevance_score REAL DEFAULT 1.0,
  emotional_resonance REAL DEFAULT 0.5,
  access_frequency INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast retrieval
  INDEX (file_id),
  INDEX (user_id),
  INDEX (chunk_index),
  INDEX (created_at DESC),
  INDEX (access_frequency DESC),
  INDEX (last_accessed_at DESC)
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS file_embeddings_embedding_cosine_idx 
  ON file_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- File Access Log - tracks when Maya references files
CREATE TABLE IF NOT EXISTS file_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_id UUID NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
  embedding_id UUID REFERENCES file_embeddings(id) ON DELETE SET NULL,
  
  -- Access context
  conversation_id TEXT,
  access_type TEXT DEFAULT 'retrieval' CHECK (access_type IN ('retrieval', 'citation', 'reflection')),
  relevance_score REAL,
  context_snippet TEXT,
  
  -- Timestamps
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX (user_id),
  INDEX (file_id),
  INDEX (conversation_id),
  INDEX (accessed_at DESC)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_files_updated_at 
  BEFORE UPDATE ON user_files 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_file_embeddings_updated_at 
  BEFORE UPDATE ON file_embeddings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to increment access frequency
CREATE OR REPLACE FUNCTION increment_access_frequency(embedding_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE file_embeddings 
  SET 
    access_frequency = access_frequency + 1,
    last_accessed_at = NOW()
  WHERE id = embedding_uuid;
END;
$$ LANGUAGE plpgsql;

-- Storage bucket policies (run these in Supabase dashboard)
/*
-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public) VALUES ('maya-files', 'maya-files', false);

-- Policy to allow users to upload their own files
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'maya-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to read their own files  
CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'maya-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow service role to manage all files
CREATE POLICY "Service role can manage all files" ON storage.objects
  FOR ALL USING (bucket_id = 'maya-files');
*/

-- Row Level Security policies
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_log ENABLE ROW LEVEL SECURITY;

-- Users can only access their own files
CREATE POLICY "Users can manage their own files" ON user_files
  FOR ALL USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can access their own embeddings" ON file_embeddings
  FOR ALL USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can view their own access logs" ON file_access_log
  FOR SELECT USING (user_id = auth.jwt() ->> 'email');

-- Service role bypasses RLS
CREATE POLICY "Service role full access" ON user_files
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON file_embeddings
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON file_access_log
  FOR ALL TO service_role USING (true);