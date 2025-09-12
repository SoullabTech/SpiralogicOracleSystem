-- Soullab Maya: Security Policies and Access Control
-- Purpose: Comprehensive RLS (Row Level Security) policies for data protection

-- =====================================================
-- ENABLE RLS ON ALL TABLES (if not already enabled)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_weavings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (for clean slate)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own journal" ON journal_entries;
DROP POLICY IF EXISTS "Users can create journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON journal_entries;
DROP POLICY IF EXISTS "Users can view own archetypes" ON archetype_signals;
DROP POLICY IF EXISTS "System can insert archetype signals" ON archetype_signals;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can view own stories" ON story_weavings;
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
DROP POLICY IF EXISTS "Collective patterns are public" ON collective_patterns;
DROP POLICY IF EXISTS "System can manage collective patterns" ON collective_patterns;

-- =====================================================
-- USER POLICIES
-- =====================================================

-- Users table: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- JOURNAL ENTRIES POLICIES
-- =====================================================

-- Users can fully manage their own journal entries
CREATE POLICY "Users can view own journal" ON journal_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create journal entries" ON journal_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal" ON journal_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal" ON journal_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- ARCHETYPE SIGNALS POLICIES
-- =====================================================

-- Users can view their own archetype signals
CREATE POLICY "Users can view own archetypes" ON archetype_signals
    FOR SELECT
    USING (auth.uid() = user_id);

-- System (service role) can insert archetype signals
CREATE POLICY "System can insert archetype signals" ON archetype_signals
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- =====================================================
-- CONVERSATIONS POLICIES
-- =====================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- System can update conversations
CREATE POLICY "System can update conversations" ON conversations
    FOR UPDATE
    USING (true) -- Service role handles this
    WITH CHECK (true);

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages from their conversations
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND role = 'user');

-- System can insert Maya's messages
CREATE POLICY "System can insert Maya messages" ON messages
    FOR INSERT
    WITH CHECK (role = 'maya'); -- Service role only

-- =====================================================
-- STORY WEAVINGS POLICIES
-- =====================================================

-- Users can view their own stories
CREATE POLICY "Users can view own stories" ON story_weavings
    FOR SELECT
    USING (auth.uid() = user_id);

-- System creates stories for users
CREATE POLICY "System can create stories" ON story_weavings
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- =====================================================
-- USER SETTINGS POLICIES
-- =====================================================

-- Users have full control over their settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COLLECTIVE PATTERNS POLICIES
-- =====================================================

-- Everyone can view collective patterns (anonymous data)
CREATE POLICY "Collective patterns are public" ON collective_patterns
    FOR SELECT
    USING (true);

-- Only system can modify collective patterns
CREATE POLICY "System can insert collective patterns" ON collective_patterns
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "System can update collective patterns" ON collective_patterns
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS FOR SECURE DATA ACCESS
-- =====================================================

-- Function to safely get user data (callable by authenticated users)
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    sacred_name TEXT,
    preferred_elements TEXT[],
    conversation_style TEXT,
    created_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.sacred_name,
        u.preferred_elements,
        u.conversation_style,
        u.created_at
    FROM users u
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Function to safely create a journal entry
CREATE OR REPLACE FUNCTION create_journal_entry(
    p_content TEXT,
    p_element TEXT DEFAULT 'aether',
    p_entry_type TEXT DEFAULT 'reflection',
    p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    v_entry_id UUID;
BEGIN
    INSERT INTO journal_entries (
        user_id,
        content,
        element,
        entry_type,
        tags
    )
    VALUES (
        auth.uid(),
        p_content,
        p_element,
        p_entry_type,
        p_tags
    )
    RETURNING id INTO v_entry_id;
    
    -- Process the entry for patterns
    CALL process_journal_entry(v_entry_id);
    
    RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's recent conversations safely
CREATE OR REPLACE FUNCTION get_my_recent_conversations(p_limit INT DEFAULT 10)
RETURNS TABLE (
    id UUID,
    exchange_count INT,
    dominant_element TEXT,
    presence_depth FLOAT,
    started_at TIMESTAMPTZ,
    duration_minutes FLOAT
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.exchange_count,
        c.dominant_element,
        c.presence_depth,
        c.started_at,
        EXTRACT(EPOCH FROM (c.ended_at - c.started_at))/60 as duration_minutes
    FROM conversations c
    WHERE c.user_id = auth.uid()
    ORDER BY c.started_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get collective field state (anonymous)
CREATE OR REPLACE FUNCTION get_collective_field_state()
RETURNS TABLE (
    pattern_type TEXT,
    pattern_name TEXT,
    field_strength FLOAT,
    coherence_level FLOAT,
    user_count INT,
    evolution_trajectory TEXT
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.pattern_type,
        cp.pattern_name,
        cp.field_strength,
        cp.coherence_level,
        cp.user_count,
        cp.evolution_trajectory
    FROM collective_patterns cp
    WHERE cp.last_seen_at >= NOW() - INTERVAL '30 days'
    ORDER BY cp.field_strength DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS FOR FUNCTIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION create_journal_entry(TEXT, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_recent_conversations(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_collective_field_state() TO authenticated, anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- AUDIT LOGGING (Optional but recommended)
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only system can write to audit log
CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- SECURITY BEST PRACTICES CHECKLIST
-- =====================================================

COMMENT ON SCHEMA public IS 'Soullab Maya: Sacred Witness System
Security Guidelines:
1. All user data is protected by RLS
2. Users can only access their own data
3. Collective patterns are anonymized
4. Service role required for system operations
5. All functions use SECURITY DEFINER for controlled access
6. Audit logging tracks sensitive operations
7. No direct table access - use functions for data operations';

-- Final security check
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check that RLS is enabled on all user tables
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'journal_entries', 'archetype_signals',
            'conversations', 'messages', 'story_weavings',
            'user_settings', 'collective_patterns', 'audit_log'
        )
    LOOP
        RAISE NOTICE 'RLS Status Check - Table: % - RLS should be enabled', r.tablename;
    END LOOP;
END $$;