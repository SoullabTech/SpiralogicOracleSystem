/*
  # Create Sessions and Chat Messages Tables

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references auth.users)
      - `element` (text)
      - `phase` (text)
      - `created_at` (timestamp)
      - `ended_at` (timestamp)
      - `summary` (text)
      - `insights` (jsonb)
      - `patterns` (jsonb)
      - `growth_indicators` (jsonb)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references sessions)
      - `client_id` (uuid, references auth.users)
      - `content` (text)
      - `sender` (text)
      - `element` (text)
      - `insight_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  element TEXT,
  phase TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  summary TEXT,
  insights JSONB DEFAULT '[]'::jsonb,
  patterns JSONB DEFAULT '[]'::jsonb,
  growth_indicators JSONB DEFAULT '[]'::jsonb
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('client', 'oracle', 'system')),
  element TEXT,
  insight_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for sessions table
CREATE POLICY "Users can view their own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Users can create their own sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Policies for chat_messages table
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Users can create their own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Create indexes for better query performance
CREATE INDEX sessions_client_id_idx ON sessions(client_id);
CREATE INDEX sessions_created_at_idx ON sessions(created_at);
CREATE INDEX chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX chat_messages_client_id_idx ON chat_messages(client_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- Add functions for session management
CREATE OR REPLACE FUNCTION end_session(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE sessions
  SET ended_at = now()
  WHERE id = p_session_id
  AND auth.uid() = client_id;
END;
$$;

-- Add function to get latest session for a client
CREATE OR REPLACE FUNCTION get_latest_session(p_client_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT id INTO v_session_id
  FROM sessions
  WHERE client_id = p_client_id
  AND ended_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_session_id IS NULL THEN
    INSERT INTO sessions (client_id)
    VALUES (p_client_id)
    RETURNING id INTO v_session_id;
  END IF;

  RETURN v_session_id;
END;
$$;

-- Add function to summarize session
CREATE OR REPLACE FUNCTION summarize_session(p_session_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_summary TEXT;
BEGIN
  WITH session_data AS (
    SELECT 
      s.element,
      s.phase,
      json_agg(
        json_build_object(
          'content', cm.content,
          'sender', cm.sender,
          'element', cm.element,
          'insight_type', cm.insight_type,
          'created_at', cm.created_at
        ) ORDER BY cm.created_at
      ) as messages
    FROM sessions s
    LEFT JOIN chat_messages cm ON cm.session_id = s.id
    WHERE s.id = p_session_id
    AND s.client_id = auth.uid()
    GROUP BY s.id, s.element, s.phase
  )
  SELECT 
    'Session Summary:\n' ||
    'Element: ' || COALESCE(element, 'Not specified') || '\n' ||
    'Phase: ' || COALESCE(phase, 'Not specified') || '\n' ||
    'Messages: ' || COALESCE(json_array_length(messages)::text, '0')
  INTO v_summary
  FROM session_data;

  RETURN v_summary;
END;
$$;

-- Add trigger to auto-summarize session on end
CREATE OR REPLACE FUNCTION auto_summarize_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.summary := summarize_session(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_end_summary
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
  EXECUTE FUNCTION auto_summarize_session();