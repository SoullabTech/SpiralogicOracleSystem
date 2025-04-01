/*
  # Practitioner Tools Schema

  1. New Tables
    - `practitioner_tools`
      - Tools and practices that practitioners can use
    - `tool_tags`
      - Categorization system
    - `tool_tag_assignments`
      - Many-to-many relationships
    - `practitioner_tool_settings`
      - Per-client/session settings

  2. Security
    - Enable RLS on all tables
    - Add policies for practitioners
    - Secure access to tool settings
*/

-- Create practitioner_tools table
CREATE TABLE IF NOT EXISTS practitioner_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  element TEXT,
  archetype TEXT,
  phase TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tool_tags table
CREATE TABLE IF NOT EXISTS tool_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tool_tag_assignments table
CREATE TABLE IF NOT EXISTS tool_tag_assignments (
  tool_id UUID REFERENCES practitioner_tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tool_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tool_id, tag_id)
);

-- Create practitioner_tool_settings table with nullable session_id
CREATE TABLE IF NOT EXISTS practitioner_tool_settings (
  tool_id UUID REFERENCES practitioner_tools(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NULL,
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tool_id, client_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE practitioner_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_tool_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX practitioner_tools_practitioner_id_idx ON practitioner_tools(practitioner_id);
CREATE INDEX tool_tags_category_idx ON tool_tags(category);
CREATE INDEX practitioner_tool_settings_client_id_idx ON practitioner_tool_settings(client_id);
CREATE INDEX practitioner_tool_settings_session_id_idx ON practitioner_tool_settings(session_id);

-- Create updated_at triggers
CREATE TRIGGER update_practitioner_tools_updated_at
  BEFORE UPDATE ON practitioner_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioner_tool_settings_updated_at
  BEFORE UPDATE ON practitioner_tool_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for practitioner_tools
CREATE POLICY "Practitioners can manage their tools"
  ON practitioner_tools
  FOR ALL
  TO authenticated
  USING (practitioner_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for tool_tags
CREATE POLICY "Users can view tool tags"
  ON tool_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Practitioners can create tool tags"
  ON tool_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_types rt ON ur.role_id = rt.id
      WHERE ur.user_id = auth.uid()
      AND rt.name = 'practitioner'
    )
  );

-- RLS Policies for tool_tag_assignments
CREATE POLICY "Practitioners can manage tag assignments"
  ON tool_tag_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practitioner_tools
      WHERE practitioner_tools.id = tool_id
      AND practitioner_tools.practitioner_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for practitioner_tool_settings
CREATE POLICY "Practitioners can manage tool settings"
  ON practitioner_tool_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practitioner_tools
      WHERE practitioner_tools.id = tool_id
      AND practitioner_tools.practitioner_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION get_tool_tags(p_tool_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tt.id,
    tt.name,
    tt.category,
    tt.color
  FROM tool_tags tt
  JOIN tool_tag_assignments tta ON tta.tag_id = tt.id
  WHERE tta.tool_id = p_tool_id;
END;
$$;

-- Function to update tool settings
CREATE OR REPLACE FUNCTION update_tool_settings(
  p_tool_id UUID,
  p_client_id UUID,
  p_session_id UUID,
  p_settings JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO practitioner_tool_settings (
    tool_id,
    client_id,
    session_id,
    settings
  )
  VALUES (
    p_tool_id,
    p_client_id,
    p_session_id,
    p_settings
  )
  ON CONFLICT (tool_id, client_id, session_id)
  DO UPDATE SET
    settings = p_settings,
    updated_at = now();
END;
$$;

-- Insert default tags
INSERT INTO tool_tags (name, category, color) VALUES
  ('Breathwork', 'type', '#3b82f6'),
  ('Meditation', 'type', '#6366f1'),
  ('Journaling', 'type', '#8b5cf6'),
  ('Ritual', 'type', '#d946ef'),
  ('Fire', 'element', '#ef4444'),
  ('Water', 'element', '#0ea5e9'),
  ('Earth', 'element', '#22c55e'),
  ('Air', 'element', '#a855f7'),
  ('Aether', 'element', '#6366f1'),
  ('Exploration', 'phase', '#f59e0b'),
  ('Integration', 'phase', '#10b981'),
  ('Mastery', 'phase', '#6366f1')
ON CONFLICT DO NOTHING;