-- Migration: Create Collective Intelligence Tables for Three-Level Oracle System
-- Description: Implements Level 2 (Collective Intelligence) data structures for MainOracleAgent

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Elemental Patterns Table
-- Stores discovered patterns across user interactions
CREATE TABLE IF NOT EXISTS elemental_patterns (
    pattern_id VARCHAR PRIMARY KEY DEFAULT 'pattern_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    elements_involved TEXT[] NOT NULL,
    context_domain VARCHAR(255),
    cultural_context VARCHAR(255),
    age_demographic VARCHAR(50),
    success_metrics JSONB DEFAULT '{
        "confidence": 0,
        "user_satisfaction": "pending",
        "follow_up_success": "pending"
    }'::jsonb,
    integration_wisdom TEXT,
    discovered_by_user UUID REFERENCES auth.users(id),
    verified_by_others INTEGER DEFAULT 0,
    pattern_strength FLOAT DEFAULT 0.0 CHECK (pattern_strength >= 0 AND pattern_strength <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for elemental_patterns
CREATE INDEX idx_elemental_patterns_elements ON elemental_patterns USING GIN(elements_involved);
CREATE INDEX idx_elemental_patterns_domain ON elemental_patterns(context_domain);
CREATE INDEX idx_elemental_patterns_culture ON elemental_patterns(cultural_context);
CREATE INDEX idx_elemental_patterns_strength ON elemental_patterns(pattern_strength DESC);
CREATE INDEX idx_elemental_patterns_created ON elemental_patterns(created_at DESC);

-- 2. Agent Wisdom Exchanges Table
-- Tracks agent-to-agent communication and learning
CREATE TABLE IF NOT EXISTS agent_wisdom_exchanges (
    exchange_id VARCHAR PRIMARY KEY DEFAULT 'exchange_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    from_agent VARCHAR(100) NOT NULL,
    to_agent VARCHAR(100) NOT NULL,
    wisdom_content TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    exchange_type VARCHAR(50) DEFAULT 'wisdom_share',
    relevance_score FLOAT DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    applied_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent_wisdom_exchanges
CREATE INDEX idx_agent_exchanges_agents ON agent_wisdom_exchanges(from_agent, to_agent);
CREATE INDEX idx_agent_exchanges_type ON agent_wisdom_exchanges(exchange_type);
CREATE INDEX idx_agent_exchanges_created ON agent_wisdom_exchanges(created_at DESC);

-- 3. Collective Salons Table
-- Manages group wisdom gatherings and collective intelligence sessions
CREATE TABLE IF NOT EXISTS collective_salons (
    salon_id VARCHAR PRIMARY KEY DEFAULT 'salon_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    salon_type VARCHAR(50) CHECK (salon_type IN ('world_cafe', 'council_of_elders', 'elemental_salon', 'wisdom_circle')),
    theme TEXT NOT NULL,
    participants UUID[] DEFAULT ARRAY[]::UUID[],
    facilitated_by VARCHAR(100) NOT NULL,
    insights_generated TEXT[] DEFAULT ARRAY[]::TEXT[],
    patterns_discovered VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    next_evolution TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for collective_salons
CREATE INDEX idx_salons_type ON collective_salons(salon_type);
CREATE INDEX idx_salons_status ON collective_salons(status);
CREATE INDEX idx_salons_participants ON collective_salons USING GIN(participants);
CREATE INDEX idx_salons_created ON collective_salons(created_at DESC);

-- 4. Pattern Contributions Table
-- Tracks individual contributions to collective patterns
CREATE TABLE IF NOT EXISTS pattern_contributions (
    contribution_id VARCHAR PRIMARY KEY DEFAULT 'contrib_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_id VARCHAR REFERENCES elemental_patterns(pattern_id) ON DELETE CASCADE,
    contribution_type VARCHAR(50) DEFAULT 'validation',
    content TEXT,
    impact_score FLOAT DEFAULT 0.0 CHECK (impact_score >= 0 AND impact_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pattern_contributions
CREATE INDEX idx_contributions_user ON pattern_contributions(user_id);
CREATE INDEX idx_contributions_pattern ON pattern_contributions(pattern_id);
CREATE INDEX idx_contributions_type ON pattern_contributions(contribution_type);
CREATE INDEX idx_contributions_impact ON pattern_contributions(impact_score DESC);

-- 5. Collective Observations Table
-- Stores all user interactions for pattern analysis
CREATE TABLE IF NOT EXISTS collective_observations (
    observation_id VARCHAR PRIMARY KEY DEFAULT 'obs_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    user_id UUID REFERENCES auth.users(id),
    query_text TEXT NOT NULL,
    query_type VARCHAR(100),
    preferred_element VARCHAR(20),
    shadow_work_requested BOOLEAN DEFAULT FALSE,
    collective_insight_requested BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for collective_observations
CREATE INDEX idx_observations_user ON collective_observations(user_id);
CREATE INDEX idx_observations_type ON collective_observations(query_type);
CREATE INDEX idx_observations_element ON collective_observations(preferred_element);
CREATE INDEX idx_observations_created ON collective_observations(created_at DESC);

-- 6. Cultural Wisdom Mappings Table
-- Maps patterns to cultural contexts
CREATE TABLE IF NOT EXISTS cultural_wisdom_mappings (
    mapping_id VARCHAR PRIMARY KEY DEFAULT 'cultural_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    pattern_id VARCHAR REFERENCES elemental_patterns(pattern_id),
    culture_code VARCHAR(50) NOT NULL,
    cultural_expression TEXT,
    traditional_name VARCHAR(255),
    historical_references TEXT[],
    modern_applications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cultural_wisdom_mappings
CREATE INDEX idx_cultural_pattern ON cultural_wisdom_mappings(pattern_id);
CREATE INDEX idx_cultural_code ON cultural_wisdom_mappings(culture_code);

-- 7. Agent Learning Log Table
-- Tracks how agents evolve through interactions
CREATE TABLE IF NOT EXISTS agent_learning_log (
    log_id VARCHAR PRIMARY KEY DEFAULT 'learn_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    agent_name VARCHAR(100) NOT NULL,
    learning_type VARCHAR(50),
    content TEXT NOT NULL,
    integration_successful BOOLEAN DEFAULT FALSE,
    impact_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent_learning_log
CREATE INDEX idx_learning_agent ON agent_learning_log(agent_name);
CREATE INDEX idx_learning_type ON agent_learning_log(learning_type);
CREATE INDEX idx_learning_success ON agent_learning_log(integration_successful);
CREATE INDEX idx_learning_created ON agent_learning_log(created_at DESC);

-- 8. Wisdom Democratization Events Table
-- Tracks how wisdom spreads through the collective
CREATE TABLE IF NOT EXISTS wisdom_democratization_events (
    event_id VARCHAR PRIMARY KEY DEFAULT 'demo_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9),
    source_pattern_id VARCHAR REFERENCES elemental_patterns(pattern_id),
    reached_users UUID[] DEFAULT ARRAY[]::UUID[],
    spread_mechanism VARCHAR(50),
    cultural_contexts VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    impact_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for wisdom_democratization_events
CREATE INDEX idx_demo_pattern ON wisdom_democratization_events(source_pattern_id);
CREATE INDEX idx_demo_mechanism ON wisdom_democratization_events(spread_mechanism);
CREATE INDEX idx_demo_impact ON wisdom_democratization_events(impact_score DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_elemental_patterns_updated_at BEFORE UPDATE ON elemental_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collective_salons_updated_at BEFORE UPDATE ON collective_salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for security
ALTER TABLE elemental_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_wisdom_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_wisdom_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_democratization_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Elemental patterns: Anyone can read, only discoverer can update
CREATE POLICY "Elemental patterns are viewable by all" ON elemental_patterns
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own patterns" ON elemental_patterns
    FOR UPDATE USING (auth.uid() = discovered_by_user);

-- Agent exchanges: Only system can insert, all can read
CREATE POLICY "Agent exchanges are viewable by all" ON agent_wisdom_exchanges
    FOR SELECT USING (true);

-- Collective salons: Participants can view their salons
CREATE POLICY "Salon participants can view their salons" ON collective_salons
    FOR SELECT USING (auth.uid() = ANY(participants) OR status = 'active');

-- Pattern contributions: Users can manage their own contributions
CREATE POLICY "Users can manage their contributions" ON pattern_contributions
    FOR ALL USING (auth.uid() = user_id);

-- Collective observations: Users can view their own observations
CREATE POLICY "Users can view their observations" ON collective_observations
    FOR SELECT USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE elemental_patterns IS 'Stores discovered patterns from collective user interactions across elemental integrations';
COMMENT ON TABLE agent_wisdom_exchanges IS 'Records inter-agent communication for collective learning and wisdom sharing';
COMMENT ON TABLE collective_salons IS 'Manages group wisdom gathering sessions for democratized intelligence';
COMMENT ON TABLE pattern_contributions IS 'Tracks individual contributions to collective pattern discovery and validation';
COMMENT ON TABLE collective_observations IS 'Archives all user queries for pattern recognition and collective intelligence';
COMMENT ON TABLE cultural_wisdom_mappings IS 'Maps universal patterns to specific cultural expressions and traditions';
COMMENT ON TABLE agent_learning_log IS 'Documents agent evolution through user interactions and pattern recognition';
COMMENT ON TABLE wisdom_democratization_events IS 'Tracks the spread of wisdom patterns through the collective field';

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;