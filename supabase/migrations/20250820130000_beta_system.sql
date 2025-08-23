-- Beta Auth System Migration
-- Complete invite-based beta system with badges and gamified progression

-- Beta enums
DO $$ BEGIN
  CREATE TYPE beta_status AS ENUM ('beta','graduated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invite codes (admin-managed)
CREATE TABLE IF NOT EXISTS public.beta_invites (
  code           text PRIMARY KEY,
  created_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz,
  max_uses       int NOT NULL DEFAULT 100,
  uses           int NOT NULL DEFAULT 0,
  cohort         text,
  notes          text
);

-- Participants
CREATE TABLE IF NOT EXISTS public.beta_participants (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at      timestamptz NOT NULL DEFAULT now(),
  status         beta_status NOT NULL DEFAULT 'beta',
  cohort         text,
  flags          jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"starter_pack_complete": false}
  last_event_at  timestamptz
);

-- Events (engagement telemetry)
CREATE TABLE IF NOT EXISTS public.beta_events (
  id             bigserial PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind           text NOT NULL,                        -- e.g., "oracle_turn","voice_play","weave","soul_save"
  details        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_beta_events_user_created ON public.beta_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_events_kind ON public.beta_events (kind);
CREATE INDEX IF NOT EXISTS idx_beta_events_created_at ON public.beta_events (created_at DESC);

-- Badges catalog (separate from existing beta_badges to avoid conflicts)
CREATE TABLE IF NOT EXISTS public.beta_badges_catalog (
  badge_id       text PRIMARY KEY,                     -- e.g., "PIONEER"
  emoji          text NOT NULL,
  name           text NOT NULL,
  description    text NOT NULL,
  criteria       jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order     int NOT NULL DEFAULT 0
);

-- User badges (separate from existing beta_user_badges)
CREATE TABLE IF NOT EXISTS public.beta_user_badges (
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id       text REFERENCES public.beta_badges_catalog(badge_id) ON DELETE CASCADE,
  awarded_at     timestamptz NOT NULL DEFAULT now(),
  source         text,
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_participants_status ON public.beta_participants (status);
CREATE INDEX IF NOT EXISTS idx_beta_participants_joined_at ON public.beta_participants (joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_user_badges_user_id ON public.beta_user_badges (user_id);
CREATE INDEX IF NOT EXISTS idx_beta_user_badges_awarded_at ON public.beta_user_badges (awarded_at DESC);

-- RLS
ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_badges_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
-- Invites: only service role or admin should read/write. Deny by default for anon/auth.
DROP POLICY IF EXISTS "deny all invites" ON public.beta_invites;
CREATE POLICY "deny all invites" ON public.beta_invites
  FOR ALL TO public USING (false);

-- Service role full access to invites
CREATE POLICY "service role full access invites" ON public.beta_invites
  FOR ALL TO service_role USING (true);

-- Participants: owner can select/insert/update own row
DROP POLICY IF EXISTS "select own participant" ON public.beta_participants;
CREATE POLICY "select own participant" ON public.beta_participants
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "upsert own participant" ON public.beta_participants;
CREATE POLICY "upsert own participant" ON public.beta_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update own participant" ON public.beta_participants;
CREATE POLICY "update own participant" ON public.beta_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role access to participants
CREATE POLICY "service role full access participants" ON public.beta_participants
  FOR ALL TO service_role USING (true);

-- Events: owner can insert/select own events
DROP POLICY IF EXISTS "insert own events" ON public.beta_events;
CREATE POLICY "insert own events" ON public.beta_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select own events" ON public.beta_events;
CREATE POLICY "select own events" ON public.beta_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service role access to events
CREATE POLICY "service role full access events" ON public.beta_events
  FOR ALL TO service_role USING (true);

-- Badges: world-readable (not PII)
DROP POLICY IF EXISTS "read badges" ON public.beta_badges_catalog;
CREATE POLICY "read badges" ON public.beta_badges_catalog
  FOR SELECT TO anon, authenticated USING (true);

-- Service role access to badges catalog
CREATE POLICY "service role full access badges_catalog" ON public.beta_badges_catalog
  FOR ALL TO service_role USING (true);

-- User badges: owner can see own, insert by owner or service
DROP POLICY IF EXISTS "select own user_badges" ON public.beta_user_badges;
CREATE POLICY "select own user_badges" ON public.beta_user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert own user_badges" ON public.beta_user_badges;
CREATE POLICY "insert own user_badges" ON public.beta_user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Service role access to user badges
CREATE POLICY "service role full access user_badges" ON public.beta_user_badges
  FOR ALL TO service_role USING (true);

-- Award function (service role can call directly; clients should use API)
CREATE OR REPLACE FUNCTION public.award_beta_badge(p_user uuid, p_badge text, p_source text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.beta_user_badges (user_id, badge_id, source)
  VALUES (p_user, p_badge, p_source)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for analytics and dashboards
CREATE OR REPLACE VIEW public.v_beta_analytics AS
SELECT
  COUNT(DISTINCT bp.user_id) as total_participants,
  COUNT(DISTINCT CASE WHEN bp.status = 'beta' THEN bp.user_id END) as active_beta_users,
  COUNT(DISTINCT CASE WHEN bp.status = 'graduated' THEN bp.user_id END) as graduated_users,
  COUNT(DISTINCT CASE WHEN be.created_at >= NOW() - INTERVAL '24 hours' THEN be.user_id END) as active_24h,
  COUNT(DISTINCT CASE WHEN be.created_at >= NOW() - INTERVAL '7 days' THEN be.user_id END) as active_7d,
  AVG(CASE WHEN bp.flags->>'starter_pack_complete' = 'true' THEN 1.0 ELSE 0.0 END) as starter_pack_completion_rate
FROM public.beta_participants bp
LEFT JOIN public.beta_events be ON bp.user_id = be.user_id;

-- Badge analytics view
CREATE OR REPLACE VIEW public.v_beta_badge_stats AS
SELECT
  bc.badge_id,
  bc.name,
  bc.emoji,
  COUNT(bub.user_id) as awarded_count,
  COUNT(DISTINCT bub.user_id) as unique_recipients,
  AVG(EXTRACT(epoch FROM (bub.awarded_at - bp.joined_at))/3600) as avg_hours_to_earn
FROM public.beta_badges_catalog bc
LEFT JOIN public.beta_user_badges bub ON bc.badge_id = bub.badge_id
LEFT JOIN public.beta_participants bp ON bub.user_id = bp.user_id
GROUP BY bc.badge_id, bc.name, bc.emoji, bc.sort_order
ORDER BY bc.sort_order;

-- Recent activity view
CREATE OR REPLACE VIEW public.v_beta_recent_activity AS
SELECT
  be.user_id,
  be.kind,
  be.details,
  be.created_at,
  bp.status,
  bp.cohort
FROM public.beta_events be
JOIN public.beta_participants bp ON be.user_id = bp.user_id
WHERE be.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY be.created_at DESC
LIMIT 100;

-- Seed default badges (idempotent)
INSERT INTO public.beta_badges_catalog (badge_id, emoji, name, description, sort_order) VALUES
  ('PIONEER','🧭','Pioneer','Joined Soullab Beta',10),
  ('VOICE_VOYAGER','🎙️','Voice Voyager','Played first voice response',20),
  ('THREAD_WEAVER','🕸️','Thread Weaver','Created your first weave',30),
  ('SOUL_KEEPER','🔮','Soul Keeper','Saved first Soul Memory',40),
  ('PATTERN_SCOUT','🌌','Pattern Scout','Explored the Holoflower',50),
  ('SHADOW_STEWARD','🌑','Shadow Steward','Engaged a shadow turn safely',60),
  ('PATHFINDER','🌿','Pathfinder','Returned on 3 active days in 7',70)
ON CONFLICT (badge_id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Seed initial beta invites
INSERT INTO public.beta_invites (code, max_uses, expires_at, notes) VALUES
  ('SLBETA-ORIGIN', 200, NOW() + INTERVAL '45 days', 'Initial beta launch invite'),
  ('SLBETA-EARLY', 100, NOW() + INTERVAL '30 days', 'Early access cohort')
ON CONFLICT (code) DO NOTHING;