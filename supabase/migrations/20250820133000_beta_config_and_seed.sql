-- Beta config table (single-row global config; can expand to org_id later)
CREATE TABLE IF NOT EXISTS beta_badges_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  config jsonb NOT NULL
);

-- Ensure single config row
CREATE UNIQUE INDEX IF NOT EXISTS ux_beta_badges_config_single ON beta_badges_config ((true));

-- RLS: Admin access only
ALTER TABLE beta_badges_config ENABLE ROW LEVEL SECURITY;

-- Default config
INSERT INTO beta_badges_config (config)
VALUES (jsonb_build_object(
  'badgesEnabled', true,
  'pathfinderDays', 3,
  'pathfinderWindowDays', 7,
  'shadowStewardMinScore', 0.7,
  'starterPack', jsonb_build_array('oracle_turn','voice_preview','holoflower_set','soul_memory_saved')
))
ON CONFLICT ((true)) DO NOTHING;

-- Seed a few invites for cohort A
INSERT INTO beta_invites(code, max_uses, expires_at, cohort)
VALUES
 ('ALPHA-01', 50, now() + interval '45 days', 'A'),
 ('ALPHA-02', 50, now() + interval '45 days', 'A'),
 ('ALPHA-TEST', 10, now() + interval '10 days', 'A')
ON CONFLICT (code) DO NOTHING;

-- Update trigger timestamp
CREATE OR REPLACE FUNCTION touch_beta_badges_config()
RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_beta_badges_config ON beta_badges_config;
CREATE TRIGGER trg_touch_beta_badges_config
  BEFORE UPDATE ON beta_badges_config
  FOR EACH ROW EXECUTE PROCEDURE touch_beta_badges_config();