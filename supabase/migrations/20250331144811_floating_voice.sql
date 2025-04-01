/*
  # Session Notes System

  1. New Tables
    - session_notes
      - id (uuid, primary key)
      - client_id (uuid, foreign key to user_profiles)
      - practitioner_id (uuid, foreign key to user_profiles)
      - summary (text)
      - approved_by (uuid, foreign key to user_profiles)
      - created_at (timestamp)
      - updated_at (timestamp)
      - status (text, enum)

  2. Security
    - Enable RLS on session_notes table
    - Add policies for practitioner access
    - Add policies for supervisor access
    - Add policies for client access

  3. Functions
    - create_session_note: Function to create new session note
    - approve_session_note: Function for supervisors to approve notes
*/

-- Create session notes table
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  approved_by UUID REFERENCES user_profiles(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX session_notes_client_id_idx ON session_notes(client_id);
CREATE INDEX session_notes_practitioner_id_idx ON session_notes(practitioner_id);
CREATE INDEX session_notes_status_idx ON session_notes(status);
CREATE INDEX session_notes_approved_by_idx ON session_notes(approved_by);

-- Create updated_at trigger
CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Practitioners can manage their own notes
CREATE POLICY "Practitioners can manage their session notes"
  ON session_notes
  FOR ALL
  TO authenticated
  USING (
    practitioner_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Supervisors can view and approve notes
CREATE POLICY "Supervisors can view and approve session notes"
  ON session_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_types rt ON ur.role_id = rt.id
      WHERE ur.user_id = auth.uid()
      AND rt.name IN ('admin', 'supervisor')
    )
  );

-- Clients can view their approved notes
CREATE POLICY "Clients can view their approved session notes"
  ON session_notes
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND status = 'approved'
  );

-- Helper Functions

-- Function to create session note
CREATE OR REPLACE FUNCTION create_session_note(
  p_client_id UUID,
  p_summary TEXT,
  p_status TEXT DEFAULT 'draft'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_practitioner_id UUID;
  v_note_id UUID;
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
    AND rt.name IN ('practitioner', 'apprentice')
  ) THEN
    RAISE EXCEPTION 'User is not authorized to create session notes';
  END IF;

  -- Create note
  INSERT INTO session_notes (
    client_id,
    practitioner_id,
    summary,
    status
  )
  VALUES (
    p_client_id,
    v_practitioner_id,
    p_summary,
    p_status
  )
  RETURNING id INTO v_note_id;

  RETURN v_note_id;
END;
$$;

-- Function to approve session note
CREATE OR REPLACE FUNCTION approve_session_note(
  p_note_id UUID,
  p_approved BOOLEAN,
  p_feedback TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has supervisor role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name IN ('admin', 'supervisor')
  ) THEN
    RAISE EXCEPTION 'User is not authorized to approve session notes';
  END IF;

  -- Update note
  UPDATE session_notes
  SET 
    status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
    approved_by = CASE WHEN p_approved THEN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    ) END,
    feedback = p_feedback,
    updated_at = now()
  WHERE id = p_note_id;
END;
$$;

-- Function to submit note for approval
CREATE OR REPLACE FUNCTION submit_note_for_approval(
  p_note_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify note belongs to practitioner
  IF NOT EXISTS (
    SELECT 1 FROM session_notes
    WHERE id = p_note_id
    AND practitioner_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Note not found or unauthorized';
  END IF;

  -- Update note status
  UPDATE session_notes
  SET 
    status = 'pending_approval',
    updated_at = now()
  WHERE id = p_note_id;
END;
$$;

-- Function to get pending notes for supervisor
CREATE OR REPLACE FUNCTION get_pending_notes()
RETURNS TABLE (
  note_id UUID,
  client_name TEXT,
  practitioner_name TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has supervisor role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = auth.uid()
    AND rt.name IN ('admin', 'supervisor')
  ) THEN
    RAISE EXCEPTION 'User is not authorized to view pending notes';
  END IF;

  RETURN QUERY
  SELECT 
    sn.id as note_id,
    c.name as client_name,
    p.name as practitioner_name,
    sn.summary,
    sn.created_at
  FROM session_notes sn
  JOIN user_profiles c ON c.id = sn.client_id
  JOIN user_profiles p ON p.id = sn.practitioner_id
  WHERE sn.status = 'pending_approval'
  ORDER BY sn.created_at DESC;
END;
$$;