-- Voice Flow Analytics Table Schema for Supabase
-- Create table for tracking beta voice flow metrics

CREATE TABLE IF NOT EXISTS voice_flow_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Session identification
  session_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Event classification
  event_type TEXT NOT NULL CHECK (event_type IN (
    'flow_start', 
    'flow_complete', 
    'flow_error', 
    'provider_switch', 
    'interaction', 
    'session_metrics'
  )),
  
  stage TEXT CHECK (stage IN (
    'recording', 
    'transcription', 
    'processing', 
    'speaking', 
    'complete', 
    'error'
  )),
  
  interaction_mode TEXT NOT NULL CHECK (interaction_mode IN ('voice', 'text')),
  
  tts_provider TEXT CHECK (tts_provider IN ('Sesame', 'ElevenLabs', 'fallback_failed')),
  
  -- Metrics and metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for common queries
  INDEX idx_voice_analytics_session_id (session_id),
  INDEX idx_voice_analytics_event_type (event_type),
  INDEX idx_voice_analytics_created_at (created_at),
  INDEX idx_voice_analytics_tts_provider (tts_provider),
  INDEX idx_voice_analytics_interaction_mode (interaction_mode)
);

-- Enable Row Level Security (RLS)
ALTER TABLE voice_flow_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own analytics
CREATE POLICY "Users can insert their own voice analytics" ON voice_flow_analytics
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id IS NULL);

-- Create policy to allow reading analytics (for dashboards)
CREATE POLICY "Allow reading voice analytics" ON voice_flow_analytics
  FOR SELECT USING (true);

-- Grant permissions
GRANT INSERT, SELECT ON voice_flow_analytics TO authenticated;
GRANT SELECT ON voice_flow_analytics TO anon;

-- Sample queries for common analytics needs:

-- 1. Get interaction mode preferences by user
-- SELECT 
--   user_id,
--   interaction_mode,
--   COUNT(*) as interactions,
--   AVG((metadata->>'response_latency_ms')::numeric) as avg_latency_ms
-- FROM voice_flow_analytics 
-- WHERE event_type = 'interaction' 
--   AND stage = 'complete'
-- GROUP BY user_id, interaction_mode
-- ORDER BY interactions DESC;

-- 2. TTS Provider reliability
-- SELECT 
--   tts_provider,
--   COUNT(*) as attempts,
--   COUNT(CASE WHEN metadata->>'playback_success' = 'true' THEN 1 END) as successes,
--   AVG((metadata->>'tts_latency_ms')::numeric) as avg_tts_latency
-- FROM voice_flow_analytics 
-- WHERE tts_provider IS NOT NULL
-- GROUP BY tts_provider;

-- 3. Voice flow completion rates
-- WITH flow_starts AS (
--   SELECT session_id, COUNT(*) as starts 
--   FROM voice_flow_analytics 
--   WHERE event_type = 'flow_start' 
--   GROUP BY session_id
-- ),
-- flow_completes AS (
--   SELECT session_id, COUNT(*) as completes 
--   FROM voice_flow_analytics 
--   WHERE event_type = 'flow_complete' 
--   GROUP BY session_id
-- )
-- SELECT 
--   (SUM(completes)::float / SUM(starts)::float * 100) as completion_rate_percent
-- FROM flow_starts 
-- FULL OUTER JOIN flow_completes USING (session_id);

-- 4. Error analysis
-- SELECT 
--   metadata->>'error_type' as error_type,
--   stage,
--   COUNT(*) as error_count,
--   metadata->>'error_message' as sample_message
-- FROM voice_flow_analytics 
-- WHERE event_type = 'flow_error'
-- GROUP BY metadata->>'error_type', stage, metadata->>'error_message'
-- ORDER BY error_count DESC;