-- Migration: Voice Session and Event Tables
-- Created: 2025-09-05
-- Purpose: Create tables for voice recording sessions, events, and memory tracking

-- 👤 User Sessions Table
-- Tracks voice interaction sessions for each user
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 🎤 Voice Events Table 
-- Records all voice-related events during sessions
CREATE TABLE IF NOT EXISTS public.voice_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  transcript text,
  event_type text CHECK (event_type IN ('start', 'stop', 'silence', 'error', 'transcript', 'audio_generated')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 🧠 Memory Events Table
-- Stores memory-related events and insights from conversations  
CREATE TABLE IF NOT EXISTS public.memory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  memory_text text,
  memory_type text CHECK (memory_type IN ('insight', 'pattern', 'symbol', 'reflection', 'breakthrough')),
  memory_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 📈 Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_voice_events_user_id ON public.voice_events(user_id);  
CREATE INDEX IF NOT EXISTS idx_voice_events_session_id ON public.voice_events(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_events_event_type ON public.voice_events(event_type);
CREATE INDEX IF NOT EXISTS idx_voice_events_created_at ON public.voice_events(created_at);

CREATE INDEX IF NOT EXISTS idx_memory_events_user_id ON public.memory_events(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_session_id ON public.memory_events(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_memory_type ON public.memory_events(memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_events_created_at ON public.memory_events(created_at);

-- 🔐 Row Level Security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_events ENABLE ROW LEVEL SECURITY;

-- 👥 Security Policies
-- Users can only access their own data

-- User Sessions Policies
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Voice Events Policies  
CREATE POLICY "Users can manage own voice events"
  ON public.voice_events
  FOR ALL
  USING (auth.uid() = user_id);

-- Memory Events Policies
CREATE POLICY "Users can manage own memory events" 
  ON public.memory_events
  FOR ALL
  USING (auth.uid() = user_id);

-- 🔄 Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to user_sessions
CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 Comments for Documentation
COMMENT ON TABLE public.user_sessions IS 'Voice interaction sessions for tracking user conversations';
COMMENT ON TABLE public.voice_events IS 'Individual voice events within sessions (transcripts, audio generation, etc.)';
COMMENT ON TABLE public.memory_events IS 'Memory and insight events extracted from conversations';

COMMENT ON COLUMN public.user_sessions.session_metadata IS 'JSON metadata about the session (duration, element focus, etc.)';
COMMENT ON COLUMN public.voice_events.event_data IS 'JSON data specific to the event type (audio URLs, confidence scores, etc.)';
COMMENT ON COLUMN public.memory_events.memory_metadata IS 'JSON metadata about the memory (confidence, symbols, archetypes, etc.)';