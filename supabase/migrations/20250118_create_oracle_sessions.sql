-- Create oracle_sessions table for beta session tracking
-- This ensures session data is collected during beta testing

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS oracle_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,

  -- Elemental and spiral data
  elements JSONB DEFAULT '{}'::jsonb,
  spiral_stage JSONB DEFAULT NULL,

  -- Oracle outputs
  reflection TEXT,
  practice TEXT,
  archetype TEXT,

  -- Session metadata
  stages JSONB DEFAULT '[]'::jsonb,
  mode TEXT DEFAULT 'beta',
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique session IDs
  CONSTRAINT unique_session_id UNIQUE(session_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oracle_sessions_user_id
  ON oracle_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_oracle_sessions_created_at
  ON oracle_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_oracle_sessions_elements
  ON oracle_sessions USING GIN (elements);

CREATE INDEX IF NOT EXISTS idx_oracle_sessions_mode
  ON oracle_sessions(mode);

CREATE INDEX IF NOT EXISTS idx_oracle_sessions_query_text
  ON oracle_sessions USING GIN (to_tsvector('english', query));

-- Enable Row Level Security
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sessions" ON oracle_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON oracle_sessions;
DROP POLICY IF EXISTS "Service role has full access" ON oracle_sessions;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON oracle_sessions
  FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR
    auth.role() = 'service_role'
  );

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON oracle_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    OR
    auth.role() = 'service_role'
  );

-- Policy: Service role has full access (for backend operations)
CREATE POLICY "Service role has full access" ON oracle_sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_oracle_sessions_updated_at ON oracle_sessions;
CREATE TRIGGER update_oracle_sessions_updated_at
  BEFORE UPDATE ON oracle_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for session analytics
CREATE OR REPLACE VIEW oracle_session_analytics AS
SELECT
  user_id,
  COUNT(*) as total_sessions,
  COUNT(DISTINCT DATE(created_at)) as active_days,

  -- Most recent session
  MAX(created_at) as last_session,
  MIN(created_at) as first_session,

  -- Activity status
  CASE
    WHEN MAX(created_at) > NOW() - INTERVAL '24 hours' THEN 'active_today'
    WHEN MAX(created_at) > NOW() - INTERVAL '7 days' THEN 'active_week'
    WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 'active_month'
    ELSE 'inactive'
  END as activity_status,

  -- Mode distribution
  jsonb_object_agg(
    COALESCE(mode, 'unknown'),
    mode_count
  ) as mode_distribution

FROM (
  SELECT
    user_id,
    created_at,
    mode,
    COUNT(*) OVER (PARTITION BY user_id, mode) as mode_count
  FROM oracle_sessions
) sessions_with_counts
GROUP BY user_id;

-- Grant permissions to authenticated users for the analytics view
GRANT SELECT ON oracle_session_analytics TO authenticated;

-- Create function for session insights
CREATE OR REPLACE FUNCTION get_session_insights(p_user_id TEXT)
RETURNS TABLE (
  total_sessions BIGINT,
  dominant_element TEXT,
  current_spiral TEXT,
  growth_stage TEXT,
  last_reflection TEXT,
  last_practice TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_sessions AS (
    SELECT * FROM oracle_sessions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 50
  ),
  element_counts AS (
    SELECT
      elem.key as element,
      COUNT(*) as count
    FROM user_sessions us,
    jsonb_each(us.elements) elem
    WHERE (elem.value)::numeric > 0.2
    GROUP BY elem.key
    ORDER BY count DESC
    LIMIT 1
  ),
  latest_session AS (
    SELECT * FROM user_sessions
    LIMIT 1
  )
  SELECT
    (SELECT COUNT(*) FROM user_sessions)::BIGINT as total_sessions,
    COALESCE((SELECT element FROM element_counts), 'balanced') as dominant_element,
    COALESCE(
      (SELECT spiral_stage->>'element' || '-' || spiral_stage->>'stage'
       FROM latest_session
       WHERE spiral_stage IS NOT NULL),
      'beginning'
    ) as current_spiral,
    CASE
      WHEN (SELECT COUNT(*) FROM user_sessions) < 5 THEN 'exploring'
      WHEN (SELECT COUNT(*) FROM user_sessions) < 20 THEN 'deepening'
      ELSE 'integrating'
    END as growth_stage,
    (SELECT reflection FROM latest_session) as last_reflection,
    (SELECT practice FROM latest_session) as last_practice;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_session_insights(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE oracle_sessions IS 'Stores all oracle session data for beta testing and user journey tracking';
COMMENT ON VIEW oracle_session_analytics IS 'Aggregated view of user session analytics';
COMMENT ON FUNCTION get_session_insights IS 'Returns personalized insights based on user session history';