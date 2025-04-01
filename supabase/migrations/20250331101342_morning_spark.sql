/*
  # Add Memory Blocks Schema
  
  1. New Tables
    - `memory_blocks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `label` (text)
      - `value` (text)
      - `importance` (integer)
      - `type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on memory_blocks table
    - Add policies for authenticated users to manage their own memory blocks
*/

-- Memory Blocks Table
CREATE TABLE IF NOT EXISTS memory_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  importance integer DEFAULT 0,
  type text DEFAULT 'insight',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memory_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own memory blocks"
  ON memory_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory blocks"
  ON memory_blocks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory blocks"
  ON memory_blocks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory blocks"
  ON memory_blocks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated timestamp trigger
CREATE TRIGGER update_memory_blocks_updated_at
  BEFORE UPDATE ON memory_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();