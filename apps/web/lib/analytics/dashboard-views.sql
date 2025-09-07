-- Beta Dashboard Views for Maya Voice Analytics
-- Run this in Supabase SQL Editor after the main analytics schema

-- Real-time beta overview dashboard
CREATE OR REPLACE VIEW beta_dashboard_overview AS
SELECT 
  -- Time period
  DATE_TRUNC('hour', timestamp) as hour,
  DATE_TRUNC('day', timestamp) as day,
  
  -- Core metrics
  COUNT(DISTINCT session_id) as active_sessions,
  COUNT(CASE WHEN event_type = 'interaction_start' THEN 1 END) as total_interactions,
  COUNT(CASE WHEN event_type = 'voice_recording_start' THEN 1 END) as voice_interactions,
  COUNT(CASE WHEN event_type = 'interaction_start' AND event_data->>'mode' = 'text' THEN 1 END) as text_interactions,
  COUNT(CASE WHEN event_type LIKE '%_error' THEN 1 END) as total_errors,
  
  -- Success rates
  ROUND(
    COUNT(CASE WHEN event_type = 'interaction_complete' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type = 'interaction_start' THEN 1 END), 0), 
    1
  ) as interaction_success_rate,
  
  ROUND(
    COUNT(CASE WHEN event_type = 'tts_playback_complete' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type = 'tts_playback_start' THEN 1 END), 0), 
    1
  ) as voice_playback_success_rate,
  
  -- Average latency
  ROUND(AVG(CASE WHEN event_type = 'interaction_complete' THEN (event_data->>'latency_ms')::numeric END)) as avg_response_latency_ms,
  
  -- TTS provider breakdown
  COUNT(CASE WHEN event_type = 'tts_success' AND event_data->>'provider' = 'Sesame' THEN 1 END) as sesame_successes,
  COUNT(CASE WHEN event_type = 'tts_success' AND event_data->>'provider' = 'ElevenLabs' THEN 1 END) as elevenlabs_successes,
  COUNT(CASE WHEN event_type = 'tts_error' AND event_data->>'provider' = 'Sesame' THEN 1 END) as sesame_errors,
  COUNT(CASE WHEN event_type = 'tts_error' AND event_data->>'provider' = 'ElevenLabs' THEN 1 END) as elevenlabs_errors

FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), DATE_TRUNC('day', timestamp)
ORDER BY hour DESC;

-- Voice flow funnel analysis
CREATE OR REPLACE VIEW voice_flow_funnel AS
WITH flow_events AS (
  SELECT 
    session_id,
    COUNT(CASE WHEN event_type = 'voice_recording_start' THEN 1 END) as recordings_started,
    COUNT(CASE WHEN event_type = 'voice_recording_stop' THEN 1 END) as recordings_completed,
    COUNT(CASE WHEN event_type = 'transcription_success' THEN 1 END) as transcriptions_successful,
    COUNT(CASE WHEN event_type = 'maya_response_complete' THEN 1 END) as responses_generated,
    COUNT(CASE WHEN event_type = 'tts_success' THEN 1 END) as tts_generated,
    COUNT(CASE WHEN event_type = 'tts_playback_complete' THEN 1 END) as playbacks_completed,
    
    -- Error counts
    COUNT(CASE WHEN event_type = 'voice_recording_error' THEN 1 END) as recording_errors,
    COUNT(CASE WHEN event_type = 'transcription_error' THEN 1 END) as transcription_errors,
    COUNT(CASE WHEN event_type = 'maya_response_error' THEN 1 END) as response_errors,
    COUNT(CASE WHEN event_type = 'tts_error' THEN 1 END) as tts_errors,
    COUNT(CASE WHEN event_type = 'tts_playback_error' THEN 1 END) as playback_errors
  FROM analytics_events 
  WHERE timestamp >= NOW() - INTERVAL '24 hours'
  GROUP BY session_id
)
SELECT 
  -- Funnel metrics
  COUNT(*) as total_sessions,
  SUM(recordings_started) as step1_recording_started,
  SUM(recordings_completed) as step2_recording_completed,
  SUM(transcriptions_successful) as step3_transcription_success,
  SUM(responses_generated) as step4_response_generated,
  SUM(tts_generated) as step5_tts_generated,
  SUM(playbacks_completed) as step6_playback_completed,
  
  -- Conversion rates
  ROUND(SUM(recordings_completed)::numeric * 100.0 / NULLIF(SUM(recordings_started), 0), 1) as recording_completion_rate,
  ROUND(SUM(transcriptions_successful)::numeric * 100.0 / NULLIF(SUM(recordings_completed), 0), 1) as transcription_success_rate,
  ROUND(SUM(responses_generated)::numeric * 100.0 / NULLIF(SUM(transcriptions_successful), 0), 1) as response_generation_rate,
  ROUND(SUM(tts_generated)::numeric * 100.0 / NULLIF(SUM(responses_generated), 0), 1) as tts_generation_rate,
  ROUND(SUM(playbacks_completed)::numeric * 100.0 / NULLIF(SUM(tts_generated), 0), 1) as playback_completion_rate,
  
  -- Overall completion rate (end-to-end)
  ROUND(SUM(playbacks_completed)::numeric * 100.0 / NULLIF(SUM(recordings_started), 0), 1) as end_to_end_completion_rate,
  
  -- Error rates
  ROUND(SUM(recording_errors)::numeric * 100.0 / NULLIF(SUM(recordings_started), 0), 1) as recording_error_rate,
  ROUND(SUM(transcription_errors)::numeric * 100.0 / NULLIF(SUM(recordings_completed), 0), 1) as transcription_error_rate,
  ROUND(SUM(response_errors)::numeric * 100.0 / NULLIF(SUM(transcriptions_successful), 0), 1) as response_error_rate,
  ROUND(SUM(tts_errors)::numeric * 100.0 / NULLIF(SUM(responses_generated), 0), 1) as tts_error_rate,
  ROUND(SUM(playback_errors)::numeric * 100.0 / NULLIF(SUM(tts_generated), 0), 1) as playback_error_rate

