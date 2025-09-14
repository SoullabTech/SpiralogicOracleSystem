-- Create beta_feedback table for collecting user feedback
CREATE TABLE IF NOT EXISTS beta_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  feedback TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_timestamp ON beta_feedback(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert feedback
CREATE POLICY "Anyone can submit feedback" ON beta_feedback
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow service role to read all feedback
CREATE POLICY "Service role can read all feedback" ON beta_feedback
  FOR SELECT
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE beta_feedback IS 'Beta user feedback collection';
COMMENT ON COLUMN beta_feedback.feedback IS 'User submitted feedback text';
COMMENT ON COLUMN beta_feedback.page_url IS 'Page where feedback was submitted from';
COMMENT ON COLUMN beta_feedback.user_agent IS 'Browser/device information';