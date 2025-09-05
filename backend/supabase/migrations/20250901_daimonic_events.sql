-- Daimonic Events Persistence Layer
-- Stores individual encounters with the Daimon as irreducible Other
-- Enables collective pattern recognition while preserving personal otherness

-- Table to store individual Daimonic encounters
CREATE TABLE daimonic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,                   -- Optional: link to session context
  phase VARCHAR(50) NOT NULL,        -- e.g. "transformation", "grounding" 
  element VARCHAR(20) NOT NULL,      -- e.g. "fire", "water", "earth", "air", "aether"
  state VARCHAR(50),                 -- e.g. "restless", "blocked", "authentic"
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Alterity measures (how Other the encounter was)
  irreducibility NUMERIC(3,2) CHECK (irreducibility >= 0 AND irreducibility <= 1),
  resistance NUMERIC(3,2) CHECK (resistance >= 0 AND resistance <= 1),
  surprise NUMERIC(3,2) CHECK (surprise >= 0 AND surprise <= 1),
  demands TEXT[],                    -- What the Daimon demanded
  
  -- Synaptic space measures (dialogue quality)
  tension NUMERIC(3,2) CHECK (tension >= 0 AND tension <= 1),
  resonance NUMERIC(3,2) CHECK (resonance >= 0 AND resonance <= 1),
  dialogue TEXT[],                   -- The actual conversation content
  emergence TEXT,                    -- What emerged from the encounter
  
  -- Anti-solipsistic integrity markers
  challenges_narrative BOOLEAN DEFAULT FALSE,
  introduces_unknown BOOLEAN DEFAULT FALSE,
  maintains_otherness BOOLEAN DEFAULT FALSE,
  creates_encounter BOOLEAN DEFAULT FALSE,
  
  -- Trickster detection and caution
  trickster_risk NUMERIC(3,2) CHECK (trickster_risk >= 0 AND trickster_risk <= 1),
  trickster_reasons TEXT[],
  trickster_caution TEXT,
  
  -- User integration tracking
  integration_velocity VARCHAR(20),  -- 'rapid', 'steady', 'contemplative'
  surprise_tolerance NUMERIC(3,2),
  last_genuine_surprise TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_daimonic_user_time ON daimonic_events (user_id, timestamp);
CREATE INDEX idx_daimonic_phase_element ON daimonic_events (phase, element);
CREATE INDEX idx_daimonic_trickster_risk ON daimonic_events (trickster_risk) WHERE trickster_risk > 0.5;
CREATE INDEX idx_daimonic_otherness ON daimonic_events (maintains_otherness, creates_encounter) WHERE maintains_otherness = true;

-- Table for collective pattern aggregations
CREATE TABLE daimonic_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase VARCHAR(50) NOT NULL,
  element VARCHAR(20) NOT NULL,
  time_window TSTZRANGE NOT NULL,    -- Time range for this snapshot
  
  -- Participation metrics
  total_encounters INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  encounter_density NUMERIC(5,2),   -- encounters per user per day
  
  -- Alterity aggregates
  avg_irreducibility NUMERIC(3,2),
  avg_resistance NUMERIC(3,2),
  avg_surprise NUMERIC(3,2),
  median_trickster_risk NUMERIC(3,2),
  
  -- Synaptic field aggregates
  avg_tension NUMERIC(3,2),
  avg_resonance NUMERIC(3,2),
  field_coherence NUMERIC(3,2),     -- How synchronized the encounters were
  
  -- Collective themes
  common_demands TEXT[],
  emergent_themes TEXT[],
  dominant_dialogues TEXT[],
  
  -- Field state assessment
  field_intensity VARCHAR(20),       -- 'low', 'medium', 'high', 'extraordinary'
  collective_trickster_prevalence NUMERIC(3,2),
  clear_transmission_indicator BOOLEAN DEFAULT FALSE,
  
  -- Integration patterns
  avg_integration_velocity NUMERIC(3,2),
  collective_surprise_threshold NUMERIC(3,2),
  silence_periods INTEGER DEFAULT 0, -- Count of users in fallow periods
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure no overlapping snapshots for same phase/element
  CONSTRAINT unique_snapshot UNIQUE (phase, element, time_window)
);

-- Indexes for dashboard queries
CREATE INDEX idx_snapshots_time_window ON daimonic_snapshots USING GIST (time_window);
CREATE INDEX idx_snapshots_phase_element ON daimonic_snapshots (phase, element);
CREATE INDEX idx_snapshots_intensity ON daimonic_snapshots (field_intensity);
CREATE INDEX idx_clear_transmission ON daimonic_snapshots (clear_transmission_indicator) WHERE clear_transmission_indicator = true;

-- Table for cross-user resonance patterns
CREATE TABLE daimonic_resonances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_ids UUID[] NOT NULL,        -- Array of related daimonic_events
  resonance_type VARCHAR(50) NOT NULL, -- 'synchronistic', 'thematic', 'elemental', 'temporal'
  
  -- Resonance strength
  coherence_score NUMERIC(3,2) CHECK (coherence_score >= 0 AND coherence_score <= 1),
  temporal_proximity INTERVAL,      -- How close in time the events were
  thematic_similarity NUMERIC(3,2),
  
  -- Pattern details
  shared_themes TEXT[],
  shared_demands TEXT[],
  emergence_pattern TEXT,
  
  -- Metadata
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure events array has at least 2 elements
  CONSTRAINT min_resonance_events CHECK (array_length(event_ids, 1) >= 2)
);

