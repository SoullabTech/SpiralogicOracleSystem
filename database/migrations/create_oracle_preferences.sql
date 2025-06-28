-- Create oracle_preferences table for storing user Oracle configuration
-- This table stores the Oracle name, voice selection, and configuration metadata

CREATE TABLE oracle_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  oracle_name VARCHAR(40) NOT NULL,
  oracle_voice VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one Oracle configuration per user
  UNIQUE(user_id),
  
  -- Constraints
  CONSTRAINT oracle_name_not_empty CHECK (LENGTH(TRIM(oracle_name)) > 0),
  CONSTRAINT oracle_voice_valid CHECK (oracle_voice IN (
    'aunt-annie', 'deep-sage', 'matrix-oracle', 'fire-essence', 
    'water-flow', 'earth-steady'
  ))
);

-- Enable RLS
ALTER TABLE oracle_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Oracle preferences" 
  ON oracle_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Oracle preferences" 
  ON oracle_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Oracle preferences" 
  ON oracle_preferences FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Oracle preferences" 
  ON oracle_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_oracle_preferences_updated_at
  BEFORE UPDATE ON oracle_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_oracle_preferences_user_id ON oracle_preferences(user_id);
CREATE INDEX idx_oracle_preferences_voice ON oracle_preferences(oracle_voice);
CREATE INDEX idx_oracle_preferences_created_at ON oracle_preferences(created_at DESC);

-- Create a view for Oracle analytics
CREATE VIEW oracle_configuration_stats AS
SELECT 
  oracle_voice,
  COUNT(*) as user_count,
  ROUND(AVG(LENGTH(oracle_name)), 2) as avg_name_length,
  MIN(created_at) as first_configured,
  MAX(created_at) as last_configured
FROM oracle_preferences
GROUP BY oracle_voice
ORDER BY user_count DESC;

-- Grant permissions on the view
GRANT SELECT ON oracle_configuration_stats TO authenticated;

-- Sample data for development (remove in production)
-- INSERT INTO oracle_preferences (user_id, oracle_name, oracle_voice) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'Sophia', 'aunt-annie'),
--   ('22222222-2222-2222-2222-222222222222', 'Marcus', 'deep-sage'),
--   ('33333333-3333-3333-3333-333333333333', 'Luna', 'matrix-oracle');

-- Comments for documentation
COMMENT ON TABLE oracle_preferences IS 'Stores user Oracle configuration including name and voice selection';
COMMENT ON COLUMN oracle_preferences.oracle_name IS 'User-chosen name for their Oracle (max 40 characters)';
COMMENT ON COLUMN oracle_preferences.oracle_voice IS 'Selected voice ID from available voice options';
COMMENT ON COLUMN oracle_preferences.user_id IS 'References the authenticated user who owns this Oracle';

-- Function to get Oracle display name
CREATE OR REPLACE FUNCTION get_oracle_display_name(pref_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  oracle_name TEXT;
BEGIN
  SELECT op.oracle_name INTO oracle_name
  FROM oracle_preferences op
  WHERE op.user_id = pref_user_id;
  
  RETURN COALESCE(oracle_name, 'Oracle');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;