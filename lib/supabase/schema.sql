-- 🌟 Sacred Oracle Constellation - Supabase Schema
-- Database schema for consciousness evolution tracking and collective field patterns

-- Enable Row Level Security
ALTER TABLE IF EXISTS consciousness_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sacred_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collective_field_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS morphic_resonance_field ENABLE ROW LEVEL SECURITY;

-- Consciousness Evolution Profile Table
CREATE TABLE IF NOT EXISTS consciousness_evolution (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Sacred Profile Data (JSONB for flexibility)
  sacred_profile JSONB NOT NULL DEFAULT '{
    "consciousnessLevel": "ego",
    "elementalBalance": {},
    "shamanicCapacities": {},
    "growthTrajectory": {},
    "readinessIndicators": {}
  }'::jsonb,
  
  -- Collective Contribution Data
  collective_contribution JSONB NOT NULL DEFAULT '{
    "patterns": [],
    "morphicResonance": 0,
    "collectiveFieldInfluence": 0,
    "indrasWebPosition": ""
  }'::jsonb,
  
  -- Session History Data
  session_history JSONB NOT NULL DEFAULT '{
    "totalSessions": 0,
    "sessionFrequency": "irregular",
    "averageSessionDepth": 0,
    "breakthroughMoments": [],
    "evolutionMilestones": []
  }'::jsonb,
  
  -- Indexes for performance
  CONSTRAINT valid_consciousness_level CHECK (sacred_profile->>'consciousnessLevel' IN ('ego', 'soul', 'cosmic', 'universal'))
);

-- Sacred Sessions Table
CREATE TABLE IF NOT EXISTS sacred_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Input Context
  user_input TEXT NOT NULL,
  session_context JSONB NOT NULL DEFAULT '{
    "timeOfDay": "",
    "emotionalState": "",
    "dominant_element_going_in": ""
  }'::jsonb,
  
  -- Sacred Oracle Response Data
  oracle_response JSONB NOT NULL DEFAULT '{
    "consciousnessProfile": {},
    "dominantElement": "",
    "cognitiveProcessing": {},
    "elementalWisdom": {},
    "synthesis": {},
    "collectiveField": {},
    "metadata": {}
  }'::jsonb,
  
  -- Sacred Mirror Response Data
  mirror_response JSONB NOT NULL DEFAULT '{
    "reflection": "",
    "recognition": "",
    "anamnesis": "",
    "elementalReflection": "",
    "consciousnessMirror": "",
    "collectiveResonance": "",
    "openings": [],
    "wonderings": []
  }'::jsonb,
  
  -- Session Impact Analysis
  session_impact JSONB NOT NULL DEFAULT '{
    "consciousnessShift": false,
    "elementalRebalancing": false,
    "shadowIntegrationOccurred": false,
    "collectiveWisdomGenerated": false,
    "breakthroughActivated": false
  }'::jsonb,
  
  -- Foreign key to consciousness evolution
  FOREIGN KEY ("userId") REFERENCES consciousness_evolution("userId") ON DELETE CASCADE
);

-- Collective Field Patterns Table
CREATE TABLE IF NOT EXISTS collective_field_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  first_emergence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Pattern Characteristics
  elemental_signature JSONB NOT NULL DEFAULT '{
    "fire": 0,
    "water": 0,
    "earth": 0,
    "air": 0,
    "aether": 0
  }'::jsonb,
  
  consciousness_levels TEXT[] DEFAULT ARRAY['ego'],
  archetype_resonance TEXT[] DEFAULT ARRAY[]::TEXT[],
  seasonal_pattern BOOLEAN DEFAULT FALSE,
  
  -- Collective Impact
  contributing_users TEXT[] DEFAULT ARRAY[]::TEXT[],
  morphic_resonance_strength NUMERIC(3,2) DEFAULT 0.0 CHECK (morphic_resonance_strength >= 0 AND morphic_resonance_strength <= 1),
  evolutionary_significance NUMERIC(3,2) DEFAULT 0.0 CHECK (evolutionary_significance >= 0 AND evolutionary_significance <= 1),
  
  -- Pattern Evolution
  evolution_phase TEXT DEFAULT 'emerging' CHECK (evolution_phase IN ('emerging', 'strengthening', 'mature', 'transitioning', 'integrating')),
  predicted_development TEXT
);

