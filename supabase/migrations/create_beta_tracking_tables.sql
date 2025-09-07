-- Beta Testing Analytics Tables
-- Run this migration in Supabase SQL Editor

-- User Sessions Table (tracks Maya interactions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  voice_used BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  INDEX(user_id),
  INDEX(session_id),
  INDEX(created_at)
);

-- Beta Feedback Table (user ratings and feedback)
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  category TEXT DEFAULT 'general', -- voice, memory, experience, technical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  
  INDEX(user_id),
  INDEX(rating),
  INDEX(category),
  INDEX(created_at)
);

-- Voice Events Table (STT/TTS performance tracking)  
CREATE TABLE IF NOT EXISTS voice_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'stt', 'tts', 'permission'
  success BOOLEAN NOT NULL DEFAULT true,
  latency_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  INDEX(user_id),
  INDEX(event_type),
  INDEX(success),
  INDEX(created_at)
);

-- Memory Performance Table (memory system analytics)
CREATE TABLE IF NOT EXISTS memory_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'load', 'persist', 'search'
  layer_type TEXT NOT NULL, -- 'session', 'journal', 'profile', 'symbolic', 'external'  
  success BOOLEAN NOT NULL DEFAULT true,
  latency_ms INTEGER,
  context_size INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  INDEX(user_id),
  INDEX(operation_type),
  INDEX(layer_type),
  INDEX(success),
  INDEX(created_at)
);

-- Beta Tester Profiles (enhanced user tracking)
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_sessions INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  preferred_element TEXT DEFAULT 'aether',
  onboarding_completed BOOLEAN DEFAULT false,
  consent_analytics BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  INDEX(user_id),
  INDEX(last_active),
  INDEX(onboarding_completed)
);

-- System Health Snapshots (periodic system metrics)
CREATE TABLE IF NOT EXISTS system_health_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  response_time_ms INTEGER,
  error_rate DECIMAL(5,2), -- percentage
  uptime_percentage DECIMAL(5,2),
  active_connections INTEGER,
  metadata JSONB DEFAULT '{}',
  
  INDEX(service_name),
  INDEX(status),
  INDEX(timestamp)
);

-- Create RLS policies for security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin access policy (you'll need to adjust based on your auth setup)
CREATE POLICY "Admin access to beta analytics" ON user_sessions
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to feedback" ON beta_feedback
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to voice events" ON voice_events
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to memory events" ON memory_events
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to beta testers" ON beta_testers
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to health snapshots" ON system_health_snapshots
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions for easy analytics queries
CREATE OR REPLACE FUNCTION get_beta_summary(days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'active_users', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_sessions 
      WHERE created_at > now() - (days_back || ' days')::interval
    ),
    'total_sessions', (
      SELECT COUNT(*) 
      FROM user_sessions 
      WHERE created_at > now() - (days_back || ' days')::interval
    ),
    'avg_rating', (
      SELECT ROUND(AVG(rating), 2) 
      FROM beta_feedback 
      WHERE created_at > now() - (days_back || ' days')::interval 
      AND rating IS NOT NULL
    ),
    'voice_success_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0)), 2
      )
      FROM voice_events 
      WHERE created_at > now() - (days_back || ' days')::interval
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;