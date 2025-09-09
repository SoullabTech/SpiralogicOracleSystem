-- Oracle Intelligence Database Schema
-- Phase 2: Data persistence for Holoflower experience

-- Users profile extension for Oracle data
CREATE TABLE IF NOT EXISTS oracle_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_energy_state TEXT DEFAULT 'emerging' CHECK (current_energy_state IN ('dense', 'emerging', 'radiant')),
  preferred_voice TEXT DEFAULT 'oracle' CHECK (preferred_voice IN ('oracle', 'maya', 'guide')),
  auto_play_voice BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Petal interactions tracking
CREATE TABLE IF NOT EXISTS petal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  petal_id INTEGER NOT NULL,
  element TEXT NOT NULL CHECK (element IN ('air', 'fire', 'water', 'earth', 'aether')),
  petal_number INTEGER NOT NULL,
  petal_name TEXT NOT NULL,
  petal_state TEXT NOT NULL CHECK (petal_state IN ('dense', 'emerging', 'radiant')),
  message TEXT,
  voice_played BOOLEAN DEFAULT false,
  interaction_type TEXT CHECK (interaction_type IN ('click', 'hover', 'wild_draw', 'guided')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_user_petal (user_id, created_at DESC)
);

-- Sacred check-ins
CREATE TABLE IF NOT EXISTS sacred_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('dense', 'heavy', 'neutral', 'emerging', 'light', 'radiant')),
  symbol TEXT NOT NULL,
  energy_before TEXT,
  energy_after TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_user_checkin (user_id, created_at DESC)
);

-- Journal entries with petal connections
CREATE TABLE IF NOT EXISTS oracle_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  petal_interaction_id UUID REFERENCES petal_interactions(id) ON DELETE SET NULL,
  checkin_id UUID REFERENCES sacred_checkins(id) ON DELETE SET NULL,
  entry_type TEXT CHECK (entry_type IN ('petal_reflection', 'wild_draw', 'dream_log', 'ritual_note', 'free_form')),
  title TEXT,
  content TEXT NOT NULL,
  element TEXT CHECK (element IN ('air', 'fire', 'water', 'earth', 'aether')),
  voice_context TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_user_journal (user_id, created_at DESC)
);

-- Wild petal draws history
CREATE TABLE IF NOT EXISTS wild_petal_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  petal_id INTEGER NOT NULL,
  element TEXT NOT NULL,
  petal_name TEXT NOT NULL,
  message TEXT NOT NULL,
  voice_played BOOLEAN DEFAULT false,
  journal_entry_id UUID REFERENCES oracle_journal_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_user_wild_draws (user_id, created_at DESC)
);

-- Ritual completions
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_name TEXT NOT NULL,
  element TEXT CHECK (element IN ('air', 'fire', 'water', 'earth', 'aether')),
  petal_id INTEGER,
  duration_minutes INTEGER,
  notes TEXT,
  completion_state TEXT CHECK (completion_state IN ('started', 'partial', 'complete')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_user_rituals (user_id, created_at DESC)
);

-- Analytics views for insights
CREATE OR REPLACE VIEW user_petal_patterns AS
SELECT 
  user_id,
  element,
  COUNT(*) as interaction_count,
  AVG(CASE 
    WHEN petal_state = 'dense' THEN 1
    WHEN petal_state = 'emerging' THEN 2
    WHEN petal_state = 'radiant' THEN 3
  END) as avg_energy_level,
  MAX(created_at) as last_interaction
FROM petal_interactions
GROUP BY user_id, element;

CREATE OR REPLACE VIEW user_energy_journey AS
SELECT 
  user_id,
  DATE(created_at) as day,
  mood,
  COUNT(*) as checkin_count,
  ARRAY_AGG(symbol ORDER BY created_at) as symbols
FROM sacred_checkins
GROUP BY user_id, DATE(created_at), mood;

-- Row Level Security
ALTER TABLE oracle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE petal_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wild_petal_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own oracle profile" ON oracle_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own petal interactions" ON petal_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checkins" ON sacred_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries" ON oracle_journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wild draws" ON wild_petal_draws
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rituals" ON ritual_completions
  FOR ALL USING (auth.uid() = user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_oracle_profiles_updated_at
  BEFORE UPDATE ON oracle_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_oracle_journal_entries_updated_at
  BEFORE UPDATE ON oracle_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();