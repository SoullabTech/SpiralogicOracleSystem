-- Badge Constellation Graduation Ceremony
-- Migration: 20250820140000_badge_constellation.sql

-- Constellation definitions (symbolic clusters)
CREATE TABLE IF NOT EXISTS public.badge_constellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,               -- e.g., 'WAYFINDER', 'WEAVER'
  name text NOT NULL,                      -- display name
  description text NOT NULL,
  rules jsonb NOT NULL,                    -- rule DSL: {anyOf, allOf, minCounts, categories}
  visual jsonb NOT NULL,                   -- points/links/colors for animation
  created_at timestamptz DEFAULT now()
);

-- Ceremony runs per user
CREATE TABLE IF NOT EXISTS public.badge_ceremonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  constellation_code text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'started',  -- started|completed|aborted
  meta jsonb DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_badge_ceremonies_user_id ON public.badge_ceremonies(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_ceremonies_status ON public.badge_ceremonies(status);
CREATE INDEX IF NOT EXISTS idx_badge_ceremonies_started_at ON public.badge_ceremonies(started_at DESC);

-- RLS for constellation tables
ALTER TABLE public.badge_constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_ceremonies ENABLE ROW LEVEL SECURITY;

-- Constellation definitions are readable by all authenticated users
DROP POLICY IF EXISTS "read constellations" ON public.badge_constellations;
CREATE POLICY "read constellations" ON public.badge_constellations
  FOR SELECT TO authenticated USING (true);

-- Service role can manage constellations
CREATE POLICY "service role full access constellations" ON public.badge_constellations
  FOR ALL TO service_role USING (true);

-- Users can read their own ceremonies
DROP POLICY IF EXISTS "own ceremonies" ON public.badge_ceremonies;
CREATE POLICY "own ceremonies" ON public.badge_ceremonies
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Service role can manage all ceremonies
CREATE POLICY "service role full access ceremonies" ON public.badge_ceremonies
  FOR ALL TO service_role USING (true);

-- Meta badge to mark graduation (awarded once)
INSERT INTO public.beta_badges_catalog (badge_id, emoji, name, description, sort_order) 
VALUES ('GRADUATED_PIONEER', '🎓', 'Graduated Pioneer', 'Completed beta journey and crossed the threshold', 100)
ON CONFLICT (badge_id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Materialized view for admin dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.v_recent_ceremonies AS
SELECT 
  bc.id, 
  bc.user_id, 
  bc.constellation_code, 
  bc.status, 
  bc.started_at, 
  bc.completed_at,
  bcon.name as constellation_name,
  EXTRACT(EPOCH FROM (COALESCE(bc.completed_at, NOW()) - bc.started_at)) / 60 as duration_minutes
FROM public.badge_ceremonies bc
LEFT JOIN public.badge_constellations bcon ON bc.constellation_code = bcon.code
ORDER BY bc.started_at DESC;

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_ceremonies_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.v_recent_ceremonies;
END;
$$ LANGUAGE plpgsql;

-- Seed constellation definitions
INSERT INTO public.badge_constellations (code, name, description, rules, visual) VALUES 
(
  'WAYFINDER',
  'The Wayfinder',
  'A constellation of exploration and discovery, marking those who ventured into unknown territories',
  '{
    "minCounts": {"exploration": 2, "depth": 1},
    "anyOf": ["PIONEER", "VOICE_VOYAGER", "PATHFINDER"],
    "allOf": ["THREAD_WEAVER"]
  }'::jsonb,
  '{
    "points": [
      {"id": "center", "x": 300, "y": 200, "badgeCode": "PIONEER", "primary": true},
      {"id": "north", "x": 300, "y": 100, "badgeCode": "VOICE_VOYAGER"},
      {"id": "east", "x": 400, "y": 200, "badgeCode": "THREAD_WEAVER"},
      {"id": "south", "x": 300, "y": 300, "badgeCode": "PATHFINDER"},
      {"id": "west", "x": 200, "y": 200, "badgeCode": "SOUL_KEEPER"}
    ],
    "links": [
      {"from": "center", "to": "north", "weight": 1.0},
      {"from": "center", "to": "east", "weight": 1.2},
      {"from": "center", "to": "south", "weight": 1.0},
      {"from": "center", "to": "west", "weight": 0.8},
      {"from": "north", "to": "east", "weight": 0.6},
      {"from": "east", "to": "south", "weight": 0.6},
      {"from": "south", "to": "west", "weight": 0.6},
      {"from": "west", "to": "north", "weight": 0.6}
    ],
    "palette": ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"],
    "title": "Constellation of Your Beta Journey",
    "subtitle": "Moments of exploration, depth, insight, and care"
  }'::jsonb
),
(
  'WEAVER',
  'The Weaver',
  'A constellation of connection and synthesis, for those who found patterns in the tapestry',
  '{
    "minCounts": {"depth": 1, "insight": 1},
    "allOf": ["THREAD_WEAVER", "PATTERN_SCOUT"],
    "anyOf": ["SOUL_KEEPER", "SHADOW_STEWARD"]
  }'::jsonb,
  '{
    "points": [
      {"id": "heart", "x": 300, "y": 200, "badgeCode": "THREAD_WEAVER", "primary": true},
      {"id": "mind", "x": 250, "y": 150, "badgeCode": "PATTERN_SCOUT"},
      {"id": "soul", "x": 350, "y": 150, "badgeCode": "SOUL_KEEPER"},
      {"id": "shadow", "x": 300, "y": 270, "badgeCode": "SHADOW_STEWARD"},
      {"id": "voice", "x": 200, "y": 220, "badgeCode": "VOICE_VOYAGER"}
    ],
    "links": [
      {"from": "heart", "to": "mind", "weight": 1.2},
      {"from": "heart", "to": "soul", "weight": 1.2},
      {"from": "heart", "to": "shadow", "weight": 1.0},
      {"from": "mind", "to": "soul", "weight": 0.8},
      {"from": "soul", "to": "shadow", "weight": 0.8},
      {"from": "shadow", "to": "voice", "weight": 0.6},
      {"from": "voice", "to": "mind", "weight": 0.6}
    ],
    "palette": ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"],
    "title": "The Weaver Constellation",
    "subtitle": "Threads of connection across realms of knowing"
  }'::jsonb
),
(
  'PIONEER',
  'The Pioneer',
  'A foundational constellation for early explorers and pathfinders',
  '{
    "minCounts": {"exploration": 3},
    "allOf": ["PIONEER"],
    "anyOf": ["VOICE_VOYAGER", "PATHFINDER", "FEEDBACK_FRIEND"]
  }'::jsonb,
  '{
    "points": [
      {"id": "origin", "x": 300, "y": 200, "badgeCode": "PIONEER", "primary": true},
      {"id": "path", "x": 380, "y": 150, "badgeCode": "PATHFINDER"},
      {"id": "voice", "x": 220, "y": 150, "badgeCode": "VOICE_VOYAGER"},
      {"id": "feedback", "x": 300, "y": 280, "badgeCode": "FEEDBACK_FRIEND"}
    ],
    "links": [
      {"from": "origin", "to": "path", "weight": 1.0},
      {"from": "origin", "to": "voice", "weight": 1.0},
      {"from": "origin", "to": "feedback", "weight": 0.8},
      {"from": "path", "to": "voice", "weight": 0.5},
      {"from": "voice", "to": "feedback", "weight": 0.5},
      {"from": "feedback", "to": "path", "weight": 0.5}
    ],
    "palette": ["#10b981", "#06b6d4", "#3b82f6", "#f59e0b"],
    "title": "The Pioneer Constellation",
    "subtitle": "First steps into uncharted consciousness"
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  rules = EXCLUDED.rules,
  visual = EXCLUDED.visual;

