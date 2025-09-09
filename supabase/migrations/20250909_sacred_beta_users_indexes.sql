-- Sacred Beta Users & Oracle Agents Schema - INDEXES & POLICIES
-- Migration: 20250909_sacred_beta_users_indexes
-- Run this SECOND, after the core tables are created

-- Basic indexes for performance (these should work immediately)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_oracle_agents_user ON oracle_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_agents_last_conversation ON oracle_agents(last_conversation_at);
CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_agent ON conversation_sessions(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_started ON conversation_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_agent ON journal_entries(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON journal_entries(created_at DESC);

-- Conditional indexes (these need tables to exist first)
CREATE INDEX IF NOT EXISTS idx_users_beta_access 
ON users(beta_access_code) 
WHERE beta_access_code IS NOT NULL;

-- GIN indexes for arrays and JSONB (after tables exist)
CREATE INDEX IF NOT EXISTS idx_memories_themes 
ON memories USING GIN(wisdom_themes);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);

-- Oracle agents: users can only access their own agents
CREATE POLICY oracle_agents_own_data ON oracle_agents FOR ALL USING (
  user_id = auth.uid()
);

-- Memories: users can only access memories from their oracle agents
CREATE POLICY memories_own_data ON memories FOR ALL USING (
  oracle_agent_id IN (
    SELECT id FROM oracle_agents WHERE user_id = auth.uid()
  )
);

-- Conversation sessions: users can only access their own sessions
CREATE POLICY conversation_sessions_own_data ON conversation_sessions FOR ALL USING (
  oracle_agent_id IN (
    SELECT id FROM oracle_agents WHERE user_id = auth.uid()
  )
);

-- Journal entries: users can only access their own entries
CREATE POLICY journal_entries_own_data ON journal_entries FOR ALL USING (
  oracle_agent_id IN (
    SELECT id FROM oracle_agents WHERE user_id = auth.uid()
  )
);

-- Success message
SELECT 'Sacred Beta Users Indexes & Security Policies Applied Successfully! 🔒✨' as result;