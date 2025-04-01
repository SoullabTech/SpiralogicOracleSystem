/*
  # Add psychedelic session support
  
  1. New Tables
    - psychedelic_sessions
      - Session metadata and tracking
      - Integration with Spiralogic framework
      - Support for different session types
    - session_intentions
      - Track intentions and outcomes
    - session_support_tools
      - Record tools and techniques used
  
  2. Security
    - Enable RLS on all tables
    - Add policies for practitioners and clients
    - Ensure data privacy and access control
*/

-- Create psychedelic sessions table
CREATE TABLE IF NOT EXISTS psychedelic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES user_profiles(id),
  phase TEXT NOT NULL CHECK (phase IN ('preparation', 'journey', 'integration')),
  session_type TEXT NOT NULL,
  dosage TEXT,
  set_and_setting TEXT,
  intention TEXT,
  summary TEXT,
  element TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  insights JSONB DEFAULT '[]'::jsonb,
  integration_notes TEXT,
  practitioner_notes TEXT,
  review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'flagged')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- Create session intentions table
CREATE TABLE IF NOT EXISTS session_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES psychedelic_sessions(id) ON DELETE CASCADE,
  intention TEXT NOT NULL,
  category TEXT,
  priority INTEGER DEFAULT 1,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create session support tools table
CREATE TABLE IF NOT EXISTS session_support_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES psychedelic_sessions(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  description TEXT,
  effectiveness INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE psychedelic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_support_tools ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX psychedelic_sessions_client_id_idx ON psychedelic_sessions(client_id);
CREATE INDEX psychedelic_sessions_guide_id_idx ON psychedelic_sessions(guide_id);
CREATE INDEX psychedelic_sessions_phase_idx ON psychedelic_sessions(phase);
CREATE INDEX psychedelic_sessions_status_idx ON psychedelic_sessions(status);
CREATE INDEX session_intentions_session_id_idx ON session_intentions(session_id);
CREATE INDEX session_support_tools_session_id_idx ON session_support_tools(session_id);

-- Create updated_at trigger for session_intentions
CREATE TRIGGER update_session_intentions_updated_at
  BEFORE UPDATE ON session_intentions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for psychedelic_sessions

-- Guides can manage their sessions
CREATE POLICY "Guides can manage their sessions"
  ON psychedelic_sessions
  FOR ALL
  TO authenticated
  USING (guide_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Clients can view their own sessions
CREATE POLICY "Clients can view their sessions"
  ON psychedelic_sessions
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for session_intentions

-- Guides can manage intentions
CREATE POLICY "Guides can manage intentions"
  ON session_intentions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM psychedelic_sessions ps
      WHERE ps.id = session_id
      AND ps.guide_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Clients can view their intentions
CREATE POLICY "Clients can view their intentions"
  ON session_intentions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM psychedelic_sessions ps
      WHERE ps.id = session_id
      AND ps.client_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for session_support_tools

-- Guides can manage tools
CREATE POLICY "Guides can manage support tools"
  ON session_support_tools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM psychedelic_sessions ps
      WHERE ps.id = session_id
      AND ps.guide_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Clients can view their tools
CREATE POLICY "Clients can view their support tools"
  ON session_support_tools
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM psychedelic_sessions ps
      WHERE ps.id = session_id
      AND ps.client_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Helper Functions

-- Function to create a new psychedelic session
CREATE OR REPLACE FUNCTION create_psychedelic_session(
  p_client_id UUID,
  p_phase TEXT,
  p_session_type TEXT,
  p_intention TEXT DEFAULT NULL,
  p_set_and_setting TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guide_id UUID;
  v_session_id UUID;
BEGIN
  -- Get guide ID from current user
  SELECT id INTO v_guide_id
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Verify guide has correct role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name IN ('practitioner', 'guide')
  ) THEN
    RAISE EXCEPTION 'User is not authorized to create psychedelic sessions';
  END IF;

  -- Create session
  INSERT INTO psychedelic_sessions (
    client_id,
    guide_id,
    phase,
    session_type,
    intention,
    set_and_setting,
    status
  )
  VALUES (
    p_client_id,
    v_guide_id,
    p_phase,
    p_session_type,
    p_intention,
    p_set_and_setting,
    'scheduled'
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Function to start a session
CREATE OR REPLACE FUNCTION start_psychedelic_session(
  p_session_id UUID,
  p_element TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE psychedelic_sessions
  SET 
    status = 'in_progress',
    started_at = now(),
    element = p_element
  WHERE id = p_session_id
  AND guide_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
  AND status = 'scheduled';
END;
$$;

-- Function to end a session
CREATE OR REPLACE FUNCTION end_psychedelic_session(
  p_session_id UUID,
  p_summary TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE psychedelic_sessions
  SET 
    status = 'completed',
    ended_at = now(),
    summary = COALESCE(p_summary, summary)
  WHERE id = p_session_id
  AND guide_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
  AND status = 'in_progress';
END;
$$;

-- Function to add session insight
CREATE OR REPLACE FUNCTION add_session_insight(
  p_session_id UUID,
  p_insight JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE psychedelic_sessions
  SET insights = insights || p_insight
  WHERE id = p_session_id
  AND (
    guide_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    OR
    client_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  );
END;
$$;