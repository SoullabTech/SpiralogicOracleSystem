-- Analytics events table for beta testing metrics
-- Run this in Supabase SQL Editor to create the analytics schema

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- RLS policies for analytics events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for analytics (needed for unauthenticated users)
CREATE POLICY "Allow anonymous analytics inserts" ON analytics_events
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow users to insert their own events
CREATE POLICY "Allow authenticated analytics inserts" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to read their own analytics data
CREATE POLICY "Users can read own analytics" ON analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to read all analytics (you may want to create an admin role)
-- CREATE POLICY "Admins can read all analytics" ON analytics_events
--   FOR SELECT TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Create a view for session summaries
CREATE OR REPLACE VIEW session_summaries AS
SELECT 
  session_id,
  user_id,
  MIN(timestamp) as session_start,
  MAX(timestamp) as session_end,
  EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) * 1000 as duration_ms,
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_type LIKE '%_start' THEN 1 END) as interactions_started,
  COUNT(CASE WHEN event_type LIKE '%_complete' THEN 1 END) as interactions_completed,
  COUNT(CASE WHEN event_type LIKE '%_error' THEN 1 END) as errors,
  COUNT(CASE WHEN event_type = 'voice_recording_start' THEN 1 END) as voice_interactions,
  COUNT(CASE WHEN event_type = 'interaction_start' AND event_data->>'mode' = 'text' THEN 1 END) as text_interactions
FROM analytics_events 
WHERE event_type != 'page_view'
GROUP BY session_id, user_id;

-- Create a view for TTS provider performance
CREATE OR REPLACE VIEW tts_provider_performance AS
SELECT 
  event_data->>'provider' as provider,
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(CASE WHEN event_type = 'tts_success' THEN 1 END) as successes,
  COUNT(CASE WHEN event_type = 'tts_error' THEN 1 END) as errors,
  ROUND(
    COUNT(CASE WHEN event_type = 'tts_success' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type IN ('tts_success', 'tts_error') THEN 1 END), 0), 
    2
  ) as success_rate_percent,
  AVG(CASE WHEN event_type = 'tts_success' THEN (event_data->>'generation_duration_ms')::numeric END) as avg_generation_ms
FROM analytics_events 
WHERE event_type IN ('tts_success', 'tts_error')
  AND event_data->>'provider' IS NOT NULL
GROUP BY event_data->>'provider', DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Create a view for interaction mode analysis
CREATE OR REPLACE VIEW interaction_mode_analysis AS
SELECT 
  DATE_TRUNC('day', timestamp) as day,
  event_data->>'mode' as interaction_mode,
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN event_type = 'interaction_complete' THEN 1 END) as completed_interactions,
  COUNT(CASE WHEN event_type LIKE '%_error' THEN 1 END) as failed_interactions,
  ROUND(
    COUNT(CASE WHEN event_type = 'interaction_complete' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(*), 0), 
    2
  ) as completion_rate_percent
FROM analytics_events 
WHERE event_type IN ('interaction_start', 'interaction_complete')
  AND event_data->>'mode' IS NOT NULL
GROUP BY DATE_TRUNC('day', timestamp), event_data->>'mode'
ORDER BY day DESC, interaction_mode;

COMMENT ON TABLE analytics_events IS 'Beta testing analytics events for tracking user interactions, voice flow performance, and TTS reliability';
COMMENT ON VIEW session_summaries IS 'Aggregated session metrics for analyzing user engagement patterns';
COMMENT ON VIEW tts_provider_performance IS 'TTS provider reliability and performance metrics';
COMMENT ON VIEW interaction_mode_analysis IS 'Analysis of voice vs text interaction preferences and success rates';