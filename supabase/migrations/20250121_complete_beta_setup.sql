-- Complete Beta Setup SQL for Maia
-- Run this in your Supabase SQL Editor

-- 1. Beta Users Table (main user tracking)
CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  timezone TEXT,
  referral_code TEXT,
  maya_instance UUID DEFAULT gen_random_uuid(),
  privacy_mode TEXT DEFAULT 'sanctuary',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  evolution_level FLOAT DEFAULT 1.0,
  protection_patterns JSONB DEFAULT '[]',
  session_count INT DEFAULT 0
);

-- 2. Explorers Table (explorer identity tracking)
CREATE TABLE IF NOT EXISTS explorers (
  explorer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_name TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  invitation_code TEXT,
  agreement_accepted BOOLEAN DEFAULT false,
  agreement_date TIMESTAMPTZ,
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  week_number INT DEFAULT 1,
  arc_level INT DEFAULT 1,
  session_count INT DEFAULT 0
);

-- 3. Sanctuary Sessions (privacy container)
CREATE TABLE IF NOT EXISTS sanctuary_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES beta_users(id) ON DELETE CASCADE,
  maya_instance UUID,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  sanctuary_seal TEXT,
  protection_active BOOLEAN DEFAULT true
);

-- 4. Beta Metrics (anonymous analytics)
CREATE TABLE IF NOT EXISTS beta_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  timezone TEXT,
  has_referral BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- 5. Beta Journal Entries (from earlier migration)
CREATE TABLE IF NOT EXISTS beta_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  explorer_name TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  word_count INT GENERATED ALWAYS AS (array_length(string_to_array(trim(content), ' '), 1)) STORED,
  session_id TEXT,
  message_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Explorer Reflections (weekly reflections)
CREATE TABLE IF NOT EXISTS explorer_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  explorer_name TEXT NOT NULL,
  week INT NOT NULL CHECK (week >= 1 AND week <= 4),
  question TEXT NOT NULL,
  response TEXT,
  principle TEXT NOT NULL,
  principle_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(explorer_id, week, principle_tag)
);

-- 7. Maya Conversations (chat history)
CREATE TABLE IF NOT EXISTS maya_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  element TEXT DEFAULT 'aether',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message_index INT,
  metadata JSONB DEFAULT '{}'
);

-- 8. Beta Feedback
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'feature', 'experience', 'other')),
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_users_email ON beta_users(email);
CREATE INDEX IF NOT EXISTS idx_explorers_name ON explorers(explorer_name);
CREATE INDEX IF NOT EXISTS idx_explorers_email ON explorers(email);
CREATE INDEX IF NOT EXISTS idx_journal_explorer ON beta_journal_entries(explorer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_session ON beta_journal_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_explorer ON maya_conversations(explorer_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON maya_conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_explorer ON explorer_reflections(explorer_id, week);
CREATE INDEX IF NOT EXISTS idx_sanctuary_user ON sanctuary_sessions(user_id);

-- Grant permissions for anonymous access (beta testing)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security (optional - can enable later)
-- ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE explorers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE beta_journal_entries ENABLE ROW LEVEL SECURITY;

-- Create a view for explorer analytics
CREATE OR REPLACE VIEW explorer_journey_analytics AS
SELECT
  e.explorer_name,
  e.signup_date,
  e.week_number,
  e.session_count,
  COUNT(DISTINCT j.id) as journal_entries,
  COUNT(DISTINCT r.id) as reflections,
  COUNT(DISTINCT mc.session_id) as conversation_sessions,
  MAX(mc.timestamp) as last_active
FROM explorers e
LEFT JOIN beta_journal_entries j ON e.explorer_name = j.explorer_name
LEFT JOIN explorer_reflections r ON e.explorer_name = r.explorer_name
LEFT JOIN maya_conversations mc ON e.explorer_name = mc.explorer_id
GROUP BY e.explorer_name, e.signup_date, e.week_number, e.session_count
ORDER BY e.signup_date DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Maia Beta database setup complete! All tables created successfully.';
END $$;

-- File uploads table (added after initial setup)
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    explorer_id UUID NOT NULL,
    explorer_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create storage bucket for beta uploads (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('beta-uploads', 'beta-uploads', true)
-- ON CONFLICT DO NOTHING;