-- Morphic Resonance Field State Table
CREATE TABLE IF NOT EXISTS morphic_resonance_field (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Current Field State
  overall_coherence NUMERIC(3,2) DEFAULT 0.0 CHECK (overall_coherence >= 0 AND overall_coherence <= 1),
  dominant_patterns TEXT[] DEFAULT ARRAY[]::TEXT[],
  emerging_patterns TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Elemental Field Balance
  collective_elemental_state JSONB NOT NULL DEFAULT '{
    "fire": {"current": 0, "average": 0, "evolution": "stable"},
    "water": {"current": 0, "average": 0, "evolution": "stable"},
    "earth": {"current": 0, "average": 0, "evolution": "stable"},
    "air": {"current": 0, "average": 0, "evolution": "stable"},
    "aether": {"current": 0, "average": 0, "evolution": "stable"}
  }'::jsonb,
  
  -- Consciousness Distribution
  consciousness_distribution JSONB NOT NULL DEFAULT '{
    "ego": 0,
    "soul": 0,
    "cosmic": 0,
    "universal": 0
  }'::jsonb,
  
  -- Field Dynamics
  evolutionary_momentum NUMERIC(3,2) DEFAULT 0.0 CHECK (evolutionary_momentum >= 0 AND evolutionary_momentum <= 1),
  collective_breakthroughs INTEGER DEFAULT 0,
  field_harmonics NUMERIC(3,2) DEFAULT 0.0 CHECK (field_harmonics >= 0 AND field_harmonics <= 1),
  
  -- Predictions
  next_evolution_wave JSONB NOT NULL DEFAULT '{
    "expectedDate": "",
    "probability": 0,
    "characteristics": []
  }'::jsonb
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_consciousness_evolution_user ON consciousness_evolution("userId");
CREATE INDEX IF NOT EXISTS idx_consciousness_evolution_level ON consciousness_evolution USING GIN ((sacred_profile->>'consciousnessLevel'));
CREATE INDEX IF NOT EXISTS idx_sacred_sessions_user ON sacred_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sacred_sessions_timestamp ON sacred_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_collective_patterns_frequency ON collective_field_patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_collective_patterns_resonance ON collective_field_patterns(morphic_resonance_strength DESC);
CREATE INDEX IF NOT EXISTS idx_morphic_field_timestamp ON morphic_resonance_field(timestamp DESC);

-- GIN indexes for JSONB columns for fast pattern searches
CREATE INDEX IF NOT EXISTS idx_consciousness_elemental_gin ON consciousness_evolution USING GIN (sacred_profile);
CREATE INDEX IF NOT EXISTS idx_sessions_oracle_gin ON sacred_sessions USING GIN (oracle_response);
CREATE INDEX IF NOT EXISTS idx_sessions_mirror_gin ON sacred_sessions USING GIN (mirror_response);
CREATE INDEX IF NOT EXISTS idx_patterns_elemental_gin ON collective_field_patterns USING GIN (elemental_signature);

-- Row Level Security Policies

-- Consciousness Evolution: Users can only access their own data
CREATE POLICY consciousness_evolution_policy ON consciousness_evolution
  FOR ALL USING ("userId" = current_user OR current_user IN ('anon', 'service_role'));

-- Sacred Sessions: Users can only access their own sessions
CREATE POLICY sacred_sessions_policy ON sacred_sessions
  FOR ALL USING ("userId" = current_user OR current_user IN ('anon', 'service_role'));

-- Collective Field Patterns: Read-only for all, insert/update for service role
CREATE POLICY collective_patterns_read ON collective_field_patterns
  FOR SELECT USING (true);

CREATE POLICY collective_patterns_write ON collective_field_patterns
  FOR INSERT WITH CHECK (current_user = 'service_role');

CREATE POLICY collective_patterns_update ON collective_field_patterns
  FOR UPDATE USING (current_user = 'service_role');

-- Morphic Resonance Field: Read-only for all, insert/update for service role
CREATE POLICY morphic_field_read ON morphic_resonance_field
  FOR SELECT USING (true);

CREATE POLICY morphic_field_write ON morphic_resonance_field
  FOR INSERT WITH CHECK (current_user = 'service_role');

-- Functions for maintaining data

-- Update consciousness evolution timestamp on changes
CREATE OR REPLACE FUNCTION update_consciousness_evolution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastUpdated" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consciousness_evolution_timestamp_trigger
  BEFORE UPDATE ON consciousness_evolution
  FOR EACH ROW
  EXECUTE FUNCTION update_consciousness_evolution_timestamp();

