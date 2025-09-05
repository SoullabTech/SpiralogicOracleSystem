-- Daimonic tracking schema for production-ready Daimon-as-Other integration
-- This migration adds tables to track daimonic experiences and collective patterns

-- Daimonic experiences table - tracks individual daimonic signatures
CREATE TABLE IF NOT EXISTS daimonic_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Liminal detection data
  liminal JSONB NOT NULL DEFAULT '{"weight": 0, "label": "none"}'::jsonb,
  
  -- Spirit/Soul pull analysis
  spirit_soul JSONB NOT NULL DEFAULT '{"pull": "integrated"}'::jsonb,
  
  -- Trickster risk assessment
  trickster JSONB NOT NULL DEFAULT '{"risk": 0, "reasons": []}'::jsonb,
  
  -- Both-and signature detection
  both_and JSONB NOT NULL DEFAULT '{"signature": false, "guidance": ""}'::jsonb,
  
  -- Initiation/phase context
  initiation JSONB,
  
  -- Elemental scores at time of detection
  elements JSONB,
  
  -- Phase hint for deeper context
  phase_hint TEXT,
  
  -- Expert mode flag
  expert BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daimonic_experiences_ts ON daimonic_experiences (ts DESC);
CREATE INDEX IF NOT EXISTS idx_daimonic_experiences_user_hash ON daimonic_experiences (user_id_hash);
CREATE INDEX IF NOT EXISTS idx_daimonic_experiences_trickster ON daimonic_experiences USING GIN (trickster);
CREATE INDEX IF NOT EXISTS idx_daimonic_experiences_liminal ON daimonic_experiences USING GIN (liminal);

-- Collective daimonic snapshots - reservoir state tracking
CREATE TABLE IF NOT EXISTS collective_daimonic_snapshots (
  ts TIMESTAMPTZ PRIMARY KEY DEFAULT now(),
  
  -- Field metrics (0-1 range)
  field_intensity NUMERIC(5,4) NOT NULL CHECK (field_intensity >= 0 AND field_intensity <= 1),
  trickster_prevalence NUMERIC(5,4) NOT NULL CHECK (trickster_prevalence >= 0 AND trickster_prevalence <= 1),
  both_and_rate NUMERIC(5,4) NOT NULL CHECK (both_and_rate >= 0 AND both_and_rate <= 1),
  
  -- Human-readable patterns
  collective_myth TEXT NOT NULL,
  cultural_compensation TEXT NOT NULL,
  
  -- Active elemental patterns
  active_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata for tracking
  detection_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_collective_snapshots_ts ON collective_daimonic_snapshots (ts DESC);

-- RLS policies for privacy-safe access
ALTER TABLE daimonic_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_daimonic_snapshots ENABLE ROW LEVEL SECURITY;

-- Privacy-safe policies - no user-specific data exposed
CREATE POLICY "Public read access to anonymized daimonic data" ON daimonic_experiences
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to daimonic experiences" ON daimonic_experiences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read access to collective snapshots" ON collective_daimonic_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to collective snapshots" ON collective_daimonic_snapshots
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean old daimonic experiences (privacy + performance)
CREATE OR REPLACE FUNCTION clean_old_daimonic_experiences()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete experiences older than 30 days to maintain privacy
  DELETE FROM daimonic_experiences 
  WHERE ts < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate collective snapshot from recent experiences
CREATE OR REPLACE FUNCTION generate_collective_daimonic_snapshot()
RETURNS collective_daimonic_snapshots AS $$
DECLARE
  recent_experiences RECORD;
  new_snapshot collective_daimonic_snapshots;
  myth_text TEXT;
  compensation_text TEXT;
BEGIN
  -- Analyze recent experiences (last 24 hours)
  SELECT 
    AVG(CAST(liminal->>'weight' AS NUMERIC)) as avg_liminal,
    AVG(CAST(trickster->>'risk' AS NUMERIC)) as avg_trickster,
    AVG(CASE WHEN both_and->>'signature' = 'true' THEN 1.0 ELSE 0.0 END) as both_and_rate,
    COUNT(*) as detection_count,
    COUNT(DISTINCT user_id_hash) as unique_users
  INTO recent_experiences
  FROM daimonic_experiences 
  WHERE ts > now() - INTERVAL '24 hours';
  
  -- Generate human-readable patterns based on metrics
  IF recent_experiences.avg_trickster >= 0.4 AND recent_experiences.avg_liminal >= 0.5 THEN
    myth_text := 'Learning through sacred mischief and teaching riddles';
  ELSIF recent_experiences.both_and_rate >= 0.3 AND recent_experiences.avg_liminal >= 0.5 THEN
    myth_text := 'Practicing the art of holding multiple truths simultaneously';
  ELSIF recent_experiences.avg_liminal >= 0.5 THEN
    myth_text := 'Navigating threshold times with careful attention';
  ELSE
    myth_text := 'Learning to hold paradox with grace';
  END IF;
  
  -- Generate cultural compensation pattern
  compensation_text := CASE 
    WHEN recent_experiences.avg_liminal >= 0.6 THEN 'Balancing overwhelm with a single clear view'
    WHEN recent_experiences.avg_trickster >= 0.5 THEN 'Balancing certainty with healthy mystery'
    WHEN recent_experiences.both_and_rate >= 0.4 THEN 'Balancing action with reflection'
    ELSE 'Balancing abstraction with embodiment'
  END;
  
  -- Create new snapshot
  INSERT INTO collective_daimonic_snapshots (
    field_intensity,
    trickster_prevalence, 
    both_and_rate,
    collective_myth,
    cultural_compensation,
    active_elements,
    detection_count,
    unique_users
  ) VALUES (
    COALESCE(recent_experiences.avg_liminal, 0.1),
    COALESCE(recent_experiences.avg_trickster, 0.0),
    COALESCE(recent_experiences.both_and_rate, 0.0),
    myth_text,
    compensation_text,
    '["earth", "aether"]'::jsonb, -- Default active elements
    COALESCE(recent_experiences.detection_count, 0),
    COALESCE(recent_experiences.unique_users, 0)
  ) RETURNING * INTO new_snapshot;
  
  RETURN new_snapshot;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daimonic_experiences_updated_at
    BEFORE UPDATE ON daimonic_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial collective snapshot
SELECT generate_collective_daimonic_snapshot();

COMMENT ON TABLE daimonic_experiences IS 'Privacy-safe tracking of daimonic signatures detected in user interactions';
COMMENT ON TABLE collective_daimonic_snapshots IS 'Aggregate snapshots of collective daimonic field state for dashboard display';
COMMENT ON FUNCTION clean_old_daimonic_experiences() IS 'Maintenance function to remove old experiences for privacy';
COMMENT ON FUNCTION generate_collective_daimonic_snapshot() IS 'Generate new collective snapshot from recent experiences';