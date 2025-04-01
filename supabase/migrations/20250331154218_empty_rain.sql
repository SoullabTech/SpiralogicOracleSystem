/*
  # Oracle Practitioner System Schema

  1. New Tables
    - `oracle_sessions`
      - Tracks Oracle guidance sessions
      - Stores session context, element, and insights
    - `oracle_insights`
      - Stores generated insights and patterns
      - Links to sessions and clients
    - `oracle_feedback`
      - Captures client feedback on Oracle responses
      - Helps improve guidance quality

  2. Security
    - Enable RLS on all tables
    - Add policies for practitioners and clients
    - Secure access to Oracle functions

  3. Changes
    - Add Oracle-specific fields to user_profiles
    - Create helper functions for Oracle interactions
*/

-- Create oracle_sessions table
CREATE TABLE IF NOT EXISTS oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES user_profiles(id),
  element TEXT NOT NULL,
  phase TEXT NOT NULL,
  archetype TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  summary TEXT,
  insights JSONB DEFAULT '[]'::jsonb,
  patterns JSONB DEFAULT '[]'::jsonb,
  growth_indicators JSONB DEFAULT '[]'::jsonb,
  feedback TEXT,
  practitioner_notes TEXT,
  review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'flagged')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- Create oracle_insights table
CREATE TABLE IF NOT EXISTS oracle_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES oracle_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  element TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  strength FLOAT DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create oracle_feedback table
CREATE TABLE IF NOT EXISTS oracle_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES oracle_sessions(id) ON DELETE CASCADE,
  message_id UUID NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_type TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_feedback ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX oracle_sessions_client_id_idx ON oracle_sessions(client_id);
CREATE INDEX oracle_sessions_practitioner_id_idx ON oracle_sessions(practitioner_id);
CREATE INDEX oracle_sessions_element_idx ON oracle_sessions(element);
CREATE INDEX oracle_sessions_phase_idx ON oracle_sessions(phase);
CREATE INDEX oracle_insights_session_id_idx ON oracle_insights(session_id);
CREATE INDEX oracle_insights_element_idx ON oracle_insights(element);
CREATE INDEX oracle_feedback_session_id_idx ON oracle_feedback(session_id);

-- RLS Policies for oracle_sessions

-- Practitioners can manage their sessions
CREATE POLICY "Practitioners can manage oracle sessions"
  ON oracle_sessions
  FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Clients can view their sessions
CREATE POLICY "Clients can view their oracle sessions"
  ON oracle_sessions
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for oracle_insights

-- Practitioners can manage insights
CREATE POLICY "Practitioners can manage oracle insights"
  ON oracle_insights
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oracle_sessions
      WHERE oracle_sessions.id = session_id
      AND oracle_sessions.practitioner_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Clients can view their insights
CREATE POLICY "Clients can view their oracle insights"
  ON oracle_insights
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oracle_sessions
      WHERE oracle_sessions.id = session_id
      AND oracle_sessions.client_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for oracle_feedback

-- Clients can manage their feedback
CREATE POLICY "Clients can manage oracle feedback"
  ON oracle_feedback
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oracle_sessions
      WHERE oracle_sessions.id = session_id
      AND oracle_sessions.client_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Practitioners can view feedback
CREATE POLICY "Practitioners can view oracle feedback"
  ON oracle_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oracle_sessions
      WHERE oracle_sessions.id = session_id
      AND oracle_sessions.practitioner_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Helper Functions

-- Function to start an oracle session
CREATE OR REPLACE FUNCTION start_oracle_session(
  p_client_id UUID,
  p_element TEXT,
  p_phase TEXT,
  p_archetype TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_practitioner_id UUID;
  v_session_id UUID;
BEGIN
  -- Get practitioner ID from current user
  SELECT id INTO v_practitioner_id
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Verify practitioner has correct role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name = 'practitioner'
  ) THEN
    RAISE EXCEPTION 'User is not authorized to start Oracle sessions';
  END IF;

  -- Create session
  INSERT INTO oracle_sessions (
    client_id,
    practitioner_id,
    element,
    phase,
    archetype
  )
  VALUES (
    p_client_id,
    v_practitioner_id,
    p_element,
    p_phase,
    p_archetype
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Function to end an oracle session
CREATE OR REPLACE FUNCTION end_oracle_session(
  p_session_id UUID,
  p_summary TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE oracle_sessions
  SET 
    ended_at = now(),
    summary = COALESCE(p_summary, summary)
  WHERE id = p_session_id
  AND practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )
  AND ended_at IS NULL;
END;
$$;

-- Function to add oracle insight
CREATE OR REPLACE FUNCTION add_oracle_insight(
  p_session_id UUID,
  p_content TEXT,
  p_element TEXT,
  p_insight_type TEXT,
  p_strength FLOAT DEFAULT 1.0,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_insight_id UUID;
BEGIN
  -- Verify user has access to session
  IF NOT EXISTS (
    SELECT 1 FROM oracle_sessions
    WHERE id = p_session_id
    AND (
      practitioner_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      OR
      client_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized to add insight to this session';
  END IF;

  -- Insert insight
  INSERT INTO oracle_insights (
    session_id,
    content,
    element,
    insight_type,
    strength,
    metadata
  )
  VALUES (
    p_session_id,
    p_content,
    p_element,
    p_insight_type,
    p_strength,
    p_metadata
  )
  RETURNING id INTO v_insight_id;

  -- Update session insights array
  UPDATE oracle_sessions
  SET insights = insights || jsonb_build_object(
    'id', v_insight_id,
    'content', p_content,
    'element', p_element,
    'type', p_insight_type,
    'strength', p_strength
  )
  WHERE id = p_session_id;

  RETURN v_insight_id;
END;
$$;

-- Function to add oracle feedback
CREATE OR REPLACE FUNCTION add_oracle_feedback(
  p_session_id UUID,
  p_message_id UUID,
  p_rating INTEGER,
  p_feedback_type TEXT,
  p_comment TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_feedback_id UUID;
BEGIN
  -- Verify rating is valid
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Verify user has access to session
  IF NOT EXISTS (
    SELECT 1 FROM oracle_sessions
    WHERE id = p_session_id
    AND client_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized to add feedback to this session';
  END IF;

  -- Insert feedback
  INSERT INTO oracle_feedback (
    session_id,
    message_id,
    rating,
    feedback_type,
    comment
  )
  VALUES (
    p_session_id,
    p_message_id,
    p_rating,
    p_feedback_type,
    p_comment
  )
  RETURNING id INTO v_feedback_id;

  RETURN v_feedback_id;
END;
$$;

-- Function to get oracle session insights
CREATE OR REPLACE FUNCTION get_oracle_insights(
  p_session_id UUID,
  p_element TEXT DEFAULT NULL,
  p_min_strength FLOAT DEFAULT 0.0
)
RETURNS TABLE (
  insight_id UUID,
  content TEXT,
  element TEXT,
  insight_type TEXT,
  strength FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to session
  IF NOT EXISTS (
    SELECT 1 FROM oracle_sessions
    WHERE id = p_session_id
    AND (
      practitioner_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
      OR
      client_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized to view insights from this session';
  END IF;

  RETURN QUERY
  SELECT 
    oi.id,
    oi.content,
    oi.element,
    oi.insight_type,
    oi.strength,
    oi.created_at
  FROM oracle_insights oi
  WHERE oi.session_id = p_session_id
  AND (p_element IS NULL OR oi.element = p_element)
  AND oi.strength >= p_min_strength
  ORDER BY oi.strength DESC, oi.created_at DESC;
END;
$$;