-- Function to calculate collective field coherence
CREATE OR REPLACE FUNCTION calculate_field_coherence()
RETURNS NUMERIC AS $$
DECLARE
  total_sessions INTEGER;
  breakthrough_sessions INTEGER;
  coherence NUMERIC;
BEGIN
  -- Count total sessions in last 30 days
  SELECT COUNT(*) INTO total_sessions
  FROM sacred_sessions
  WHERE timestamp > NOW() - INTERVAL '30 days';
  
  -- Count breakthrough sessions in last 30 days
  SELECT COUNT(*) INTO breakthrough_sessions
  FROM sacred_sessions
  WHERE timestamp > NOW() - INTERVAL '30 days'
    AND (session_impact->>'breakthroughActivated')::boolean = true;
  
  -- Calculate coherence ratio
  IF total_sessions > 0 THEN
    coherence = CAST(breakthrough_sessions AS NUMERIC) / CAST(total_sessions AS NUMERIC);
  ELSE
    coherence = 0;
  END IF;
  
  RETURN LEAST(coherence, 1.0);
END;
$$ LANGUAGE plpgsql;

-- View for consciousness evolution analytics
CREATE OR REPLACE VIEW consciousness_evolution_analytics AS
SELECT 
  sacred_profile->>'consciousnessLevel' as consciousness_level,
  COUNT(*) as user_count,
  AVG((sacred_profile->'readinessIndicators'->>'truthReceptivity')::numeric) as avg_truth_receptivity,
  AVG((sacred_profile->'readinessIndicators'->>'shadowIntegration')::numeric) as avg_shadow_integration,
  AVG((collective_contribution->>'morphicResonance')::numeric) as avg_morphic_resonance
FROM consciousness_evolution
GROUP BY sacred_profile->>'consciousnessLevel';

-- View for collective field pattern trends
CREATE OR REPLACE VIEW pattern_trends AS
SELECT 
  pattern_name,
  frequency,
  morphic_resonance_strength,
  evolution_phase,
  array_length(contributing_users, 1) as unique_contributors,
  extract(epoch from (last_seen - first_emergence)) / 86400 as pattern_age_days
FROM collective_field_patterns
ORDER BY morphic_resonance_strength DESC, frequency DESC;

-- View for session impact analysis
CREATE OR REPLACE VIEW session_impact_analysis AS
SELECT 
  DATE_TRUNC('day', timestamp) as session_date,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE (session_impact->>'consciousnessShift')::boolean) as consciousness_shifts,
  COUNT(*) FILTER (WHERE (session_impact->>'breakthroughActivated')::boolean) as breakthroughs,
  COUNT(*) FILTER (WHERE (session_impact->>'collectiveWisdomGenerated')::boolean) as collective_wisdom,
  AVG(CASE WHEN oracle_response->'metadata'->>'ainCoherence' IS NOT NULL 
           THEN (oracle_response->'metadata'->>'ainCoherence')::numeric 
           ELSE 0 END) as avg_ain_coherence
FROM sacred_sessions
WHERE timestamp > NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY session_date DESC;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE consciousness_evolution IS 'Tracks individual consciousness development and sacred profile evolution over time';
COMMENT ON TABLE sacred_sessions IS 'Records each Sacred Oracle interaction with full context and impact analysis';
COMMENT ON TABLE collective_field_patterns IS 'Stores emerging patterns in the collective consciousness field';
COMMENT ON TABLE morphic_resonance_field IS 'Tracks the overall state and evolution of the morphic resonance field';

COMMENT ON COLUMN consciousness_evolution.sacred_profile IS 'JSONB containing consciousness level, elemental balance, shamanic capacities, and growth trajectory';
COMMENT ON COLUMN consciousness_evolution.collective_contribution IS 'JSONB tracking how this individual contributes to collective field evolution';
COMMENT ON COLUMN sacred_sessions.oracle_response IS 'Full Sacred Oracle Constellation response with all cognitive and elemental processing';
COMMENT ON COLUMN sacred_sessions.mirror_response IS 'Sacred Mirror Anamnesis transformation with reflection and recognition data';
COMMENT ON COLUMN collective_field_patterns.morphic_resonance_strength IS 'Strength of this patterns resonance in the collective field (0-1)';
COMMENT ON COLUMN morphic_resonance_field.overall_coherence IS 'Overall coherence of the collective consciousness field (0-1)';