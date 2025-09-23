-- Create tables for handling uploaded content if they don't exist

-- User documents table for general uploads
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  content_preview TEXT,
  full_content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio transcripts table
CREATE TABLE IF NOT EXISTS audio_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  audio_data TEXT, -- Base64 encoded audio or URL
  transcript TEXT,
  status TEXT DEFAULT 'pending_transcription',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- User transcripts table for processed transcripts
CREATE TABLE IF NOT EXISTS user_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT,
  insights JSONB,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data imports table for tracking imported data
CREATE TABLE IF NOT EXISTS data_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  data_type TEXT,
  record_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON user_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_user_id ON audio_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_status ON audio_transcripts(status);
CREATE INDEX IF NOT EXISTS idx_user_transcripts_user_id ON user_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_user_id ON data_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_data_type ON data_imports(data_type);

-- Add RLS policies
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

-- Policies for user_documents
CREATE POLICY "Users can view their own documents" ON user_documents
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own documents" ON user_documents
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can update their own documents" ON user_documents
  FOR UPDATE USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- Policies for audio_transcripts
CREATE POLICY "Users can view their own audio transcripts" ON audio_transcripts
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own audio transcripts" ON audio_transcripts
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- Policies for user_transcripts
CREATE POLICY "Users can view their own transcripts" ON user_transcripts
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own transcripts" ON user_transcripts
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- Policies for data_imports
CREATE POLICY "Users can view their own imports" ON data_imports
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert their own imports" ON data_imports
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for user_documents
CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();