-- Function to evaluate constellation eligibility for a user
CREATE OR REPLACE FUNCTION evaluate_constellation_eligibility(p_user_id uuid, p_constellation_code text)
RETURNS boolean AS $$
DECLARE
  constellation_rules jsonb;
  user_badges jsonb;
  badge_categories jsonb;
  result boolean := false;
BEGIN
  -- Get constellation rules
  SELECT rules INTO constellation_rules
  FROM public.badge_constellations
  WHERE code = p_constellation_code;
  
  IF constellation_rules IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user's badges with categories
  SELECT jsonb_agg(
    jsonb_build_object(
      'badge_id', bub.badge_id,
      'category', COALESCE(
        CASE bub.badge_id 
          WHEN 'PIONEER' THEN 'exploration'
          WHEN 'VOICE_VOYAGER' THEN 'exploration'
          WHEN 'PATHFINDER' THEN 'exploration'
          WHEN 'THREAD_WEAVER' THEN 'depth'
          WHEN 'PATTERN_SCOUT' THEN 'insight'
          WHEN 'SOUL_KEEPER' THEN 'care'
          WHEN 'SHADOW_STEWARD' THEN 'care'
          WHEN 'FEEDBACK_FRIEND' THEN 'systems'
          ELSE 'other'
        END,
        'other'
      )
    )
  ) INTO user_badges
  FROM public.beta_user_badges bub
  WHERE bub.user_id = p_user_id;
  
  IF user_badges IS NULL THEN
    user_badges := '[]'::jsonb;
  END IF;
  
  -- For now, return a simple evaluation (can be enhanced with more complex logic)
  -- Check if user has at least 3 badges
  SELECT jsonb_array_length(user_badges) >= 3 INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;