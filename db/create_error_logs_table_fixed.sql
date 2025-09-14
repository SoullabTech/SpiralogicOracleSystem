-- Create error_logs table for comprehensive error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  context TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  environment VARCHAR(20),
  url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  severity VARCHAR(20) DEFAULT 'error',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_environment ON error_logs(environment);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON error_logs(context);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

-- Enable Row Level Security (RLS)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage all error logs" ON error_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to view their own errors
CREATE POLICY "Users can view their own errors" ON error_logs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow anonymous error logging
CREATE POLICY "Allow anonymous error logging" ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE error_logs IS 'Comprehensive error logging for production debugging';
COMMENT ON COLUMN error_logs.severity IS 'error, warning, info';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been addressed';