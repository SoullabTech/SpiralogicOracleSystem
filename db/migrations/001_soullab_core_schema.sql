-- 🌟 Soullab Core Schema
-- Sacred witness data architecture
-- Designed for presence, not surveillance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity

-- ============================================
-- USERS: Sacred individuals
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic presence
    presence_name TEXT, -- Optional, how they want to be known
    timezone TEXT DEFAULT 'UTC',
    
    -- Sacred preferences
    preferred_style TEXT DEFAULT 'soulful', -- technical/philosophical/dramatic/soulful/pragmatic
    elemental_home TEXT DEFAULT 'aether', -- Their anchor element
    
    -- Privacy first
    anonymous BOOLEAN DEFAULT false,
    data_retention_days INTEGER DEFAULT 90, -- Auto-cleanup old data
    
    -- Metadata
    last_seen TIMESTAMPTZ,
    session_count INTEGER DEFAULT 0,
    presence_minutes INTEGER DEFAULT 0 -- Total time in sacred space
);

-- ============================================
-- JOURNAL ENTRIES: Soul reflections
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- The sacred exchange
    user_sharing TEXT NOT NULL,
    maya_witness TEXT, -- Maya's reflection
    
    -- Elemental state
    dominant_element TEXT,
    element_intensity DECIMAL(3,2), -- 0.00 to 1.00
    secondary_element TEXT,
    
    -- The essence
    crystallized_insight TEXT, -- What emerged
    life_experiment TEXT, -- What they're taking into life
    
    -- Resonance
    feeling_tone TEXT, -- What emotional quality was present
    movement_quality TEXT, -- stuck/flowing/shifting/opening
    
    -- Embedding for semantic search
    embedding vector(1536), -- OpenAI ada-002 embeddings
    
    -- Privacy
    private BOOLEAN DEFAULT true,
    shareable BOOLEAN DEFAULT false -- Can contribute to collective
);

-- ============================================
-- ARCHETYPE SIGNALS: Dual-track consciousness
-- ============================================
CREATE TABLE IF NOT EXISTS archetype_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Left hemisphere (classification)
    known_archetypes JSONB, -- {seeker: 0.7, creator: 0.3}
    primary_archetype TEXT,
    archetype_confidence DECIMAL(3,2),
    
    -- Right hemisphere (novelty)
    novelty_detected BOOLEAN DEFAULT false,
    novelty_description TEXT,
    unnamed_qualities TEXT[],
    
    -- Integration
    synthesis_mode TEXT, -- 'witnessing' | 'naming' | 'exploring'
    emerged_insight TEXT,
    
    -- Evolution tracking
    evolution_phase TEXT, -- awakening/descent/initiation/integration/mastery
    previous_archetype TEXT,
    transition_detected BOOLEAN DEFAULT false
);

-- ============================================
-- COLLECTIVE PATTERNS: Morphic field
-- ============================================
CREATE TABLE IF NOT EXISTS collective_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    pattern_week DATE DEFAULT DATE_TRUNC('week', NOW()),
    
    -- Pattern identification
    pattern_type TEXT, -- 'elemental_surge' | 'archetype_emergence' | 'collective_shift'
    pattern_name TEXT,
    pattern_description TEXT,
    
    -- Resonance metrics
    frequency INTEGER DEFAULT 1, -- How many souls touched this
    coherence_score DECIMAL(3,2), -- Field alignment 0-1
    
    -- Elemental distribution this week
    elemental_balance JSONB, -- {fire: 0.2, water: 0.3, earth: 0.2, air: 0.15, aether: 0.15}
    
    -- Emerging archetypes
    novel_archetypes TEXT[], -- ['digital-shaman', 'sacred-rebel']
    archetype_frequencies JSONB, -- {seeker: 45, creator: 38, ...}
    
    -- Collective insights
    collective_themes TEXT[],
    breakthrough_patterns TEXT[],
    shadow_patterns TEXT[],
    
    -- Anonymous and aggregated only
    contributing_souls INTEGER DEFAULT 0
);

