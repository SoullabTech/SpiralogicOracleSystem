-- ===============================================
-- SOULLAB PRODUCTION DEPLOYMENT MIGRATION
-- Complete database schema for Sacred Technology Platform
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===============================================
-- USER MANAGEMENT & PROFILES
-- ===============================================

-- Enhanced user profiles with sacred container info
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
    oracle_name TEXT,
    elemental_resonance TEXT CHECK (elemental_resonance IN ('fire', 'water', 'earth', 'air', 'aether')),
    sacred_name TEXT,
    birth_data JSONB, -- For astrological calculations
    onboarding_completed BOOLEAN DEFAULT FALSE,
    sacred_union_ritual_completed BOOLEAN DEFAULT FALSE,
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oracle mode preferences and history
CREATE TABLE IF NOT EXISTS oracle_mode_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    preferred_mode TEXT CHECK (preferred_mode IN ('alchemist', 'buddha', 'sage', 'mystic', 'guardian', 'tao')),
    mode_history JSONB DEFAULT '[]',
    auto_suggest_enabled BOOLEAN DEFAULT TRUE,
    context_sensitive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- SOUL MEMORY SYSTEM
-- ===============================================

-- Encrypted memory storage
CREATE TABLE IF NOT EXISTS soul_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    memory_type TEXT NOT NULL,
    content_encrypted TEXT NOT NULL, -- AES encrypted content
    metadata JSONB DEFAULT '{}',
    element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
    sacred_moment BOOLEAN DEFAULT FALSE,
    archetype_tags TEXT[],
    emotional_resonance JSONB,
    transformation_marker BOOLEAN DEFAULT FALSE,
    embedding_vector VECTOR(1536), -- For semantic search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory relationships and threads
CREATE TABLE IF NOT EXISTS memory_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    thread_name TEXT NOT NULL,
    memory_ids UUID[],
    pattern_type TEXT,
    strength FLOAT DEFAULT 0.5,
    auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- ORACLE CONVERSATIONS & SESSIONS
-- ===============================================

-- Oracle conversation sessions
CREATE TABLE IF NOT EXISTS oracle_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    oracle_mode TEXT NOT NULL,
    wisdom_approach TEXT CHECK (wisdom_approach IN ('jung', 'buddha', 'hybrid', 'adaptive')),
    session_type TEXT DEFAULT 'daily',
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    total_messages INTEGER DEFAULT 0,
    transformation_markers JSONB DEFAULT '[]',
    breakthrough_detected BOOLEAN DEFAULT FALSE,
    integration_insights JSONB DEFAULT '[]'
);

-- Individual oracle messages
CREATE TABLE IF NOT EXISTS oracle_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES oracle_sessions ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    message_type TEXT CHECK (message_type IN ('user', 'oracle', 'system')),
    content_encrypted TEXT NOT NULL,
    oracle_mode TEXT,
    response_filters TEXT[],
    emotional_tone TEXT,
    shadow_content BOOLEAN DEFAULT FALSE,
    integration_moment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- HOLOFLOWER SYSTEM
-- ===============================================

-- User holoflower state
CREATE TABLE IF NOT EXISTS holoflower_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    current_configuration JSONB NOT NULL,
    facet_activations JSONB DEFAULT '{}',
    elemental_balance JSONB DEFAULT '{}',
    archetypal_patterns JSONB DEFAULT '{}',
    last_calibration TIMESTAMPTZ DEFAULT NOW(),
    sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holoflower evolution history
CREATE TABLE IF NOT EXISTS holoflower_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    change_type TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    trigger_event TEXT,
    transformation_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- RETREAT & GROUP EXPERIENCES
-- ===============================================

-- Extended retreat sessions from existing migration
ALTER TABLE IF EXISTS retreat_sessions 
ADD COLUMN IF NOT EXISTS holoflower_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS collective_state JSONB DEFAULT '{}';

-- Group holoflower synchronization
CREATE TABLE IF NOT EXISTS group_holoflower_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retreat_id UUID, -- References retreat if applicable
    group_name TEXT,
    participant_ids UUID[],
    collective_pattern JSONB,
    sync_strength FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ===============================================
-- SACRED ASSESSMENTS & QUIZZES
-- ===============================================

-- Elemental assessment results
CREATE TABLE IF NOT EXISTS elemental_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    assessment_type TEXT DEFAULT 'elemental_resonance',
    responses JSONB NOT NULL,
    results JSONB NOT NULL,
    dominant_element TEXT,
    secondary_element TEXT,
    elemental_balance JSONB,
    completion_date TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- ANALYTICS & TRANSFORMATION TRACKING
