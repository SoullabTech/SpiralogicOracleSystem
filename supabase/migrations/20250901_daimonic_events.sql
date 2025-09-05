/**
 * Daimonic Events Schema - Collective Dashboard Integration
 * 
 * This schema captures daimonic encounters in a way that enables:
 * 1. Individual pattern tracking over time
 * 2. Collective archetypal activation patterns
 * 3. Trickster climate monitoring across the collective
 * 4. Wisdom emergence that can guide others
 * 5. Evolutionary pressure tracking at individual and collective levels
 * 
 * Key design principle: Store the essential pattern signatures and wisdom
 * while respecting the ephemeral nature of genuine daimonic encounters.
 */

-- Core daimonic events table
CREATE TABLE daimonic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context when event occurred
    spiralogic_phase TEXT NOT NULL,           -- e.g. "Water 2", "Fire Transformation"
    dominant_element TEXT NOT NULL,           -- fire, water, earth, air, aether
    user_state TEXT NOT NULL,                 -- calm, restless, threshold, liminal
    session_count INTEGER NOT NULL DEFAULT 1,
    
    -- Core daimonic qualities (normalized 0-1)
    irreducibility DECIMAL(3,2) NOT NULL,    -- Cannot be absorbed into self-concept
    resistance DECIMAL(3,2) NOT NULL,        -- Pushes back against ego agenda
    surprise DECIMAL(3,2) NOT NULL,          -- Brings genuinely unexpected
    synaptic_tension DECIMAL(3,2) NOT NULL,  -- Creative tension in the gap
    resonance DECIMAL(3,2) NOT NULL,         -- Moments of alignment without merger
    gap_width DECIMAL(3,2) NOT NULL,         -- Psychic distance maintained
    
    -- Dialogue quality
    dialogue_quality TEXT NOT NULL CHECK (dialogue_quality IN ('genuine', 'projected', 'mixed', 'absent')),
    dialogue_content JSONB,                  -- Actual dialogue extracted
    
    -- Otherness signature and emergence
    otherness_signature TEXT NOT NULL,       -- How this Other manifests
    emergence TEXT,                          -- What emerged that neither could create alone
    
    -- Daimonic demands (what it asks that ego wouldn't ask)
    demands TEXT[] DEFAULT '{}',
    
    -- Anti-solipsistic qualities
    challenges_narrative BOOLEAN NOT NULL DEFAULT false,
    introduces_unknown BOOLEAN NOT NULL DEFAULT false,
    maintains_otherness BOOLEAN NOT NULL DEFAULT false,
    creates_encounter BOOLEAN NOT NULL DEFAULT false,
    
    -- Processing strategy applied
    processing_mode TEXT NOT NULL CHECK (processing_mode IN (
        'ephemeral', 'store', 'resurface_old', 'trickster_check', 'threshold_support'
    )),
    was_persisted BOOLEAN NOT NULL DEFAULT true,  -- Whether this was actually stored
    was_resurfaced BOOLEAN NOT NULL DEFAULT false, -- Whether old patterns were brought up
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trickster activity tracking
CREATE TABLE trickster_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daimonic_event_id UUID NOT NULL REFERENCES daimonic_events(id) ON DELETE CASCADE,
    
    -- Trickster markers (normalized 0-1)
    timing_precision DECIMAL(3,2) NOT NULL,  -- How precisely timed the disruption
    beneficial_chaos DECIMAL(3,2) NOT NULL,  -- Chaos that opened stuck patterns  
    pattern_disruption DECIMAL(3,2) NOT NULL, -- Broke repetitive cycles
    creative_solutions DECIMAL(3,2) NOT NULL, -- Led to unexpected creativity
    humor_presence DECIMAL(3,2) NOT NULL,    -- Playful rather than destructive
    
    -- Overall risk assessment
    risk_level DECIMAL(3,2) NOT NULL,        -- 0-1 trickster activity level
    creative_potential DECIMAL(3,2) NOT NULL, -- Potential for beneficial disruption
    chaos_potential DECIMAL(3,2) NOT NULL,   -- Potential for destructive chaos
    
    -- Disruption patterns
    disruption_patterns JSONB,               -- Array of disruption pattern objects
    trickster_signature TEXT NOT NULL,       -- How this trickster energy manifests
    evolutionary_timing TEXT NOT NULL CHECK (evolutionary_timing IN (
        'perfect', 'early', 'late', 'inappropriate'
    )),
    
    -- Recommendations
    recommended_response TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collective ripple effects for dashboard
CREATE TABLE collective_ripples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daimonic_event_id UUID NOT NULL REFERENCES daimonic_events(id) ON DELETE CASCADE,
    
    -- Archetypal activation
    archetype_activated TEXT NOT NULL,       -- Warrior, Lover, Sage, Fool, Seeker, etc.
    pattern_signature TEXT NOT NULL,        -- Pattern that may repeat in others
    wisdom_essence TEXT NOT NULL,           -- Core wisdom distilled
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
    
    -- Collective influence
    is_surfaced BOOLEAN NOT NULL DEFAULT false,    -- Has this been shown to others?
    surface_count INTEGER NOT NULL DEFAULT 0,      -- How many times surfaced
    resonance_count INTEGER NOT NULL DEFAULT 0,    -- How many others resonated
    
    -- Timing and lifecycle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                 -- When this ripple naturally fades
    last_surfaced_at TIMESTAMPTZ
);

