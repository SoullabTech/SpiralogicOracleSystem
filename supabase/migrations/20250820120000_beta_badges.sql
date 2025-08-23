-- Beta Tester Badges System
-- Migration: 20250820120000_beta_badges.sql

-- Raw, privacy-safe tester events
CREATE TABLE IF NOT EXISTS beta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,             -- e.g. 'oracle_turn', 'thread_weave', 'holoflower_set', 'voice_preview', 'soul_memory_saved', 'admin_feedback'
  detail JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badge catalog (curated, editable)
CREATE TABLE IF NOT EXISTS beta_badges (
  code TEXT PRIMARY KEY,          -- 'PIONEER', 'THREAD_WEAVER', ...
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL,         -- 'exploration' | 'depth' | 'care' | 'insight' | 'systems'
  icon TEXT NOT NULL,             -- lucide icon name or custom
  color TEXT NOT NULL DEFAULT 'emerald'
);

-- User badge awards
CREATE TABLE IF NOT EXISTS beta_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_code TEXT NOT NULL REFERENCES beta_badges(code),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_events_user_id ON beta_events(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_kind ON beta_events(kind);
CREATE INDEX IF NOT EXISTS idx_beta_events_occurred_at ON beta_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_beta_user_badges_user_id ON beta_user_badges(user_id);

-- Helpful views
CREATE OR REPLACE VIEW v_beta_progress AS
SELECT
  be.user_id,
  COUNT(DISTINCT CASE WHEN kind='oracle_turn' THEN date_trunc('day', occurred_at) END) AS active_days,
  COUNT(*) FILTER (WHERE kind='thread_weave') AS weave_count,
  COUNT(*) FILTER (WHERE kind='holoflower_set') AS holoflower_sets,
  COUNT(*) FILTER (WHERE kind='voice_preview') AS voice_previews,
  COUNT(*) FILTER (WHERE kind='soul_memory_saved') AS soul_saves,
  COUNT(*) FILTER (WHERE kind='admin_feedback') AS feedbacks,
  COUNT(*) FILTER (WHERE kind='oracle_turn') AS total_turns,
  MAX(occurred_at) AS last_activity
FROM beta_events be
GROUP BY be.user_id;

-- Badge progress summary view
CREATE OR REPLACE VIEW v_badge_stats AS
SELECT
  bb.code,
  bb.name,
  bb.category,
  COUNT(bub.user_id) AS awarded_count,
  COUNT(DISTINCT bub.user_id) AS unique_recipients
FROM beta_badges bb
LEFT JOIN beta_user_badges bub ON bb.code = bub.badge_code
GROUP BY bb.code, bb.name, bb.category;

-- Recent badge awards view
CREATE OR REPLACE VIEW v_recent_awards AS
SELECT
  bub.user_id,
  bb.code,
  bb.name,
  bb.tagline,
  bb.icon,
  bb.color,
  bub.awarded_at
FROM beta_user_badges bub
JOIN beta_badges bb ON bub.badge_code = bb.code
WHERE bub.awarded_at >= NOW() - INTERVAL '7 days'
ORDER BY bub.awarded_at DESC;

-- RLS (owner-scoped for events and awards; badges catalog readable)
ALTER TABLE beta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "own events" ON beta_events;
DROP POLICY IF EXISTS "own awards" ON beta_user_badges;
DROP POLICY IF EXISTS "badges readable" ON beta_badges;

-- Create RLS policies
CREATE POLICY "own events" ON beta_events 
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own awards" ON beta_user_badges 
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "badges readable" ON beta_badges 
  FOR SELECT TO authenticated
  USING (true);

-- Admin policies for service role
CREATE POLICY "service role full access beta_events" ON beta_events
  FOR ALL TO service_role USING (true);

CREATE POLICY "service role full access beta_user_badges" ON beta_user_badges
  FOR ALL TO service_role USING (true);

CREATE POLICY "service role full access beta_badges" ON beta_badges
  FOR ALL TO service_role USING (true);

-- Insert badge catalog
INSERT INTO beta_badges (code, name, tagline, category, icon, color) VALUES
('PIONEER', 'Beta Pioneer', 'Completed the full onboarding journey', 'exploration', 'Compass', 'emerald'),
('THREAD_WEAVER', 'Thread Weaver', 'Wove a synthesis when stories connected', 'depth', 'GitMerge', 'violet'),
('MIRROR_MAKER', 'Mirror Maker', 'Tuned the Holoflower with clear intention', 'insight', 'Flower2', 'sky'),
('VOICE_VOYAGER', 'Voice Voyager', 'Uploaded and transcribed first audio', 'exploration', 'Mic2', 'amber'),
('SOUL_KEEPER', 'Soul Keeper', 'Saved a moment that mattered', 'care', 'HeartHandshake', 'rose'),
('PATHFINDER', 'Pathfinder', 'Showed up across days, not just a day', 'systems', 'Route', 'cyan'),
('PATTERN_SCOUT', 'Pattern Scout', 'Surfaced a thread others can learn from', 'insight', 'ScanSearch', 'fuchsia'),
('SHADOW_STEWARD', 'Shadow Steward', 'Met a hard thing with care', 'care', 'ShieldCheck', 'zinc'),
('FEEDBACK_FRIEND', 'Feedback Friend', 'Left notes that made the system better', 'systems', 'MessageSquare', 'lime'),
('ARCHIVIST', 'Archivist', 'Uploaded and processed multiple files', 'systems', 'Archive', 'violet'),
('INSIGHT_DIVER', 'Insight Diver', 'Referenced uploads in conversation', 'insight', 'FileSearch', 'cyan')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;