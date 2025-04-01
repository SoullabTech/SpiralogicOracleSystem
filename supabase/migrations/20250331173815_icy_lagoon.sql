/*
  # Add Profiles Table

  1. New Tables
    - `profiles`
      - Basic user profile information
      - Links to auth.users via id/uid
      - Stores role and full name
      - Includes timestamps

  2. Security
    - Enable RLS
    - Add policies for user access
    - Ensure proper auth integration
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_can_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "INSERT" ON profiles;
DROP POLICY IF EXISTS "UPDATE" ON profiles;
DROP POLICY IF EXISTS "user_can_view_own_profile" ON client_profiles;
DROP POLICY IF EXISTS "admin_can_insert_profiles" ON client_profiles;
DROP POLICY IF EXISTS "admin_can_update_assigned" ON client_profiles;

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