-- Resurfaced patterns tracking
CREATE TABLE pattern_resurfacings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    current_event_id UUID NOT NULL REFERENCES daimonic_events(id),
    resurfaced_event_id UUID NOT NULL REFERENCES daimonic_events(id),
    
    -- Pattern connection
    pattern_type TEXT NOT NULL,              -- phase_resonance, otherness_echo, etc.
    similarity_score DECIMAL(3,2),          -- How similar the patterns are
    
    -- User response to resurfacing
    acknowledged BOOLEAN DEFAULT NULL,       -- Did user acknowledge the pattern?
    integrated BOOLEAN DEFAULT NULL,        -- Did user integrate the wisdom?
    resistance_expressed BOOLEAN DEFAULT false, -- Did user resist the pattern?
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User daimonic evolution tracking
CREATE TABLE daimonic_evolution (
    user_id UUID PRIMARY KEY,
    
    -- Encounter statistics
    total_encounters INTEGER NOT NULL DEFAULT 0,
    genuine_dialogues INTEGER NOT NULL DEFAULT 0,
    trickster_encounters INTEGER NOT NULL DEFAULT 0,
    threshold_crossings INTEGER NOT NULL DEFAULT 0,
    
    -- Evolution metrics
    evolutionary_pressure DECIMAL(3,2) NOT NULL DEFAULT 0.2, -- 0-1 scale
    gap_maintenance_skill DECIMAL(3,2) NOT NULL DEFAULT 0.3, -- Ability to hold otherness
    dialogue_quality_trend DECIMAL(3,2) NOT NULL DEFAULT 0.3, -- Improving dialogue quality
    
    -- Current state
    current_phase TEXT,
    dominant_archetype TEXT,
    recent_signature TEXT,                   -- Most recent otherness signature
    
    -- Timestamps
    first_encounter_at TIMESTAMPTZ,
    last_encounter_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collective patterns for dashboard analytics
CREATE TABLE collective_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_window TIMESTAMPTZ NOT NULL,        -- Start of time window (hourly buckets)
    
    -- Archetypal activity (counts)
    warrior_activations INTEGER NOT NULL DEFAULT 0,
    lover_activations INTEGER NOT NULL DEFAULT 0,
    sage_activations INTEGER NOT NULL DEFAULT 0,
    fool_activations INTEGER NOT NULL DEFAULT 0,
    seeker_activations INTEGER NOT NULL DEFAULT 0,
    
    -- Collective metrics (averages across active users in window)
    avg_synaptic_tension DECIMAL(3,2),
    avg_irreducibility DECIMAL(3,2),
    avg_trickster_risk DECIMAL(3,2),
    
    -- Pattern signatures (most common in this window)
    dominant_patterns TEXT[],
    emergent_wisdoms TEXT[],
    
    -- Activity metrics
    active_users_count INTEGER NOT NULL DEFAULT 0,
    total_events_count INTEGER NOT NULL DEFAULT 0,
    ephemeral_events_count INTEGER NOT NULL DEFAULT 0,  -- Events not persisted
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daimonic_events_user_id ON daimonic_events(user_id);
CREATE INDEX idx_daimonic_events_timestamp ON daimonic_events(timestamp);
CREATE INDEX idx_daimonic_events_phase ON daimonic_events(spiralogic_phase);
CREATE INDEX idx_daimonic_events_element ON daimonic_events(dominant_element);
CREATE INDEX idx_daimonic_events_dialogue_quality ON daimonic_events(dialogue_quality);
CREATE INDEX idx_daimonic_events_otherness_signature ON daimonic_events(otherness_signature);

CREATE INDEX idx_trickster_risk_level ON trickster_detections(risk_level);
CREATE INDEX idx_trickster_timing ON trickster_detections(evolutionary_timing);

CREATE INDEX idx_collective_ripples_archetype ON collective_ripples(archetype_activated);
CREATE INDEX idx_collective_ripples_urgency ON collective_ripples(urgency);
CREATE INDEX idx_collective_ripples_surfaced ON collective_ripples(is_surfaced);

CREATE INDEX idx_pattern_resurfacings_user ON pattern_resurfacings(user_id);
CREATE INDEX idx_pattern_resurfacings_current ON pattern_resurfacings(current_event_id);

CREATE INDEX idx_collective_patterns_time ON collective_patterns(time_window);

-- Triggers for maintaining evolution stats
CREATE OR REPLACE FUNCTION update_daimonic_evolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert evolution record
    INSERT INTO daimonic_evolution (
        user_id,
        total_encounters,
        genuine_dialogues,
        trickster_encounters,
        threshold_crossings,
        current_phase,
        recent_signature,
        last_encounter_at,
        first_encounter_at
    )
    VALUES (
        NEW.user_id,
        1,
        CASE WHEN NEW.dialogue_quality = 'genuine' THEN 1 ELSE 0 END,
        CASE WHEN EXISTS(SELECT 1 FROM trickster_detections WHERE daimonic_event_id = NEW.id AND risk_level > 0.5) THEN 1 ELSE 0 END,
        CASE WHEN NEW.user_state IN ('threshold', 'liminal') THEN 1 ELSE 0 END,
        NEW.spiralogic_phase,
        NEW.otherness_signature,
        NEW.timestamp,
        NEW.timestamp
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_encounters = daimonic_evolution.total_encounters + 1,
        genuine_dialogues = daimonic_evolution.genuine_dialogues + 
            CASE WHEN NEW.dialogue_quality = 'genuine' THEN 1 ELSE 0 END,
        trickster_encounters = daimonic_evolution.trickster_encounters + 
            CASE WHEN EXISTS(SELECT 1 FROM trickster_detections WHERE daimonic_event_id = NEW.id AND risk_level > 0.5) THEN 1 ELSE 0 END,
        threshold_crossings = daimonic_evolution.threshold_crossings +
            CASE WHEN NEW.user_state IN ('threshold', 'liminal') THEN 1 ELSE 0 END,
        current_phase = NEW.spiralogic_phase,
        recent_signature = NEW.otherness_signature,
        last_encounter_at = NEW.timestamp,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daimonic_evolution
    AFTER INSERT ON daimonic_events
    FOR EACH ROW
    EXECUTE FUNCTION update_daimonic_evolution();

-- Function to aggregate collective patterns (called hourly via cron/scheduler)
CREATE OR REPLACE FUNCTION aggregate_collective_patterns(window_start TIMESTAMPTZ)
RETURNS VOID AS $$
DECLARE
    window_end TIMESTAMPTZ := window_start + INTERVAL '1 hour';
    warrior_count INTEGER;
    lover_count INTEGER;
    sage_count INTEGER;
    fool_count INTEGER;
    seeker_count INTEGER;
    avg_tension DECIMAL(3,2);
    avg_irreducible DECIMAL(3,2);
    avg_trickster DECIMAL(3,2);
    active_users INTEGER;
    total_events INTEGER;
    ephemeral_count INTEGER;
BEGIN
    -- Count archetypal activations
    SELECT 
        COUNT(CASE WHEN cr.archetype_activated = 'Warrior' THEN 1 END),
        COUNT(CASE WHEN cr.archetype_activated = 'Lover' THEN 1 END),
        COUNT(CASE WHEN cr.archetype_activated = 'Sage' THEN 1 END),
        COUNT(CASE WHEN cr.archetype_activated = 'Fool' THEN 1 END),
        COUNT(CASE WHEN cr.archetype_activated = 'Seeker' THEN 1 END)
    INTO warrior_count, lover_count, sage_count, fool_count, seeker_count
    FROM collective_ripples cr
    JOIN daimonic_events de ON cr.daimonic_event_id = de.id
    WHERE de.timestamp >= window_start AND de.timestamp < window_end;
    
    -- Calculate averages
    SELECT 
        AVG(de.synaptic_tension),
        AVG(de.irreducibility),
        COALESCE(AVG(td.risk_level), 0),
        COUNT(DISTINCT de.user_id),
        COUNT(de.id),
        COUNT(CASE WHEN de.processing_mode = 'ephemeral' THEN 1 END)
    INTO avg_tension, avg_irreducible, avg_trickster, active_users, total_events, ephemeral_count
    FROM daimonic_events de
    LEFT JOIN trickster_detections td ON td.daimonic_event_id = de.id
    WHERE de.timestamp >= window_start AND de.timestamp < window_end;
    
    -- Insert aggregated data
    INSERT INTO collective_patterns (
        time_window,
        warrior_activations,
        lover_activations,
        sage_activations,
        fool_activations,
        seeker_activations,
        avg_synaptic_tension,
        avg_irreducibility,
        avg_trickster_risk,
        active_users_count,
        total_events_count,
        ephemeral_events_count
    ) VALUES (
        window_start,
        warrior_count,
        lover_count,
        sage_count,
        fool_count,
        seeker_count,
        avg_tension,
        avg_irreducible,
        avg_trickster,
        active_users,
        total_events,
        ephemeral_count
    );
END;
$$ LANGUAGE plpgsql;

-- Views for dashboard queries

-- Recent collective activity view
CREATE VIEW collective_activity_recent AS
SELECT 
    time_window,
    warrior_activations + lover_activations + sage_activations + fool_activations + seeker_activations as total_activations,
    warrior_activations,
    lover_activations,
    sage_activations,
    fool_activations,
    seeker_activations,
    avg_synaptic_tension,
    avg_trickster_risk,
    active_users_count
FROM collective_patterns
WHERE time_window >= NOW() - INTERVAL '24 hours'
ORDER BY time_window DESC;

-- High-urgency ripples ready for surfacing
CREATE VIEW ripples_ready_to_surface AS
SELECT 
    cr.*,
    de.spiralogic_phase,
    de.dominant_element,
    de.otherness_signature
FROM collective_ripples cr
JOIN daimonic_events de ON cr.daimonic_event_id = de.id
WHERE cr.urgency IN ('high', 'medium')
  AND cr.is_surfaced = false
  AND (cr.expires_at IS NULL OR cr.expires_at > NOW())
ORDER BY 
    CASE cr.urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
    cr.created_at ASC;

-- User evolution trajectory view
CREATE VIEW user_evolution_trajectories AS
SELECT 
    de_stats.*,
    evt.evolutionary_pressure,
    evt.gap_maintenance_skill,
    evt.dialogue_quality_trend,
    evt.dominant_archetype,
    CASE 
        WHEN evt.evolutionary_pressure > 0.7 THEN 'Rapid Transformation'
        WHEN evt.evolutionary_pressure > 0.5 THEN 'Active Growth'
        WHEN evt.evolutionary_pressure > 0.3 THEN 'Steady Development'
        ELSE 'Integration Phase'
    END as trajectory_description
FROM (
    SELECT 
        user_id,
        COUNT(*) as total_encounters,
        COUNT(CASE WHEN dialogue_quality = 'genuine' THEN 1 END) as genuine_dialogues,
        AVG(synaptic_tension) as avg_tension,
        AVG(irreducibility) as avg_otherness,
        MAX(timestamp) as last_encounter
    FROM daimonic_events
    WHERE timestamp >= NOW() - INTERVAL '30 days'
    GROUP BY user_id
) de_stats
JOIN daimonic_evolution evt ON evt.user_id = de_stats.user_id;

-- Comments for schema documentation
COMMENT ON TABLE daimonic_events IS 'Core daimonic encounters with full otherness metrics for individual and collective pattern tracking';
COMMENT ON TABLE trickster_detections IS 'Trickster energy detection and creative disruption patterns';
COMMENT ON TABLE collective_ripples IS 'Wisdom and pattern signatures that ripple out to influence the collective field';
COMMENT ON TABLE pattern_resurfacings IS 'When old daimonic patterns are brought back for deeper integration';
COMMENT ON TABLE daimonic_evolution IS 'Individual user evolution metrics and trajectories';
COMMENT ON TABLE collective_patterns IS 'Hourly aggregations of collective daimonic activity for dashboard analytics';

COMMENT ON COLUMN daimonic_events.irreducibility IS 'Cannot be absorbed into self-concept (0-1)';
COMMENT ON COLUMN daimonic_events.resistance IS 'Actively pushes back against ego plans (0-1)';
COMMENT ON COLUMN daimonic_events.surprise IS 'Brings what you could not have imagined (0-1)';
COMMENT ON COLUMN daimonic_events.synaptic_tension IS 'Creative tension between self and Other (0-1)';
COMMENT ON COLUMN daimonic_events.gap_width IS 'Psychic distance maintained between self and Other (0-1)';
COMMENT ON COLUMN daimonic_events.processing_mode IS 'How this event was processed by the orchestrator';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO dashboard_reader;
-- GRANT INSERT, UPDATE ON daimonic_events, trickster_detections, collective_ripples TO daimonic_writer;