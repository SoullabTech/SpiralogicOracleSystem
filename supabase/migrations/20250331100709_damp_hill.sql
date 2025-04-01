/*
  # Memory and Sharing Implementation

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `type` (text)
      - `metadata` (jsonb)
      - `strength` (float)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `memory_connections`
      - `id` (uuid, primary key)
      - `source_memory_id` (uuid, references memories)
      - `target_memory_id` (uuid, references memories)
      - `strength` (float)
      - `created_at` (timestamp)
    
    - `shared_spaces`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `space_members`
      - `space_id` (uuid, references shared_spaces)
      - `user_id` (uuid, references user_profiles)
      - `role` (text)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Ensure proper access control for shared spaces
*/

-- Create updated_at function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  strength float DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Memory Connections Table
CREATE TABLE IF NOT EXISTS memory_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_memory_id uuid REFERENCES memories(id) ON DELETE CASCADE,
  target_memory_id uuid REFERENCES memories(id) ON DELETE CASCADE,
  strength float DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memory_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create connections for their memories"
  ON memory_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories
      WHERE id = source_memory_id
      AND user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM memories
      WHERE id = target_memory_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their memory connections"
  ON memory_connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memories
      WHERE id = source_memory_id
      AND user_id = auth.uid()
    )
  );

-- Shared Spaces Table
CREATE TABLE IF NOT EXISTS shared_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_shared_spaces_updated_at
  BEFORE UPDATE ON shared_spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create space_members table before adding RLS to shared_spaces
CREATE TABLE IF NOT EXISTS space_members (
  space_id uuid REFERENCES shared_spaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (space_id, user_id)
);

-- Now enable RLS and add policies that depend on space_members
ALTER TABLE shared_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create shared spaces"
  ON shared_spaces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view shared spaces"
  ON shared_spaces
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM space_members
      WHERE space_id = id
      AND user_id = auth.uid()
    )
    OR auth.uid() = created_by
  );

ALTER TABLE space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Space creators can manage members"
  ON space_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_spaces
      WHERE id = space_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view space members"
  ON space_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM space_members
      WHERE space_id = space_id
      AND user_id = auth.uid()
    )
  );