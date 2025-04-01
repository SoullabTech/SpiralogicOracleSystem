-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_can_read_own_profile_policy') THEN
    DROP POLICY "user_can_read_own_profile_policy" ON profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_can_insert_profile_policy') THEN
    DROP POLICY "user_can_insert_profile_policy" ON profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_can_update_profile_policy') THEN
    DROP POLICY "user_can_update_profile_policy" ON profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_can_view_own_client_profile_policy') THEN
    DROP POLICY "user_can_view_own_client_profile_policy" ON client_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_can_insert_client_profiles_policy') THEN
    DROP POLICY "admin_can_insert_client_profiles_policy" ON client_profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_can_update_client_profiles_policy') THEN
    DROP POLICY "admin_can_update_client_profiles_policy" ON client_profiles;
  END IF;
END $$;

-- Create or update profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT,
  role TEXT
);

-- Create or update client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT uid(),
  phase TEXT NOT NULL,
  element TEXT,
  archetype TEXT,
  crystal_focus TEXT,
  assigned_by UUID,
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies for profiles
CREATE POLICY "user_can_read_own_profile_policy" 
  ON profiles 
  FOR SELECT 
  TO public 
  USING (auth.uid() = id);

CREATE POLICY "user_can_insert_profile_policy" 
  ON profiles 
  FOR INSERT 
  TO public 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_can_update_profile_policy" 
  ON profiles 
  FOR UPDATE 
  TO public 
  USING (auth.uid() = id);

-- Create new policies for client_profiles
CREATE POLICY "user_can_view_own_client_profile_policy" 
  ON client_profiles 
  FOR SELECT 
  TO public 
  USING (auth.uid() = id);

CREATE POLICY "admin_can_insert_client_profiles_policy" 
  ON client_profiles 
  FOR INSERT 
  TO public 
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "admin_can_update_client_profiles_policy" 
  ON client_profiles 
  FOR UPDATE 
  TO public 
  USING (auth.uid() = assigned_by)
  WITH CHECK (auth.uid() = assigned_by);

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'client');
END;
$$;