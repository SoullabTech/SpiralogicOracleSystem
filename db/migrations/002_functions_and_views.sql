-- Soullab Maya: Database Functions and Views
-- Purpose: Helper functions and analytical views for the sacred witness system

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate user's dominant element over time
CREATE OR REPLACE FUNCTION get_user_dominant_element(p_user_id UUID, p_days INT DEFAULT 7)
RETURNS TABLE(element TEXT, percentage FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest(elemental_sequence) as element,
        COUNT(*)::FLOAT / NULLIF(SUM(COUNT(*)) OVER (), 0) as percentage
    FROM conversations
    WHERE user_id = p_user_id
        AND started_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY unnest(elemental_sequence)
    ORDER BY percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's archetypal evolution
CREATE OR REPLACE FUNCTION get_archetype_evolution(p_user_id UUID)
RETURNS TABLE(
    timestamp TIMESTAMPTZ,
    dominant_archetype TEXT,
    strength FLOAT,
    novelty_present BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        created_at as timestamp,
        dominant_archetype,
        archetype_stability as strength,
        (novelty_strength > 0.3) as novelty_present
    FROM archetype_signals
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Function to find similar journal entries (semantic search)
CREATE OR REPLACE FUNCTION find_similar_entries(
    p_user_id UUID,
    p_query_vector vector,
    p_limit INT DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    similarity FLOAT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        je.id,
        je.content,
        1 - (je.content_vector <=> p_query_vector) as similarity,
        je.created_at
    FROM journal_entries je
    WHERE je.user_id = p_user_id
        AND je.content_vector IS NOT NULL
    ORDER BY je.content_vector <=> p_query_vector
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate collective field resonance
CREATE OR REPLACE FUNCTION calculate_field_resonance(p_pattern_type TEXT)
RETURNS FLOAT AS $$
DECLARE
    v_resonance FLOAT;
BEGIN
    SELECT 
        AVG(field_strength * coherence_level) INTO v_resonance
    FROM collective_patterns
    WHERE pattern_type = p_pattern_type
        AND last_seen_at >= NOW() - INTERVAL '30 days';
    
    RETURN COALESCE(v_resonance, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Function to detect conversation patterns needing redirection
CREATE OR REPLACE FUNCTION needs_redirection(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_exchange_count INT;
    v_user_id UUID;
    v_max_exchanges INT;
BEGIN
    -- Get conversation details
    SELECT exchange_count, user_id INTO v_exchange_count, v_user_id
    FROM conversations
    WHERE id = p_conversation_id;
    
    -- Get user's max exchange preference
    SELECT COALESCE(us.max_exchanges, 3) INTO v_max_exchanges
    FROM user_settings us
    WHERE us.user_id = v_user_id;
    
    -- Default to 3 if no settings
    v_max_exchanges := COALESCE(v_max_exchanges, 3);
    
    RETURN v_exchange_count >= v_max_exchanges;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: User journey overview
CREATE OR REPLACE VIEW user_journey_overview AS
SELECT 
    u.id as user_id,
    u.sacred_name,
    u.created_at as journey_started,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT je.id) as journal_entries,
    AVG(c.exchange_count) as avg_exchanges_per_conversation,
    AVG(c.presence_depth) as avg_presence_depth,
    mode() WITHIN GROUP (ORDER BY c.dominant_element) as most_common_element,
    ARRAY_AGG(DISTINCT a.dominant_archetype) FILTER (WHERE a.dominant_archetype IS NOT NULL) as explored_archetypes
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
LEFT JOIN journal_entries je ON u.id = je.user_id
LEFT JOIN archetype_signals a ON u.id = a.user_id
GROUP BY u.id, u.sacred_name, u.created_at;

-- View: Collective archetypal field
CREATE OR REPLACE VIEW collective_archetypal_field AS
SELECT 
    cp.pattern_name as archetype,
    cp.field_strength,
    cp.coherence_level,
    cp.user_count,
    cp.evolution_trajectory,
    cp.last_seen_at,
    CASE 
        WHEN cp.last_seen_at >= NOW() - INTERVAL '1 day' THEN 'active'
        WHEN cp.last_seen_at >= NOW() - INTERVAL '7 days' THEN 'present'
        WHEN cp.last_seen_at >= NOW() - INTERVAL '30 days' THEN 'fading'
        ELSE 'dormant'
    END as field_status
FROM collective_patterns cp
WHERE cp.pattern_type = 'archetype'
ORDER BY cp.field_strength DESC;

-- View: Daily rhythm patterns
CREATE OR REPLACE VIEW daily_rhythm_patterns AS
SELECT 
    DATE(created_at) as day,
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as interaction_count,
    AVG(CASE WHEN entry_type = 'reflection' THEN 1 ELSE 0 END) as reflection_ratio,
    AVG(CASE WHEN entry_type = 'dream' THEN 1 ELSE 0 END) as dream_ratio,
    AVG(CASE WHEN entry_type = 'intention' THEN 1 ELSE 0 END) as intention_ratio,
    mode() WITHIN GROUP (ORDER BY element) as dominant_element
FROM journal_entries
GROUP BY DATE(created_at), EXTRACT(HOUR FROM created_at);

-- View: Elemental balance tracker
CREATE OR REPLACE VIEW elemental_balance AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE element = 'fire') as fire_count,
    COUNT(*) FILTER (WHERE element = 'water') as water_count,
    COUNT(*) FILTER (WHERE element = 'earth') as earth_count,
    COUNT(*) FILTER (WHERE element = 'air') as air_count,
    COUNT(*) FILTER (WHERE element = 'aether') as aether_count,
    COUNT(*)::FLOAT as total_count,
    ROUND(COUNT(*) FILTER (WHERE element = 'fire')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as fire_percentage,
    ROUND(COUNT(*) FILTER (WHERE element = 'water')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as water_percentage,
    ROUND(COUNT(*) FILTER (WHERE element = 'earth')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as earth_percentage,
    ROUND(COUNT(*) FILTER (WHERE element = 'air')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as air_percentage,
    ROUND(COUNT(*) FILTER (WHERE element = 'aether')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as aether_percentage
FROM journal_entries
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- View: Story medicine tracker
CREATE OR REPLACE VIEW story_medicine_impact AS
SELECT 
    sw.user_id,
    sw.story_type,
    sw.tradition,
    COUNT(*) as stories_received,
    AVG(sw.emotional_resonance) as avg_emotional_resonance,
    AVG(sw.transformative_potential) as avg_transformative_potential,
    ARRAY_AGG(DISTINCT unnest(sw.activated_archetypes)) as all_activated_archetypes,
    MAX(sw.created_at) as last_story_date
FROM story_weavings sw
GROUP BY sw.user_id, sw.story_type, sw.tradition;

-- View: Conversation quality metrics
CREATE OR REPLACE VIEW conversation_quality AS
SELECT 
    c.id as conversation_id,
    c.user_id,
    c.exchange_count,
    c.presence_depth,
    c.witness_quality,
    c.mirror_clarity,
    c.redirection_count,
    CASE 
        WHEN c.exchange_count <= 3 AND c.presence_depth > 0.7 THEN 'optimal'
        WHEN c.exchange_count <= 5 AND c.presence_depth > 0.5 THEN 'good'
        WHEN c.exchange_count > 5 AND c.redirection_count = 0 THEN 'extended_no_redirect'
        WHEN c.exchange_count > 7 THEN 'overextended'
        ELSE 'standard'
    END as quality_assessment,
    c.started_at,
    c.ended_at,
    EXTRACT(EPOCH FROM (c.ended_at - c.started_at))/60 as duration_minutes
FROM conversations c
WHERE c.ended_at IS NOT NULL;

-- =====================================================
-- MATERIALIZED VIEWS (for performance)
-- =====================================================

-- Materialized view: User resonance profile (refresh daily)
CREATE MATERIALIZED VIEW user_resonance_profile AS
SELECT 
    u.id as user_id,
    u.sacred_name,
    -- Elemental profile
    mode() WITHIN GROUP (ORDER BY je.element) as primary_element,
    -- Archetypal profile  
    mode() WITHIN GROUP (ORDER BY a.dominant_archetype) as primary_archetype,
    AVG(a.archetype_stability) as archetype_stability,
    AVG(a.novelty_strength) as novelty_openness,
    -- Conversation style
    AVG(c.exchange_count) as avg_conversation_length,
    AVG(c.presence_depth) as avg_presence_depth,
    -- Engagement metrics
    COUNT(DISTINCT DATE(je.created_at)) as active_days,
    COUNT(je.id) as total_reflections,
    MAX(je.created_at) as last_reflection
FROM users u
LEFT JOIN journal_entries je ON u.id = je.user_id
LEFT JOIN archetype_signals a ON u.id = a.user_id
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id, u.sacred_name;

-- Create index on materialized view
CREATE INDEX idx_resonance_profile_user ON user_resonance_profile(user_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_user_resonance_profile()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_resonance_profile;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Complete conversation and calculate metrics
CREATE OR REPLACE PROCEDURE complete_conversation(
    p_conversation_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_exchange_count INT;
    v_dominant_element TEXT;
    v_archetype_shift BOOLEAN;
BEGIN
    -- Get conversation details
    SELECT user_id INTO v_user_id
    FROM conversations
    WHERE id = p_conversation_id;
    
    -- Count exchanges
    SELECT COUNT(*) INTO v_exchange_count
    FROM messages
    WHERE conversation_id = p_conversation_id;
    
    -- Determine dominant element
    SELECT mode() WITHIN GROUP (ORDER BY elemental_tone) INTO v_dominant_element
    FROM messages
    WHERE conversation_id = p_conversation_id
        AND role = 'maya'
        AND elemental_tone IS NOT NULL;
    
    -- Update conversation with final metrics
    UPDATE conversations
    SET 
        ended_at = NOW(),
        exchange_count = v_exchange_count,
        dominant_element = v_dominant_element
    WHERE id = p_conversation_id;
    
    -- Log to collective patterns if significant
    IF v_exchange_count > 5 THEN
        INSERT INTO collective_patterns (
            pattern_type,
            pattern_name,
            pattern_description,
            occurrence_count
        )
        VALUES (
            'conversation',
            'extended_engagement',
            'User engaged in extended conversation beyond typical range',
            1
        )
        ON CONFLICT (pattern_type, pattern_name) 
        DO UPDATE SET 
            occurrence_count = collective_patterns.occurrence_count + 1,
            last_seen_at = NOW();
    END IF;
END;
$$;

-- Procedure: Process journal entry for patterns
CREATE OR REPLACE PROCEDURE process_journal_entry(
    p_entry_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_content TEXT;
    v_element TEXT;
BEGIN
    -- Get entry details
    SELECT user_id, content, element 
    INTO v_user_id, v_content, v_element
    FROM journal_entries
    WHERE id = p_entry_id;
    
    -- Update user's last seen
    UPDATE users
    SET last_seen_at = NOW()
    WHERE id = v_user_id;
    
    -- Track elemental pattern
    INSERT INTO collective_patterns (
        pattern_type,
        pattern_name,
        pattern_description,
        occurrence_count
    )
    VALUES (
        'elemental',
        v_element,
        v_element || ' element resonance in journaling',
        1
    )
    ON CONFLICT (pattern_type, pattern_name)
    DO UPDATE SET
        occurrence_count = collective_patterns.occurrence_count + 1,
        last_seen_at = NOW(),
        field_strength = LEAST(1.0, collective_patterns.field_strength + 0.01);
END;
$$;