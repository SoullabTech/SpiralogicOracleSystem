-- supabase/migrations/20250418_create_insight_history.sql

-- Create insight_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS insight_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS insight_history_user_id_idx ON insight_history(user_id);
CREATE INDEX IF NOT EXISTS insight_history_type_idx ON insight_history(insight_type);
CREATE INDEX IF NOT EXISTS insight_history_created_at_idx ON insight_history(created_at);

-- Enable RLS
ALTER TABLE insight_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own insights"
ON insight_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Backend service can insert insights"
ON insight_history
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own insights"
ON insight_history
FOR DELETE
USING (auth.uid() = user_id);