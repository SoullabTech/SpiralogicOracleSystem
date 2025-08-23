-- File uploads system with transcription support

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policy: users can only access their own files
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Uploads metadata table
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text,
  file_name text NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint,
  transcript jsonb,
  summary text,
  status text NOT NULL DEFAULT 'uploaded', -- uploaded|processing|ready|error
  error text,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for uploads table
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads" ON uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" ON uploads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" ON uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_created ON uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_conversation ON uploads(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);

-- Helper view for user uploads
CREATE OR REPLACE VIEW v_user_uploads AS
  SELECT 
    id, 
    conversation_id,
    file_name, 
    file_type, 
    size_bytes, 
    status, 
    CASE 
      WHEN transcript IS NOT NULL THEN true 
      ELSE false 
    END as has_transcript,
    summary,
    created_at,
    updated_at
  FROM uploads
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION touch_uploads_updated_at()
RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_uploads_updated_at ON uploads;
CREATE TRIGGER trg_touch_uploads_updated_at
  BEFORE UPDATE ON uploads
  FOR EACH ROW EXECUTE PROCEDURE touch_uploads_updated_at();

-- Function to get recent upload context for a user
CREATE OR REPLACE FUNCTION get_user_upload_context(p_user_id uuid, p_limit int DEFAULT 5)
RETURNS TABLE (
  id uuid,
  file_name text,
  file_type text,
  transcript_text text,
  summary text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.file_name,
    u.file_type,
    (u.transcript->>'text')::text as transcript_text,
    u.summary,
    u.created_at
  FROM uploads u
  WHERE u.user_id = p_user_id 
    AND u.status = 'ready'
    AND (u.transcript IS NOT NULL OR u.summary IS NOT NULL)
  ORDER BY u.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;