FROM flow_events;

-- TTS provider performance comparison
CREATE OR REPLACE VIEW tts_provider_dashboard AS
SELECT 
  event_data->>'provider' as provider,
  DATE_TRUNC('hour', timestamp) as hour,
  
  -- Success/Error counts
  COUNT(CASE WHEN event_type = 'tts_success' THEN 1 END) as successes,
  COUNT(CASE WHEN event_type = 'tts_error' THEN 1 END) as errors,
  COUNT(CASE WHEN event_type = 'tts_playback_complete' THEN 1 END) as playbacks_completed,
  COUNT(CASE WHEN event_type = 'tts_playback_error' THEN 1 END) as playback_errors,
  
  -- Success rates
  ROUND(
    COUNT(CASE WHEN event_type = 'tts_success' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type IN ('tts_success', 'tts_error') THEN 1 END), 0), 
    1
  ) as tts_success_rate,
  
  ROUND(
    COUNT(CASE WHEN event_type = 'tts_playback_complete' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type IN ('tts_playback_start') THEN 1 END), 0), 
    1
  ) as playback_success_rate,
  
  -- Performance metrics
  ROUND(AVG(CASE WHEN event_type = 'tts_success' THEN (event_data->>'generation_duration_ms')::numeric END)) as avg_generation_ms,
  ROUND(AVG(CASE WHEN event_type = 'tts_playback_complete' THEN (event_data->>'audio_duration_ms')::numeric END)) as avg_audio_duration_ms,
  
  -- Fallback tracking
  COUNT(CASE WHEN event_type = 'tts_success' AND (event_data->>'fallback_triggered')::boolean = true THEN 1 END) as fallback_triggers

FROM analytics_events 
WHERE event_type IN ('tts_success', 'tts_error', 'tts_playback_start', 'tts_playback_complete', 'tts_playback_error')
  AND event_data->>'provider' IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY event_data->>'provider', DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC, provider;

-- User interaction patterns
CREATE OR REPLACE VIEW user_interaction_patterns AS
WITH user_sessions AS (
  SELECT 
    user_id,
    session_id,
    MIN(timestamp) as session_start,
    MAX(timestamp) as session_end,
    EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) as session_duration_seconds,
    COUNT(CASE WHEN event_type = 'interaction_start' AND event_data->>'mode' = 'voice' THEN 1 END) as voice_interactions,
    COUNT(CASE WHEN event_type = 'interaction_start' AND event_data->>'mode' = 'text' THEN 1 END) as text_interactions,
    COUNT(CASE WHEN event_type = 'interaction_complete' THEN 1 END) as completed_interactions,
    AVG(CASE WHEN event_type = 'interaction_complete' THEN (event_data->>'latency_ms')::numeric END) as avg_response_latency
  FROM analytics_events 
  WHERE timestamp >= NOW() - INTERVAL '24 hours'
    AND session_id IS NOT NULL
  GROUP BY user_id, session_id
)
SELECT 
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as total_sessions,
  ROUND(AVG(session_duration_seconds)) as avg_session_duration_seconds,
  ROUND(AVG(voice_interactions + text_interactions)) as avg_interactions_per_session,
  
  -- Interaction mode preferences
  ROUND(SUM(voice_interactions)::numeric * 100.0 / NULLIF(SUM(voice_interactions + text_interactions), 0), 1) as voice_preference_percent,
  ROUND(SUM(text_interactions)::numeric * 100.0 / NULLIF(SUM(voice_interactions + text_interactions), 0), 1) as text_preference_percent,
  
  -- Engagement metrics
  ROUND(SUM(completed_interactions)::numeric * 100.0 / NULLIF(SUM(voice_interactions + text_interactions), 0), 1) as overall_completion_rate,
  ROUND(AVG(avg_response_latency)) as avg_response_latency_ms,
  
  -- Session quality
  COUNT(CASE WHEN voice_interactions + text_interactions >= 3 THEN 1 END) as engaged_sessions,
  COUNT(CASE WHEN session_duration_seconds >= 60 THEN 1 END) as sessions_over_1min

