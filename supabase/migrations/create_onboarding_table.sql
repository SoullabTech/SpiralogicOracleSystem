-- Create user onboarding table for Spiralogic Oracle System
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  elemental_affinity VARCHAR(20) NOT NULL CHECK (elemental_affinity IN ('fire', 'water', 'earth', 'air', 'aether')),
  spiral_phase VARCHAR(20) NOT NULL CHECK (spiral_phase IN ('initiation', 'expansion', 'integration', 'mastery')),
  tone_preference VARCHAR(20) NOT NULL CHECK (tone_preference IN ('insight', 'symbolic')),
  name VARCHAR(255),
  spiritual_backgrounds JSONB DEFAULT '[]',
  current_challenges JSONB DEFAULT '[]',
  guidance_preferences JSONB DEFAULT '[]',
  experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  intentions TEXT,
  voice_personality VARCHAR(20) CHECK (voice_personality IN ('gentle', 'direct', 'mystical', 'practical', 'adaptive')),
  communication_style VARCHAR(20) CHECK (communication_style IN ('conversational', 'ceremonial', 'therapeutic', 'educational')),
  onboarding_data JSONB, -- Complete onboarding data as JSON
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_elemental_affinity ON user_onboarding(elemental_affinity);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_spiral_phase ON user_onboarding(spiral_phase);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_tone_preference ON user_onboarding(tone_preference);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_experience_level ON user_onboarding(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_auth_user ON user_onboarding(auth_user_id);

-- Enable Row Level Security
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own onboarding data
CREATE POLICY "Users can view own onboarding data" ON user_onboarding
  FOR SELECT USING (
    auth.uid() = auth_user_id OR 
    user_id = current_setting('app.current_user_id', true) OR
    auth_user_id IS NULL -- Allow anonymous users to read their own data
  );

CREATE POLICY "Users can insert own onboarding data" ON user_onboarding
  FOR INSERT WITH CHECK (
    auth.uid() = auth_user_id OR
    auth_user_id IS NULL -- Allow anonymous onboarding
  );

CREATE POLICY "Users can update own onboarding data" ON user_onboarding
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR
    user_id = current_setting('app.current_user_id', true) OR
    auth_user_id IS NULL
  ) WITH CHECK (
    auth.uid() = auth_user_id OR
    user_id = current_setting('app.current_user_id', true) OR
    auth_user_id IS NULL
  );

-- Create policy for service role to access all data
CREATE POLICY "Service role can access all onboarding data" ON user_onboarding
  FOR ALL USING (
    current_setting('role') = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create view for onboarding analytics
CREATE OR REPLACE VIEW onboarding_analytics AS
SELECT 
  elemental_affinity,
  spiral_phase,
  tone_preference,
  experience_level,
  COUNT(*) as total_users,
  AVG(CASE WHEN intentions IS NOT NULL AND LENGTH(intentions) > 0 THEN 1 ELSE 0 END) as completion_rate,
  DATE_TRUNC('day', created_at) as signup_date,
  AVG(JSONB_ARRAY_LENGTH(spiritual_backgrounds)) as avg_spiritual_backgrounds,
  AVG(JSONB_ARRAY_LENGTH(current_challenges)) as avg_challenges
FROM user_onboarding
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY elemental_affinity, spiral_phase, tone_preference, experience_level, DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC, elemental_affinity, spiral_phase;

-- Grant access to the analytics view
GRANT SELECT ON onboarding_analytics TO authenticated;
GRANT SELECT ON onboarding_analytics TO anon;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_onboarding_updated_at 
BEFORE UPDATE ON user_onboarding 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create materialized view for element distribution (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS element_distribution AS
SELECT 
  elemental_affinity,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_onboarding
GROUP BY elemental_affinity
ORDER BY user_count DESC;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_element_distribution_element ON element_distribution(elemental_affinity);

-- Create function to refresh analytics views
CREATE OR REPLACE FUNCTION refresh_onboarding_analytics() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY element_distribution;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on refresh function
GRANT EXECUTE ON FUNCTION refresh_onboarding_analytics() TO authenticated;