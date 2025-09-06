-- 🚀 APPLY THIS IN SUPABASE SQL EDITOR
-- Copy and paste this entire content into Supabase Dashboard > SQL Editor > New Query

-- Migration: Voice Session and Event Tables
-- Created: 2025-09-05
-- Purpose: Fix backend errors by creating missing tables

-- 👤 User Sessions Table
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
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own voice events"
  ON public.voice_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own memory events" 
  ON public.memory_events FOR ALL USING (auth.uid() = user_id);

-- 🔄 Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✅ VERIFICATION QUERY
-- Run this after applying to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('user_sessions', 'voice_events', 'memory_events');