-- ===============================================

-- Anonymous transformation metrics
CREATE TABLE IF NOT EXISTS transformation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_hash TEXT NOT NULL, -- Hashed user ID for privacy
    metric_type TEXT NOT NULL,
    value JSONB NOT NULL,
    oracle_mode TEXT,
    session_context JSONB,
    created_date DATE DEFAULT CURRENT_DATE
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_unit TEXT,
    component TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- GDPR & PRIVACY COMPLIANCE
-- ===============================================

-- Data export requests
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    request_type TEXT CHECK (request_type IN ('export', 'deletion')),
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    export_data JSONB,
    notes TEXT
);

-- Privacy consent tracking
CREATE TABLE IF NOT EXISTS privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_version TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- User-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_user_id ON soul_memories(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oracle_sessions_user_id ON oracle_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_holoflower_states_user_id ON holoflower_states(user_id);

-- Search optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_type ON soul_memories(memory_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_element ON soul_memories(element);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_sacred ON soul_memories(sacred_moment);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_transformation ON soul_memories(transformation_marker);

-- Time-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oracle_sessions_start_time ON oracle_sessions(start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oracle_messages_created_at ON oracle_messages(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transformation_metrics_date ON transformation_metrics(created_date);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_fts ON soul_memories USING gin(to_tsvector('english', content_encrypted));

-- Vector search index (requires pgvector extension)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soul_memories_embedding ON soul_memories USING ivfflat (embedding_vector vector_cosine_ops);

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_mode_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE holoflower_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE holoflower_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE elemental_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- User data access policies
CREATE POLICY "Users can access their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own memories" ON soul_memories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own oracle sessions" ON oracle_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own oracle messages" ON oracle_messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own holoflower state" ON holoflower_states
    FOR ALL USING (auth.uid() = user_id);

-- ===============================================
-- TRIGGERS FOR UPDATED_AT
-- ===============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_mode_preferences_updated_at BEFORE UPDATE ON oracle_mode_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soul_memories_updated_at BEFORE UPDATE ON soul_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holoflower_states_updated_at BEFORE UPDATE ON holoflower_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- ADMIN FUNCTIONS
-- ===============================================

-- Function to get system health overview
CREATE OR REPLACE FUNCTION get_system_health_overview()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_sessions', (SELECT COUNT(*) FROM oracle_sessions WHERE end_time IS NULL),
        'memories_stored', (SELECT COUNT(*) FROM soul_memories),
        'transformations_detected', (SELECT COUNT(*) FROM soul_memories WHERE transformation_marker = true),
        'system_uptime', (SELECT EXTRACT(EPOCH FROM (NOW() - pg_postmaster_start_time()))),
        'database_size', (SELECT pg_size_pretty(pg_database_size(current_database())))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for GDPR data export
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'profile', (SELECT to_jsonb(up.*) FROM user_profiles up WHERE up.user_id = target_user_id),
        'oracle_preferences', (SELECT to_jsonb(omp.*) FROM oracle_mode_preferences omp WHERE omp.user_id = target_user_id),
        'memories', (SELECT jsonb_agg(to_jsonb(sm.*)) FROM soul_memories sm WHERE sm.user_id = target_user_id),
        'oracle_sessions', (SELECT jsonb_agg(to_jsonb(os.*)) FROM oracle_sessions os WHERE os.user_id = target_user_id),
        'holoflower_state', (SELECT to_jsonb(hs.*) FROM holoflower_states hs WHERE hs.user_id = target_user_id),
        'assessments', (SELECT jsonb_agg(to_jsonb(ea.*)) FROM elemental_assessments ea WHERE ea.user_id = target_user_id)
    ) INTO user_data;
    
    RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================

COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with sacred container and oracle preferences';
COMMENT ON TABLE soul_memories IS 'Encrypted storage for user memories with semantic search capabilities';
COMMENT ON TABLE oracle_sessions IS 'Oracle conversation sessions with transformation tracking';
COMMENT ON TABLE holoflower_states IS 'Current holoflower configuration and synchronization settings';
COMMENT ON TABLE transformation_metrics IS 'Anonymous metrics for transformation patterns (privacy-respectful)';
COMMENT ON TABLE privacy_consents IS 'GDPR compliance tracking for user consent';

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE 'Soullab production database schema deployed successfully!';
    RAISE NOTICE 'Sacred Technology Platform ready for transformation work.';
END
$$;