-- Create feedback table for Spiralogic Oracle System
CREATE TABLE IF NOT EXISTS oracle_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  element VARCHAR(20) NOT NULL CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  tone VARCHAR(20) NOT NULL CHECK (tone IN ('insight', 'symbolic')),
  feedback INTEGER NOT NULL CHECK (feedback >= 1 AND feedback <= 5),
  user_note TEXT,
  session_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oracle_feedback_element ON oracle_feedback(element);
CREATE INDEX IF NOT EXISTS idx_oracle_feedback_tone ON oracle_feedback(tone);
CREATE INDEX IF NOT EXISTS idx_oracle_feedback_timestamp ON oracle_feedback(timestamp);
CREATE INDEX IF NOT EXISTS idx_oracle_feedback_session ON oracle_feedback(session_id);

-- Enable Row Level Security
ALTER TABLE oracle_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous feedback (allows anyone to insert, admins to read all)
CREATE POLICY "Enable insert for everyone" ON oracle_feedback
  FOR INSERT WITH CHECK (true);

-- Create policy for reading own feedback (if user is logged in)
CREATE POLICY "Users can view own feedback" ON oracle_feedback
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for admins/service role to read all feedback
CREATE POLICY "Service role can view all feedback" ON oracle_feedback
  FOR SELECT USING (
    current_setting('role') = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create view for feedback analytics
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
  element,
  tone,
  AVG(feedback::DECIMAL) as average_rating,
  COUNT(*) as total_responses,
  COUNT(CASE WHEN feedback >= 4 THEN 1 END) as positive_responses,
  DATE_TRUNC('day', timestamp) as date
FROM oracle_feedback
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY element, tone, DATE_TRUNC('day', timestamp)
ORDER BY date DESC, element, tone;

-- Grant access to the analytics view
GRANT SELECT ON feedback_analytics TO authenticated;
GRANT SELECT ON feedback_analytics TO anon;