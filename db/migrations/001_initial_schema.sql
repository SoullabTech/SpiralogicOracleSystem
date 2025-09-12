-- Soullab Maya: Initial Database Schema
-- Created: 2025
-- Purpose: Sacred witness system with archetypal tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- USERS TABLE: Core identity anchor
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    sacred_name TEXT, -- Their chosen spiritual/creative name
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Presence preferences
    preferred_elements TEXT[] DEFAULT ARRAY['aether'], -- fire, water, earth, air, aether
    conversation_style TEXT DEFAULT 'balanced', -- brief, balanced, deep
    voice_enabled BOOLEAN DEFAULT false,
    
    -- Sacred witness settings
    witness_mode TEXT DEFAULT 'presence', -- presence, guide, teacher
    exchange_preference INT DEFAULT 3, -- preferred conversation length
    
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- JOURNAL ENTRIES: Sacred reflections
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core content
    content TEXT NOT NULL,
    content_vector vector(1536), -- For semantic search (OpenAI embeddings)
    
    -- Elemental resonance at time of entry
    element TEXT DEFAULT 'aether',
    element_confidence FLOAT DEFAULT 0.5,
    
    -- Emotional landscape
    emotional_state JSONB DEFAULT '{}', -- joy, sadness, fear, etc.
    
    -- Maya's witness response (if any)
    maya_response TEXT,
    maya_witnessed BOOLEAN DEFAULT false,
    
    -- Categorization
    entry_type TEXT DEFAULT 'reflection', -- reflection, dream, intention, gratitude, shadow
    tags TEXT[] DEFAULT '{}',
    
    -- Sacred timing
    moon_phase TEXT, -- new, waxing, full, waning
    season TEXT, -- spring, summer, fall, winter
    time_of_day TEXT, -- dawn, morning, noon, afternoon, dusk, night
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast semantic search
CREATE INDEX idx_journal_content_vector ON journal_entries 
USING ivfflat (content_vector vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- ARCHETYPE SIGNALS: Dual-track consciousness
-- =====================================================
CREATE TABLE IF NOT EXISTS archetype_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    
    -- Left hemisphere: Known patterns
    known_archetypes JSONB DEFAULT '{}', -- {Seeker: 0.8, Sage: 0.6}
    dominant_archetype TEXT,
    archetype_stability FLOAT DEFAULT 0.5, -- How stable the pattern is
    
    -- Right hemisphere: Novel emergence
    novel_signals JSONB DEFAULT '{}', -- Unnamed patterns emerging
    novelty_strength FLOAT DEFAULT 0.0,
    emergence_description TEXT, -- Maya's witnessing of what's emerging
    
    -- Integration metrics
    hemisphere_balance FLOAT DEFAULT 0.5, -- 0=left dominant, 1=right dominant
    integration_depth FLOAT DEFAULT 0.0, -- How well integrated both sides are
    
    -- Context
    trigger_content TEXT, -- What prompted this signal
    conversation_phase TEXT, -- opening, deepening, integration, closing
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONVERSATIONS: Sacred exchanges
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    exchange_count INT DEFAULT 0,
    total_duration_seconds INT,
    
    -- Elemental journey through conversation
    elemental_sequence TEXT[] DEFAULT '{}', -- [fire, fire, water, earth]
    dominant_element TEXT,
    
    -- Presence quality
    presence_depth FLOAT DEFAULT 0.5,
    redirection_count INT DEFAULT 0, -- Times Maya redirected to living
    help_requested BOOLEAN DEFAULT false,
    
    -- Archetypal evolution during conversation
    starting_archetype TEXT,
    ending_archetype TEXT,
    archetype_shifted BOOLEAN DEFAULT false,
    
    -- Sacred witness metrics
    witness_quality FLOAT DEFAULT 0.5,
    mirror_clarity FLOAT DEFAULT 0.5,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- MESSAGES: Individual exchanges
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message content
    role TEXT NOT NULL CHECK (role IN ('user', 'maya')),
    content TEXT NOT NULL,
    
    -- Maya's presence calibration
    presence_mode TEXT, -- witness, guide, teacher, storyteller
    elemental_tone TEXT, -- fire, water, earth, air, aether
    style_resonance TEXT, -- technical, poetic, philosophical, practical
    
    -- Response characteristics (for Maya messages)
    word_count INT,
    question_count INT, -- How many questions Maya asked
    directive_count INT, -- How many action suggestions
    
    -- Emotional resonance
    emotional_tone JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COLLECTIVE PATTERNS: Morphic field resonance
-- =====================================================
CREATE TABLE IF NOT EXISTS collective_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Pattern identification
    pattern_type TEXT NOT NULL, -- archetype, emotional, elemental, seasonal
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    
    -- Collective metrics
    occurrence_count INT DEFAULT 1,
    user_count INT DEFAULT 1, -- How many unique users
    
    -- Resonance field
    field_strength FLOAT DEFAULT 0.1,
    coherence_level FLOAT DEFAULT 0.5,
    
    -- Temporal patterns
    peak_times JSONB DEFAULT '{}', -- When this pattern is strongest
    seasonal_correlation JSONB DEFAULT '{}',
    
    -- Archetypal constellation
    associated_archetypes TEXT[] DEFAULT '{}',
    
    -- Evolution tracking
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    evolution_trajectory TEXT, -- emerging, stable, transforming, dissolving
    
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STORY WEAVINGS: Narrative medicine
-- =====================================================
CREATE TABLE IF NOT EXISTS story_weavings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    
    -- Story content
    story_title TEXT,
    story_content TEXT NOT NULL,
    story_type TEXT, -- myth, parable, journey, poem, allegory
    
    -- Mythological tradition
    tradition TEXT, -- campbell, shaw, hesse, synthesis
    
    -- Story medicine
    core_teaching TEXT,
    personal_meaning TEXT,
    activated_archetypes TEXT[] DEFAULT '{}',
    
    -- Integration guidance
    reflection_prompts TEXT[] DEFAULT '{}',
    practical_application TEXT,
    
    -- Resonance metrics
    emotional_resonance FLOAT DEFAULT 0.5,
    transformative_potential FLOAT DEFAULT 0.5,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER SETTINGS: Personalization
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Voice settings
    tts_enabled BOOLEAN DEFAULT false,
    tts_voice_id TEXT, -- ElevenLabs voice ID
    voice_speed FLOAT DEFAULT 1.0,
    voice_pitch FLOAT DEFAULT 1.0,
    
    -- Presence preferences
    maya_name TEXT DEFAULT 'Maya', -- How they want Maya to be called
    formal_address BOOLEAN DEFAULT false,
    
    -- Archetypal preferences
    avoid_archetypes TEXT[] DEFAULT '{}', -- Archetypes they don't resonate with
    embrace_archetypes TEXT[] DEFAULT '{}', -- Archetypes they love
    
    -- Sacred rhythm
    ideal_session_length INT DEFAULT 15, -- minutes
    max_exchanges INT DEFAULT 5,
    redirect_after INT DEFAULT 3, -- exchanges before redirection
    
    -- Privacy
    share_patterns_anonymously BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_journal_user_created ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_entry_type ON journal_entries(entry_type);
CREATE INDEX idx_archetype_user_created ON archetype_signals(user_id, created_at DESC);
CREATE INDEX idx_conversations_user ON conversations(user_id, started_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_collective_pattern_type ON collective_patterns(pattern_type, field_strength DESC);
CREATE INDEX idx_story_user ON story_weavings(user_id, created_at DESC);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collective_updated_at BEFORE UPDATE ON collective_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_weavings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own journal" ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own archetypes" ON archetype_signals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stories" ON story_weavings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Collective patterns are viewable by all (anonymous)
CREATE POLICY "Collective patterns are public" ON collective_patterns
    FOR SELECT USING (true);

-- =====================================================
-- INITIAL SEED DATA
-- =====================================================
-- Seed base archetypes for reference
INSERT INTO collective_patterns (pattern_type, pattern_name, pattern_description, field_strength)
VALUES 
    ('archetype', 'Seeker', 'The eternal questioner, always searching for truth', 0.8),
    ('archetype', 'Sage', 'The wise one who has walked the path', 0.7),
    ('archetype', 'Creator', 'The one who brings new forms into being', 0.7),
    ('archetype', 'Healer', 'The one who restores wholeness', 0.6),
    ('archetype', 'Warrior', 'The one who protects and fights for truth', 0.6),
    ('archetype', 'Lover', 'The one who connects and relates', 0.7),
    ('archetype', 'Sovereign', 'The one who leads with wisdom', 0.5),
    ('archetype', 'Mystic', 'The one who bridges worlds', 0.6),
    ('archetype', 'Fool', 'The wise innocent who sees with fresh eyes', 0.5),
    ('archetype', 'Shadow', 'The hidden aspects seeking integration', 0.4)
ON CONFLICT DO NOTHING;