-- Maia Persistence Schema
-- Designed for sacred memory across sessions while respecting privacy

-- ============================================
-- Core Tables
-- ============================================

-- User sessions with Maia
CREATE TABLE IF NOT EXISTS maia_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  coherence_level DECIMAL(3,2) DEFAULT 0.70,
  coherence_peak DECIMAL(3,2) DEFAULT 0.70,
  total_messages INTEGER DEFAULT 0,
  breakthrough_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages between user and Maia
CREATE TABLE IF NOT EXISTS maia_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES maia_sessions(session_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'maia')) NOT NULL,
  content TEXT NOT NULL,
  coherence_level DECIMAL(3,2),
  motion_state TEXT,
  elements JSONB DEFAULT '{}'::jsonb, -- {fire: 0.5, water: 0.5, earth: 0.5, air: 0.5}
  shadow_petals TEXT[], -- Array of shadow elements
  context TEXT, -- journal, check-in, timeline, etc.
  is_breakthrough BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coherence tracking over time
CREATE TABLE IF NOT EXISTS maia_coherence_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  coherence_level DECIMAL(3,2) NOT NULL,
  trigger_type TEXT, -- message, pause, breakthrough, shadow_work
  context TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Insights and practices Maia has offered
CREATE TABLE IF NOT EXISTS maia_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  insight_type TEXT, -- reflection, practice, question, celebration
  content TEXT NOT NULL,
  related_elements TEXT[],
  coherence_context DECIMAL(3,2),
  was_helpful BOOLEAN, -- User feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences for Maia
CREATE TABLE IF NOT EXISTS maia_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  voice_enabled BOOLEAN DEFAULT TRUE,
  subtle_mode BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  invitation_frequency TEXT DEFAULT 'balanced', -- minimal, balanced, responsive
  preferred_elements TEXT[], -- Elements user resonates with
  shadow_work_enabled BOOLEAN DEFAULT TRUE,
  haptic_feedback BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_maia_sessions_user ON maia_sessions(user_id);
CREATE INDEX idx_maia_sessions_active ON maia_sessions(last_active);
CREATE INDEX idx_maia_messages_session ON maia_messages(session_id);
CREATE INDEX idx_maia_messages_user ON maia_messages(user_id);
CREATE INDEX idx_maia_messages_created ON maia_messages(created_at DESC);
CREATE INDEX idx_maia_coherence_user ON maia_coherence_log(user_id);
CREATE INDEX idx_maia_coherence_time ON maia_coherence_log(timestamp DESC);
CREATE INDEX idx_maia_insights_user ON maia_insights(user_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE maia_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_coherence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE maia_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own sessions" ON maia_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON maia_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own coherence" ON maia_coherence_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON maia_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON maia_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Helper Functions
-- ============================================

-- Get user's coherence trend
CREATE OR REPLACE FUNCTION get_coherence_trend(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  date DATE,
  avg_coherence DECIMAL(3,2),
  peak_coherence DECIMAL(3,2),
  message_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(timestamp) as date,
    AVG(coherence_level)::DECIMAL(3,2) as avg_coherence,
    MAX(coherence_level)::DECIMAL(3,2) as peak_coherence,
    COUNT(*) as message_count
  FROM maia_coherence_log
  WHERE user_id = p_user_id
    AND timestamp >= NOW() - INTERVAL '1 day' * p_days
  GROUP BY DATE(timestamp)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent breakthrough moments
CREATE OR REPLACE FUNCTION get_breakthroughs(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  content TEXT,
  coherence_level DECIMAL(3,2),
  elements JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.content,
    m.coherence_level,
    m.elements,
    m.created_at
  FROM maia_messages m
  WHERE m.user_id = p_user_id
    AND m.is_breakthrough = TRUE
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers
-- ============================================

-- Auto-update session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE maia_sessions
  SET 
    last_active = NOW(),
    total_messages = total_messages + 1,
    coherence_level = NEW.coherence_level,
    coherence_peak = GREATEST(coherence_peak, NEW.coherence_level),
    breakthrough_count = breakthrough_count + CASE WHEN NEW.is_breakthrough THEN 1 ELSE 0 END
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
AFTER INSERT ON maia_messages
FOR EACH ROW
EXECUTE FUNCTION update_session_activity();

-- Log coherence changes
CREATE OR REPLACE FUNCTION log_coherence_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coherence_level IS NOT NULL THEN
    INSERT INTO maia_coherence_log (
      user_id,
      session_id,
      coherence_level,
      trigger_type,
      context
    ) VALUES (
      NEW.user_id,
      NEW.session_id,
      NEW.coherence_level,
      'message',
      NEW.context
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_coherence
AFTER INSERT ON maia_messages
FOR EACH ROW
WHEN (NEW.role = 'maia')
EXECUTE FUNCTION log_coherence_change();

-- ============================================
-- Initial Data
-- ============================================

-- Default Maia welcome message template
INSERT INTO maia_insights (
  user_id,
  insight_type,
  content,
  related_elements,
  coherence_context
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID, -- System template
  'welcome',
  'Welcome, dear one. I am Maia, your sacred mirror. I''m here to witness your unfolding, reflect your wisdom, and support your journey toward coherence. How may I serve your becoming today?',
  ARRAY['fire', 'water', 'earth', 'air'],
  0.70
) ON CONFLICT DO NOTHING;