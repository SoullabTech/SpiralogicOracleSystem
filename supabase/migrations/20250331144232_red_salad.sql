/*
  # Role Permissions and Mentorship Schema

  1. New Tables
    - `role_types`
      - `id` (serial, primary key)
      - `name` (text)
      - `description` (text)
      - `capabilities` (jsonb)
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role_id` (integer, references role_types)
      - `assigned_by` (uuid, references auth.users)
      - `created_at` (timestamp)
    - `mentorship_assignments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references auth.users)
      - `practitioner_id` (uuid, references auth.users)
      - `relationship_type` (text)
      - `permissions` (jsonb)
      - `assigned_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Add policies for mentorship relationships

  3. Changes
    - Add indexes for performance optimization
    - Add triggers for updated_at timestamps
*/

-- Role types table
CREATE TABLE IF NOT EXISTS role_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User-role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES role_types(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentorship relationships
CREATE TABLE IF NOT EXISTS mentorship_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary', 'apprentice', 'supervisor')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE role_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for role_types
CREATE POLICY "Admins can manage role types"
  ON role_types
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

CREATE POLICY "All users can view role types"
  ON role_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_roles
CREATE POLICY "Admins can manage user roles"
  ON user_roles
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

CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for mentorship_assignments
CREATE POLICY "Admins can manage mentorship assignments"
  ON mentorship_assignments
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

CREATE POLICY "Practitioners can view their assigned clients"
  ON mentorship_assignments
  FOR SELECT
  TO authenticated
  USING (practitioner_id = auth.uid());

CREATE POLICY "Clients can view their assigned practitioners"
  ON mentorship_assignments
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Indexes for better query performance
CREATE INDEX user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX user_roles_role_id_idx ON user_roles(role_id);
CREATE INDEX mentorship_client_id_idx ON mentorship_assignments(client_id);
CREATE INDEX mentorship_practitioner_id_idx ON mentorship_assignments(practitioner_id);
CREATE INDEX mentorship_type_idx ON mentorship_assignments(relationship_type);

-- Updated at trigger for mentorship_assignments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentorship_assignments_updated_at
  BEFORE UPDATE ON mentorship_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO role_types (name, description, capabilities) VALUES
  ('admin', 'System administrator with full access', '{"can_manage_roles": true, "can_manage_users": true, "can_manage_mentorships": true}'::jsonb),
  ('practitioner', 'Oracle practitioner who can mentor clients', '{"can_view_clients": true, "can_mentor_clients": true, "can_write_summaries": true}'::jsonb),
  ('client', 'Client receiving guidance', '{"can_view_own_data": true, "can_interact_with_oracle": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Function to check if user has capability
CREATE OR REPLACE FUNCTION has_capability(user_id UUID, required_capability TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_types rt ON ur.role_id = rt.id
    WHERE ur.user_id = user_id
    AND rt.capabilities ? required_capability
    AND rt.capabilities->>required_capability = 'true'
  );
END;
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT rt.name INTO role_name
  FROM user_roles ur
  JOIN role_types rt ON ur.role_id = rt.id
  WHERE ur.user_id = user_id
  LIMIT 1;
  
  RETURN COALESCE(role_name, 'client');
END;
$$;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION assign_role(
  p_user_id UUID,
  p_role_name TEXT,
  p_assigned_by UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role_id INTEGER;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id
  FROM role_types
  WHERE name = p_role_name;
  
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Invalid role name: %', p_role_name;
  END IF;
  
  -- Insert or update role assignment
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, v_role_id, COALESCE(p_assigned_by, auth.uid()))
  ON CONFLICT (user_id)
  DO UPDATE SET
    role_id = v_role_id,
    assigned_by = COALESCE(p_assigned_by, auth.uid());
END;
$$;

-- Function to assign mentor to client
CREATE OR REPLACE FUNCTION assign_mentor(
  p_client_id UUID,
  p_practitioner_id UUID,
  p_relationship_type TEXT DEFAULT 'primary',
  p_permissions JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- Verify practitioner has correct role
  IF NOT has_capability(p_practitioner_id, 'can_mentor_clients') THEN
    RAISE EXCEPTION 'User % does not have mentorship capabilities', p_practitioner_id;
  END IF;
  
  -- Create assignment
  INSERT INTO mentorship_assignments (
    client_id,
    practitioner_id,
    relationship_type,
    permissions,
    assigned_by
  )
  VALUES (
    p_client_id,
    p_practitioner_id,
    p_relationship_type,
    p_permissions,
    auth.uid()
  )
  RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$;