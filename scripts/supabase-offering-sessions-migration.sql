/*
🌸 HOLOFLOWER OFFERING SESSIONS MIGRATION
   
   This adds support for tracking daily offering sessions with rest/bloom states
   
   Steps:
   1. Go to https://supabase.com/dashboard/project/jkbetmadzcpoinjogkli
   2. Click "SQL Editor" in the left sidebar
   3. Click "New Query" 
   4. Copy this entire content and paste it
   5. Click "Run" button
*/

-- ===== OFFERING SESSIONS TABLE =====
-- Tracks daily Holoflower check-ins with offering/rest states

-- 🌸 Offering Sessions Table
CREATE TABLE IF NOT EXISTS public.offering_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text CHECK (status IN ('rest', 'offering', 'bloom', 'transcendent')) NOT NULL,
  petal_scores jsonb DEFAULT '[]', -- Array of 8 petal strength scores [0-10]
  selected_petals jsonb DEFAULT '[]', -- Array of selected petal elements
  oracle_reflection text,
  journal_prompt text,
  session_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one session per user per day
  CONSTRAINT unique_user_date UNIQUE (user_id, session_date)
);

-- 🌱 Offering Timeline History View
-- This creates a timeline of offerings with proper icon mapping
CREATE VIEW public.offering_timeline AS
SELECT 
  id,
  user_id,
  session_date,
  status,
  CASE 
    WHEN status = 'rest' THEN '🌱'
    WHEN status = 'offering' THEN '🌸'
    WHEN status = 'bloom' THEN '🌸'
    WHEN status = 'transcendent' THEN '✨'
    ELSE '🌸'
  END as icon,
  petal_scores,
  selected_petals,
  oracle_reflection,
  journal_prompt,
  created_at
FROM public.offering_sessions
ORDER BY session_date DESC;

-- 📊 Offering Statistics View
-- Provides insights into offering patterns
CREATE VIEW public.offering_stats AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN status = 'rest' THEN 1 END) as rest_days,
  COUNT(CASE WHEN status IN ('offering', 'bloom', 'transcendent') THEN 1 END) as offering_days,
  ROUND(
    COUNT(CASE WHEN status IN ('offering', 'bloom', 'transcendent') THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as offering_percentage,
  MAX(session_date) as last_session,
  MIN(session_date) as first_session
FROM public.offering_sessions
GROUP BY user_id;

-- 📈 Performance Indexes
CREATE INDEX IF NOT EXISTS idx_offering_sessions_user_id ON public.offering_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_offering_sessions_date ON public.offering_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_offering_sessions_status ON public.offering_sessions(status);
CREATE INDEX IF NOT EXISTS idx_offering_sessions_user_date ON public.offering_sessions(user_id, session_date);

-- 🔐 Row Level Security (RLS)
ALTER TABLE public.offering_sessions ENABLE ROW LEVEL SECURITY;

-- 👥 Security Policies
CREATE POLICY "Users can manage own offering sessions"
  ON public.offering_sessions FOR ALL USING (auth.uid() = user_id);

-- View policies
CREATE POLICY "Users can view own offering timeline"
  ON public.offering_timeline FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own offering stats"
  ON public.offering_stats FOR SELECT USING (auth.uid() = user_id);

-- 🔄 Updated At Trigger
CREATE TRIGGER update_offering_sessions_updated_at 
  BEFORE UPDATE ON public.offering_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== HELPER FUNCTIONS =====

-- 🌸 Function to create or update daily offering
CREATE OR REPLACE FUNCTION upsert_offering_session(
  p_user_id uuid,
  p_date date DEFAULT CURRENT_DATE,
  p_status text DEFAULT 'offering',
  p_petal_scores jsonb DEFAULT '[]',
  p_selected_petals jsonb DEFAULT '[]',
  p_oracle_reflection text DEFAULT NULL,
  p_journal_prompt text DEFAULT NULL,
  p_session_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  session_id uuid;
BEGIN
  INSERT INTO public.offering_sessions (
    user_id, 
    session_date, 
    status, 
    petal_scores, 
    selected_petals, 
    oracle_reflection, 
    journal_prompt, 
    session_metadata
  )
  VALUES (
    p_user_id, 
    p_date, 
    p_status, 
    p_petal_scores, 
    p_selected_petals, 
    p_oracle_reflection, 
    p_journal_prompt, 
    p_session_metadata
  )
  ON CONFLICT (user_id, session_date)
  DO UPDATE SET
    status = p_status,
    petal_scores = p_petal_scores,
    selected_petals = p_selected_petals,
    oracle_reflection = p_oracle_reflection,
    journal_prompt = p_journal_prompt,
    session_metadata = p_session_metadata,
    updated_at = now()
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 📅 Function to get user's offering streak
CREATE OR REPLACE FUNCTION get_offering_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  current_date date := CURRENT_DATE;
BEGIN
  -- Count consecutive days of offerings (not rest)
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.offering_sessions 
      WHERE user_id = p_user_id 
      AND session_date = current_date 
      AND status IN ('offering', 'bloom', 'transcendent')
    ) THEN
      streak_count := streak_count + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== VERIFICATION =====
-- This should show the new table after successful migration
SELECT 'SUCCESS: Offering system created!' AS status,
       COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'offering_sessions';

-- Show available views
SELECT 'Available views:' AS info, 
       array_agg(table_name) AS views
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'offering_%';