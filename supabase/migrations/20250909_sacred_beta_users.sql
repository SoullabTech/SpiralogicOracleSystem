-- Sacred Beta Users & Oracle Agents Schema
-- Migration: 20250909_sacred_beta_users

-- Users table for authentication and basic profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  sacred_name TEXT,
  oauth_provider TEXT,
  oauth_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Beta tracking
  beta_access_code TEXT,
  beta_onboarded_at TIMESTAMP WITH TIME ZONE,
  user_intention TEXT,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_oauth CHECK ((oauth_provider IS NULL) = (oauth_id IS NULL))
);

-- Oracle Agents table - personal AI guides
CREATE TABLE IF NOT EXISTS oracle_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Maya',
  archetype TEXT DEFAULT 'sacred_guide',
  
  -- Personality configuration
  personality_config JSONB DEFAULT '{
    "voice_style": "contemplative",
    "wisdom_tradition": "universal",
    "communication_depth": "soul_level",
    "memory_integration": "holistic"
  }'::jsonb,
  
  -- Evolution tracking
  conversations_count INTEGER DEFAULT 0,
  wisdom_level INTEGER DEFAULT 1,
  last_conversation_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one agent per user initially
  UNIQUE(user_id)
);

-- Memories table - all forms of sacred remembrance
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_agent_id UUID NOT NULL REFERENCES oracle_agents(id) ON DELETE CASCADE,
  
  -- Memory content
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'conversation',
  source_type TEXT DEFAULT 'voice', -- 'voice', 'text', 'ritual', 'dream', 'reflection'
  
  -- Semantic metadata
  emotional_tone TEXT,
  wisdom_themes TEXT[], -- Array of themes like 'transformation', 'healing', 'purpose'
  elemental_resonance TEXT, -- 'earth', 'water', 'fire', 'air'
  
  -- Memory linking
  session_id UUID,
  parent_memory_id UUID REFERENCES memories(id),
  
  -- Vector embedding for semantic search (when implemented)
  embedding VECTOR(1536), -- OpenAI embedding dimension
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CHECK (memory_type IN ('conversation', 'ritual', 'dream', 'reflection', 'insight', 'question')),
  CHECK (source_type IN ('voice', 'text', 'ritual', 'dream', 'journal'))
);

-- Conversation sessions for grouping related exchanges
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_agent_id UUID NOT NULL REFERENCES oracle_agents(id) ON DELETE CASCADE,
  
  -- Session metadata
  title TEXT,
  session_type TEXT DEFAULT 'dialogue',
  ritual_context TEXT, -- Which ritual/practice was this part of
  
  -- Session flow
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_exchanges INTEGER DEFAULT 0,
  
  -- Session outcomes
  insights_gained TEXT[],
  next_exploration TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sacred journal entries for deeper reflection
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_agent_id UUID NOT NULL REFERENCES oracle_agents(id) ON DELETE CASCADE,
  
  -- Entry content
  title TEXT,
  content TEXT NOT NULL,
  entry_type TEXT DEFAULT 'reflection',
  
  -- Ritual/practice connection
  ritual_practice TEXT,
  elemental_focus TEXT,
  
  -- Privacy and sharing
  is_private BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (entry_type IN ('reflection', 'dream', 'ritual_outcome', 'insight', 'question', 'gratitude'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_beta_access ON users(beta_access_code) WHERE beta_access_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_oracle_agents_user ON oracle_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_agents_last_conversation ON oracle_agents(last_conversation_at);

CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_themes ON memories USING GIN(wisdom_themes);

CREATE INDEX IF NOT EXISTS idx_conversation_sessions_agent ON conversation_sessions(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_started ON conversation_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_agent ON journal_entries(oracle_agent_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON journal_entries(created_at DESC);

-- RLS (Row Level Security) policies for data protection
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

-- Trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_oracle_agents_updated_at
  BEFORE UPDATE ON oracle_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();