FROM user_sessions;

-- Error breakdown for debugging
CREATE OR REPLACE VIEW error_breakdown_dashboard AS
SELECT 
  event_type,
  event_data->>'error_type' as error_type,
  event_data->>'error_message' as error_message,
  COUNT(*) as error_count,
  COUNT(DISTINCT session_id) as affected_sessions,
  ROUND(AVG((event_data->>'duration_ms')::numeric)) as avg_duration_before_error_ms,
  MAX(timestamp) as last_occurrence,
  
  -- Group common error messages
  CASE 
    WHEN event_data->>'error_message' ILIKE '%permission%' OR event_data->>'error_type' = 'mic_denied' THEN 'Microphone Permission'
    WHEN event_data->>'error_message' ILIKE '%network%' OR event_data->>'error_message' ILIKE '%connection%' THEN 'Network Issues'
    WHEN event_data->>'error_message' ILIKE '%audio%' OR event_data->>'error_message' ILIKE '%playback%' THEN 'Audio Playback'
    WHEN event_data->>'error_type' = 'api_error' THEN 'API Errors'
    ELSE 'Other'
  END as error_category

FROM analytics_events 
WHERE event_type LIKE '%_error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY event_type, event_data->>'error_type', event_data->>'error_message'
ORDER BY error_count DESC, last_occurrence DESC;

-- Real-time activity feed (last 100 events)
CREATE OR REPLACE VIEW recent_activity_feed AS
SELECT 
  timestamp,
  session_id,
  user_id,
  event_type,
  CASE 
    WHEN event_type = 'session_start' THEN '🚀 Session started'
    WHEN event_type = 'voice_recording_start' THEN '🎤 Started recording'
    WHEN event_type = 'voice_recording_stop' THEN '⏹️ Stopped recording'
    WHEN event_type = 'transcription_success' THEN '✍️ Transcription successful'
    WHEN event_type = 'maya_response_complete' THEN '🤖 Maya responded'
    WHEN event_type = 'tts_success' THEN '🔊 Voice generated (' || (event_data->>'provider') || ')'
    WHEN event_type = 'tts_playback_complete' THEN '🎵 Playback completed'
    WHEN event_type = 'interaction_complete' THEN '✅ Interaction completed'
    WHEN event_type LIKE '%_error' THEN '❌ Error: ' || (event_data->>'error_type')
    ELSE '📝 ' || event_type
  END as activity_description,
  event_data->>'latency_ms' as latency_ms,
  event_data->>'provider' as provider,
  event_data->>'mode' as interaction_mode
FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC 
LIMIT 100;

-- Performance trends over time
CREATE OR REPLACE VIEW performance_trends AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  
  -- Latency trends
  ROUND(AVG(CASE WHEN event_type = 'interaction_complete' THEN (event_data->>'latency_ms')::numeric END)) as avg_response_latency,
  ROUND(AVG(CASE WHEN event_type = 'transcription_success' THEN (event_data->>'transcription_duration_ms')::numeric END)) as avg_transcription_latency,
  ROUND(AVG(CASE WHEN event_type = 'tts_success' THEN (event_data->>'generation_duration_ms')::numeric END)) as avg_tts_generation_latency,
  
  -- Volume trends
  COUNT(CASE WHEN event_type = 'interaction_start' THEN 1 END) as interactions_per_hour,
  COUNT(DISTINCT session_id) as active_sessions_per_hour,
  COUNT(CASE WHEN event_type LIKE '%_error' THEN 1 END) as errors_per_hour,
  
  -- Quality trends
  ROUND(
    COUNT(CASE WHEN event_type = 'interaction_complete' THEN 1 END)::numeric * 100.0 / 
    NULLIF(COUNT(CASE WHEN event_type = 'interaction_start' THEN 1 END), 0), 
    1
  ) as success_rate_per_hour

FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

COMMENT ON VIEW beta_dashboard_overview IS 'Main beta dashboard showing key metrics over time';
COMMENT ON VIEW voice_flow_funnel IS 'Voice interaction funnel analysis with conversion rates';
COMMENT ON VIEW tts_provider_dashboard IS 'TTS provider performance comparison (Sesame vs ElevenLabs)';
COMMENT ON VIEW user_interaction_patterns IS 'User behavior and interaction preferences analysis';
COMMENT ON VIEW error_breakdown_dashboard IS 'Detailed error analysis for debugging';
COMMENT ON VIEW recent_activity_feed IS 'Real-time feed of recent user activities';
COMMENT ON VIEW performance_trends IS 'Performance metrics trends over time';