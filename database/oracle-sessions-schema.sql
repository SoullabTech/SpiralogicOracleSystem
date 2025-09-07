-- Oracle Sessions Table Schema for Temporal Buffer Persistence
-- Run this in your Supabase SQL editor

-- Drop existing table if needed (careful in production!)
-- DROP TABLE IF EXISTS oracle_sessions CASCADE;

-- Create oracle_sessions table
CREATE TABLE oracle_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  
  -- Store stage outputs as JSONB for flexible querying
  stages JSONB DEFAULT '[]'::jsonb,
  
  -- Store elemental insights
  elements JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  mode TEXT DEFAULT 'cascade',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexing for performance
  UNIQUE(session_id)
);

-- Create indexes for common queries
CREATE INDEX idx_oracle_sessions_user_id ON oracle_sessions(user_id);
CREATE INDEX idx_oracle_sessions_created_at ON oracle_sessions(created_at DESC);
CREATE INDEX idx_oracle_sessions_elements ON oracle_sessions USING GIN (elements);
CREATE INDEX idx_oracle_sessions_query_text ON oracle_sessions USING GIN (to_tsvector('english', query));

-- Row Level Security (RLS)
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON oracle_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON oracle_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_oracle_sessions_updated_at 
  BEFORE UPDATE ON oracle_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for pattern analysis
CREATE OR REPLACE VIEW oracle_patterns AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  
  -- Extract dominant elements
  (SELECT key 
   FROM jsonb_each_text(elements) 
   ORDER BY length(value) DESC 
   LIMIT 1) as dominant_element,
  
  -- Common query themes (simplified)
  array_agg(DISTINCT substring(query from '\y(\w{6,})\y')) as key_words,
  
  -- Temporal patterns
  MIN(created_at) as first_session,
  MAX(created_at) as last_session,
  
  -- Activity frequency
  CASE 
    WHEN MAX(created_at) > NOW() - INTERVAL '7 days' THEN 'active'
    WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 'recent'
    ELSE 'dormant'
  END as activity_status
  
FROM oracle_sessions
GROUP BY user_id;

-- Create function for finding similar sessions (for recommendation)
CREATE OR REPLACE FUNCTION find_similar_sessions(
  target_query TEXT,
  target_user_id TEXT,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  session_id TEXT,
  query TEXT,
  response TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.session_id,
    os.query,
    os.response,
    similarity(os.query, target_query) as similarity
  FROM oracle_sessions os
  WHERE 
    os.user_id = target_user_id
    AND os.query != target_query
  ORDER BY similarity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create aggregation function for elemental balance
CREATE OR REPLACE FUNCTION get_elemental_balance(target_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(
    element,
    count
  ) INTO result
  FROM (
    SELECT 
      key as element,
      COUNT(*) as count
    FROM oracle_sessions os,
    jsonb_each(os.elements)
    WHERE os.user_id = target_user_id
    GROUP BY key
  ) counts;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Sample query to get user's oracle journey
-- SELECT 
--   os.*,
--   get_elemental_balance(os.user_id) as elemental_balance,
--   (SELECT array_agg(session_id) 
--    FROM find_similar_sessions(os.query, os.user_id, 3)) as similar_sessions
-- FROM oracle_sessions os
-- WHERE user_id = 'user_123'
-- ORDER BY created_at DESC
-- LIMIT 10;