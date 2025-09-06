-- Create user_sessions table for Maya's memory system
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  element TEXT NOT NULL CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether', 'mixed')),
  phase TEXT NOT NULL CHECK (phase IN ('initiation', 'challenge', 'integration', 'mastery', 'transcendence')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_created ON user_sessions(user_id, created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can manage all user sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Optional: Allow users to update their own recent sessions (within 1 hour)
CREATE POLICY "Users can update own recent sessions" ON user_sessions
    FOR UPDATE USING (
        auth.uid()::text = user_id 
        AND created_at > NOW() - INTERVAL '1 hour'
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
GRANT ALL ON user_sessions TO service_role;

-- Insert some test data for development
INSERT INTO user_sessions (user_id, element, phase) VALUES
    ('test-user-123', 'fire', 'challenge'),
    ('test-user-456', 'water', 'integration'),
    ('test-user-789', 'earth', 'mastery')
ON CONFLICT DO NOTHING;