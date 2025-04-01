/*
  # Practitioner Assignments Implementation

  1. New Tables
    - practitioner_assignments
      - id (uuid, primary key)
      - client_id (uuid, foreign key to user_profiles)
      - practitioner_id (uuid, foreign key to user_profiles)
      - assigned_by (uuid, foreign key to user_profiles)
      - status (text, enum)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on practitioner_assignments table
    - Add policies for admin access
    - Add policies for practitioner access
    - Add policies for client access

  3. Functions
    - assign_practitioner: Function to create practitioner assignment
    - update_assignment_status: Function to update assignment status
*/

-- Create practitioner assignments table
CREATE TABLE IF NOT EXISTS practitioner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES user_profiles(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, practitioner_id)
);

-- Enable Row Level Security
ALTER TABLE practitioner_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX practitioner_assignments_client_id_idx ON practitioner_assignments(client_id);
CREATE INDEX practitioner_assignments_practitioner_id_idx ON practitioner_assignments(practitioner_id);
CREATE INDEX practitioner_assignments_status_idx ON practitioner_assignments(status);

-- Create updated_at trigger
CREATE TRIGGER update_practitioner_assignments_updated_at
  BEFORE UPDATE ON practitioner_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Admins can do everything
CREATE POLICY "Admins have full access to practitioner assignments"
  ON practitioner_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_types rt ON ur.role_id = rt.id
      WHERE ur.user_id = auth.uid()
      AND rt.name = 'admin'
    )
  );

-- Practitioners can view and update their assignments
CREATE POLICY "Practitioners can view their assignments"
  ON practitioner_assignments
  FOR SELECT
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Practitioners can update their assignments"
  ON practitioner_assignments
  FOR UPDATE
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Clients can view their assignments
CREATE POLICY "Clients can view their assignments"
  ON practitioner_assignments
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Helper Functions

-- Function to assign practitioner to client
CREATE OR REPLACE FUNCTION assign_practitioner(
  p_client_id UUID,
  p_practitioner_id UUID,
  p_assigned_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- Verify practitioner has correct role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = (
      SELECT user_id FROM user_profiles WHERE id = p_practitioner_id
    )
    AND rt.name = 'practitioner'
  ) THEN
    RAISE EXCEPTION 'User % is not a practitioner', p_practitioner_id;
  END IF;

  -- Create assignment
  INSERT INTO practitioner_assignments (
    client_id,
    practitioner_id,
    assigned_by,
    status
  )
  VALUES (
    p_client_id,
    p_practitioner_id,
    COALESCE(p_assigned_by, auth.uid()),
    'active'
  )
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$;

-- Function to update assignment status
CREATE OR REPLACE FUNCTION update_assignment_status(
  p_assignment_id UUID,
  p_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify status is valid
  IF p_status NOT IN ('active', 'pending', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  -- Update assignment
  UPDATE practitioner_assignments
  SET 
    status = p_status,
    updated_at = now()
  WHERE id = p_assignment_id
  AND (
    -- Allow admins to update any assignment
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_types rt ON ur.role_id = rt.id
      WHERE ur.user_id = auth.uid()
      AND rt.name = 'admin'
    )
    OR
    -- Allow practitioners to update their own assignments
    practitioner_id IN (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  );
END;
$$;