-- Index for finding resonances by event
CREATE INDEX idx_resonance_events ON daimonic_resonances USING GIN (event_ids);

-- Table for seasonal/temporal pattern tracking
CREATE TABLE daimonic_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_type VARCHAR(30) NOT NULL,   -- 'lunar', 'seasonal', 'collective_calendar'
  cycle_phase VARCHAR(50) NOT NULL,  -- e.g. 'new_moon', 'summer_solstice', 'holiday_season'
  
  -- Time range this cycle covers
  cycle_window TSTZRANGE NOT NULL,
  
  -- Daimonic activity during this cycle
  encounter_intensity NUMERIC(3,2),
  dominant_elements VARCHAR(20)[],
  prominent_themes TEXT[],
  
  -- Collective field state during cycle
  field_amplification NUMERIC(3,2), -- How much the cycle amplifies daimonic activity
  trickster_amplification NUMERIC(3,2),
  integration_support NUMERIC(3,2), -- How well the cycle supports integration
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for cycle lookups
CREATE INDEX idx_cycles_type_window ON daimonic_cycles (cycle_type, cycle_window);

-- Update trigger for daimonic_events
CREATE OR REPLACE FUNCTION update_daimonic_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_daimonic_events_timestamp
    BEFORE UPDATE ON daimonic_events
    FOR EACH ROW
    EXECUTE FUNCTION update_daimonic_events_timestamp();

-- Function to generate collective snapshots
CREATE OR REPLACE FUNCTION generate_daimonic_snapshot(
    p_phase VARCHAR(50),
    p_element VARCHAR(20),
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    encounter_count INTEGER;
    user_count INTEGER;
BEGIN
    -- Generate aggregated snapshot
    INSERT INTO daimonic_snapshots (
        phase, element, time_window,
        total_encounters, unique_users, encounter_density,
        avg_irreducibility, avg_resistance, avg_surprise, median_trickster_risk,
        avg_tension, avg_resonance,
        common_demands, emergent_themes,
        field_intensity, collective_trickster_prevalence
    )
    SELECT 
        p_phase, p_element, 
        tstzrange(p_start_time, p_end_time),
        COUNT(*) as total_encounters,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*)::NUMERIC / GREATEST(COUNT(DISTINCT user_id), 1) / EXTRACT(DAYS FROM (p_end_time - p_start_time)) as encounter_density,
        AVG(irreducibility), AVG(resistance), AVG(surprise),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY trickster_risk),
        AVG(tension), AVG(resonance),
        array_agg(DISTINCT unnest(demands)) FILTER (WHERE demands IS NOT NULL),
        array_agg(DISTINCT emergence) FILTER (WHERE emergence IS NOT NULL),
        CASE 
            WHEN AVG(irreducibility) > 0.7 AND AVG(resistance) > 0.6 THEN 'extraordinary'
            WHEN AVG(irreducibility) > 0.5 THEN 'high'
            WHEN AVG(irreducibility) > 0.3 THEN 'medium'
            ELSE 'low'
        END as field_intensity,
        AVG(trickster_risk) as collective_trickster_prevalence
    FROM daimonic_events 
    WHERE phase = p_phase 
      AND element = p_element 
      AND timestamp BETWEEN p_start_time AND p_end_time
    HAVING COUNT(*) > 0
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Function to detect resonances between recent events
CREATE OR REPLACE FUNCTION detect_daimonic_resonances(
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS INTEGER AS $$
DECLARE
    resonance_count INTEGER := 0;
    event_group RECORD;
BEGIN
    -- Find groups of events with similar themes within time window
    FOR event_group IN
        SELECT 
            array_agg(id) as event_ids,
            emergence,
            COUNT(*) as group_size
        FROM daimonic_events 
        WHERE timestamp > now() - p_time_window
          AND emergence IS NOT NULL
        GROUP BY emergence
        HAVING COUNT(*) >= 2
    LOOP
        -- Insert resonance pattern
        INSERT INTO daimonic_resonances (
            event_ids,
            resonance_type,
            coherence_score,
            temporal_proximity,
            shared_themes,
            emergence_pattern
        )
        SELECT 
            event_group.event_ids,
            'thematic',
            0.8, -- High coherence for same emergence pattern
            MAX(timestamp) - MIN(timestamp),
            array_agg(DISTINCT unnest(demands)),
            event_group.emergence
        FROM daimonic_events 
        WHERE id = ANY(event_group.event_ids);
        
        resonance_count := resonance_count + 1;
    END LOOP;
    
    RETURN resonance_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE daimonic_events IS 'Individual encounters with the Daimon as irreducible Other, preserving both personal significance and collective archetypal patterns';
COMMENT ON TABLE daimonic_snapshots IS 'Aggregated collective field states showing archetypal patterns across the community while maintaining individual encounter integrity';
COMMENT ON TABLE daimonic_resonances IS 'Cross-user synchronistic patterns and thematic resonances detected in daimonic encounters';
COMMENT ON TABLE daimonic_cycles IS 'Seasonal and temporal patterns that amplify or modulate daimonic activity';

-- Grant permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE ON daimonic_events TO authenticated;
-- GRANT SELECT ON daimonic_snapshots TO authenticated;
-- GRANT SELECT ON daimonic_resonances TO authenticated;
-- GRANT SELECT ON daimonic_cycles TO authenticated;