-- ============================================
-- CONVERSATION FLOWS: Sacred rhythms
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Flow qualities
    exchange_count INTEGER DEFAULT 0,
    natural_completion BOOLEAN,
    user_led_ending BOOLEAN,
    
    -- Presence metrics
    witness_mode_percentage DECIMAL(3,2), -- How much was pure witnessing
    help_requested BOOLEAN DEFAULT false,
    redirection_offered BOOLEAN DEFAULT false,
    
    -- Style dance
    style_shifts INTEGER DEFAULT 0,
    styles_touched TEXT[], -- All styles that appeared
    
    -- Sacred qualities
    depth_reached TEXT, -- surface/exploring/deep/mystery
    catalytic_moment BOOLEAN DEFAULT false,
    breakthrough_noted BOOLEAN DEFAULT false
);

-- ============================================
-- LIFE EXPERIMENTS: What they take into life
-- ============================================
CREATE TABLE IF NOT EXISTS life_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- The experiment
    experiment_description TEXT,
    experiment_element TEXT, -- Which element is being explored
    experiment_archetype TEXT, -- Which archetype is active
    
    -- The return
    returned_at TIMESTAMPTZ,
    field_notes TEXT, -- What they discovered
    outcome_quality TEXT, -- surprising/confirming/challenging/transforming
    
    -- The continuation
    next_experiment TEXT,
    evolution_noted BOOLEAN DEFAULT false
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_journal_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_embedding ON journal_entries USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_archetype_user_session ON archetype_signals(user_id, session_id);
CREATE INDEX idx_collective_week ON collective_patterns(pattern_week);
CREATE INDEX idx_conversations_user ON conversation_flows(user_id, started_at DESC);
CREATE INDEX idx_experiments_user ON life_experiments(user_id, created_at DESC);

-- Text search indexes
CREATE INDEX idx_journal_search ON journal_entries USING gin(to_tsvector('english', user_sharing || ' ' || COALESCE(maya_witness, '')));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_experiments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_self_policy ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY journal_self_policy ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY archetype_self_policy ON archetype_signals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY conversations_self_policy ON conversation_flows
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY experiments_self_policy ON life_experiments
    FOR ALL USING (auth.uid() = user_id);

-- Collective patterns are read-only for all authenticated users
CREATE POLICY collective_read_policy ON collective_patterns
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCTIONS: Sacred utilities
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to contribute to collective patterns (anonymous aggregation)
CREATE OR REPLACE FUNCTION contribute_to_collective(
    p_element TEXT,
    p_archetype TEXT,
    p_novelty BOOLEAN
) RETURNS VOID AS $$
DECLARE
    v_current_week DATE := DATE_TRUNC('week', NOW());
BEGIN
    -- This would aggregate patterns without storing individual data
    -- Implementation depends on privacy requirements
    RAISE NOTICE 'Pattern contributed to collective field';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS: Documentation in database
-- ============================================
COMMENT ON TABLE users IS 'Sacred individuals on their soul journey';
COMMENT ON TABLE journal_entries IS 'Witnessed moments and emerged insights';
COMMENT ON TABLE archetype_signals IS 'Dual-track consciousness - known patterns and novel emergence';
COMMENT ON TABLE collective_patterns IS 'Anonymous morphic field resonance';
COMMENT ON TABLE conversation_flows IS 'Sacred conversation rhythms and qualities';
COMMENT ON TABLE life_experiments IS 'What souls take from conversation into life';

-- ============================================
-- INITIAL COLLECTIVE PATTERNS SEED
-- ============================================
INSERT INTO collective_patterns (pattern_type, pattern_name, pattern_description)
VALUES 
    ('archetype_emergence', 'digital-shaman', 'Technology meets ancient wisdom'),
    ('archetype_emergence', 'sacred-rebel', 'Breaking systems with love'),
    ('elemental_surge', 'collective-water', 'Global grief and tenderness rising'),
    ('collective_shift', 'return-to-presence', 'Movement from doing to being')
ON CONFLICT DO NOTHING;