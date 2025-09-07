/*
🚀 COPY AND PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
   
   Steps:
   1. Go to https://supabase.com/dashboard/project/jkbetmadzcpoinjogkli
   2. Click "SQL Editor" in the left sidebar
   3. Click "New Query" 
   4. Copy this entire content and paste it
   5. Click "Run" button
*/

-- ===== VOICE SESSION TABLES MIGRATION =====
-- This fixes the backend crash errors

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

-- ===== ANALYTICS EVENT LOGS TABLE =====
-- For tracking audio unlock and other analytics events

-- 📊 Event Logs Table
CREATE TABLE IF NOT EXISTS public.event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  payload jsonb DEFAULT '{}',
  browser_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 📈 Performance Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_event_logs_event_name ON public.event_logs(event_name);
CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON public.event_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_session_id ON public.event_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_audio ON public.event_logs(event_name) 
  WHERE event_name IN ('audio_unlocked', 'audio_unlock_failed');
CREATE INDEX IF NOT EXISTS idx_event_logs_reflections ON public.event_logs(event_name, created_at)
  WHERE event_name = 'reflection_submitted';

-- 🔐 Row Level Security for Event Logs
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- 👥 Security Policy for Event Logs
CREATE POLICY "Users can view own events"
  ON public.event_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all events"
  ON public.event_logs FOR ALL USING (auth.role() = 'service_role');

-- Public insert for anonymous tracking
CREATE POLICY "Anyone can insert events"
  ON public.event_logs FOR INSERT WITH CHECK (true);

-- ===== VERIFICATION =====
-- This should show 4 tables after successful migration
SELECT 'SUCCESS: Tables created!' AS status,
       array_agg(table_name) AS created_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_sessions', 'voice_events', 'memory_events', 'event_logs');