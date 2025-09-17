-- Migration: User Preferences Table
-- Support for voice modes, interaction styles, and journey tracking

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,

    -- Voice Configuration
    voice_profile_id TEXT DEFAULT 'maya-alloy',
    voice_mode TEXT DEFAULT 'push-to-talk' CHECK (voice_mode IN ('push-to-talk', 'wake-word')),
    interaction_mode TEXT DEFAULT 'conversational' CHECK (interaction_mode IN ('conversational', 'meditative', 'guided')),
    custom_wake_word TEXT,

    -- Elemental Affinities (0-10 scale)
    elemental_affinities JSONB DEFAULT '{
        "fire": 0,
        "water": 0,
        "earth": 0,
        "air": 0,
        "aether": 0
    }'::jsonb,

    -- Journey Progress Tracking
    journey_progress JSONB DEFAULT '{
        "daysCompleted": 0,
        "currentPhase": "initiation"
    }'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_voice_mode ON user_preferences(voice_mode);
CREATE INDEX IF NOT EXISTS idx_user_preferences_interaction_mode ON user_preferences(interaction_mode);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own preferences
CREATE POLICY "Users can access own preferences" ON user_preferences
    FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Grant permissions
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON user_preferences TO service_role;

-- Function to safely update elemental affinities
CREATE OR REPLACE FUNCTION update_elemental_affinity(
    p_user_id TEXT,
    p_element TEXT,
    p_delta NUMERIC
) RETURNS VOID AS $$
DECLARE
    current_value NUMERIC;
    new_value NUMERIC;
BEGIN
    -- Get current affinity value
    SELECT (elemental_affinities->>p_element)::NUMERIC INTO current_value
    FROM user_preferences
    WHERE user_id = p_user_id;

    -- Calculate new value (clamped between 0 and 10)
    new_value := GREATEST(0, LEAST(10, COALESCE(current_value, 0) + p_delta));

    -- Update the specific element affinity
    UPDATE user_preferences
    SET elemental_affinities = elemental_affinities || jsonb_build_object(p_element, new_value),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Create record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO user_preferences (user_id, elemental_affinities)
        VALUES (p_user_id, jsonb_build_object(p_element, new_value))
        ON CONFLICT (user_id) DO UPDATE SET
            elemental_affinities = user_preferences.elemental_affinities || jsonb_build_object(p_element, new_value),
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's dominant element
CREATE OR REPLACE FUNCTION get_dominant_element(p_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    dominant_element TEXT;
BEGIN
    SELECT element_name INTO dominant_element
    FROM (
        SELECT
            key as element_name,
            value::NUMERIC as affinity_value
        FROM user_preferences up,
             jsonb_each_text(up.elemental_affinities)
        WHERE up.user_id = p_user_id
    ) t
    ORDER BY affinity_value DESC
    LIMIT 1;

    RETURN COALESCE(dominant_element, 'fire');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, voice_profile_id, voice_mode, interaction_mode)
SELECT DISTINCT user_id, 'maya-alloy', 'push-to-talk', 'conversational'
FROM oracle_interactions
WHERE NOT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_preferences.user_id = oracle_interactions.user_id
)
ON CONFLICT (user_id) DO NOTHING;