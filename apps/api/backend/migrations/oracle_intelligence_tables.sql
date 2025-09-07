-- Oracle Intelligence System Database Schema
-- Supports long-term memory, user profiles, and conversational continuity

-- User Profiles table for personalization
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  dominant_elements TEXT[] DEFAULT ARRAY['aether'],
  psychological_archetypes TEXT[] DEFAULT ARRAY['seeker'],
  spiritual_phase TEXT DEFAULT 'awakening',
  communication_style TEXT DEFAULT 'balanced',
  learning_preferences TEXT[] DEFAULT ARRAY['experiential', 'symbolic'],
  emotional_patterns JSONB DEFAULT '[]'::jsonb,
  growth_trajectory TEXT DEFAULT 'exploring',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table with elemental and symbolic tracking
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  element TEXT,
  source_agent TEXT,
  confidence FLOAT DEFAULT 0.5,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add vector embedding for semantic search
  embedding vector(1536),
  
  -- Indexes for performance
  INDEX idx_memories_user_id (user_id),
  INDEX idx_memories_element (element),
  INDEX idx_memories_timestamp (timestamp DESC)
);

-- Symbolic patterns table for tracking recurring themes
CREATE TABLE IF NOT EXISTS symbolic_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  first_appearance TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_appearance TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contexts TEXT[] DEFAULT ARRAY[]::TEXT[],
  meaning TEXT,
  significance FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on user-symbol combination
  UNIQUE(user_id, symbol),
  INDEX idx_patterns_user_id (user_id),
  INDEX idx_patterns_frequency (frequency DESC)
);

-- Conversations table for maintaining chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  element TEXT,
  confidence FLOAT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for retrieval
  INDEX idx_conversations_user_session (user_id, session_id),
  INDEX idx_conversations_created (created_at DESC)
);

-- Oracle sessions table for tracking continuous interactions
CREATE TABLE IF NOT EXISTS oracle_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  oracle_name TEXT DEFAULT 'Maya',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  elemental_balance JSONB DEFAULT '{"fire": 20, "water": 20, "earth": 20, "air": 20, "aether": 20}'::jsonb,
  session_insights JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_active (is_active)
);

-- Elemental interactions table for tracking agent responses
CREATE TABLE IF NOT EXISTS elemental_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT,
  element TEXT NOT NULL,
  input TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence FLOAT DEFAULT 0.5,
  symbols TEXT[] DEFAULT ARRAY[]::TEXT[],
  insights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_elemental_user (user_id),
  INDEX idx_elemental_element (element)
);

-- User achievements for gamification
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  category TEXT DEFAULT 'general',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id, achievement_id),
  INDEX idx_achievements_user (user_id)
);

-- Spiritual insights table for deep pattern recognition
CREATE TABLE IF NOT EXISTS spiritual_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  insight TEXT NOT NULL,
  recognized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  depth TEXT DEFAULT 'emerging' CHECK (depth IN ('surface', 'emerging', 'deep', 'integrated')),
  related_memories UUID[] DEFAULT ARRAY[]::UUID[],
  element TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_insights_user (user_id),
  INDEX idx_insights_depth (depth)
);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symbolic_patterns_updated_at BEFORE UPDATE ON symbolic_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_sessions_updated_at BEFORE UPDATE ON oracle_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vector similarity search function for memories
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  match_user_id TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  element TEXT,
  confidence FLOAT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.element,
    m.confidence,
    m.metadata,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to calculate elemental balance
CREATE OR REPLACE FUNCTION calculate_elemental_balance(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  balance JSONB;
  total_interactions INT;
  element_counts JSONB;
BEGIN
  -- Count interactions by element
  SELECT 
    jsonb_object_agg(element, count) AS counts,
    SUM(count)::INT AS total
  INTO element_counts, total_interactions
  FROM (
    SELECT element, COUNT(*) as count
    FROM elemental_interactions
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY element
  ) t;
  
  -- Calculate percentages
  IF total_interactions > 0 THEN
    balance := jsonb_build_object(
      'fire', COALESCE((element_counts->>'fire')::INT, 0) * 100 / total_interactions,
      'water', COALESCE((element_counts->>'water')::INT, 0) * 100 / total_interactions,
      'earth', COALESCE((element_counts->>'earth')::INT, 0) * 100 / total_interactions,
      'air', COALESCE((element_counts->>'air')::INT, 0) * 100 / total_interactions,
      'aether', COALESCE((element_counts->>'aether')::INT, 0) * 100 / total_interactions
    );
  ELSE
    -- Default balanced state
    balance := '{"fire": 20, "water": 20, "earth": 20, "air": 20, "aether": 20}'::jsonb;
  END IF;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Row-level security policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbolic_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elemental_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_insights ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth system)
CREATE POLICY "Users can view own data" ON user_profiles
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own memories" ON memories
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own patterns" ON symbolic_patterns
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own conversations" ON conversations
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own sessions" ON oracle_sessions
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own interactions" ON elemental_interactions
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR ALL USING (user_id = current_user);

CREATE POLICY "Users can view own insights" ON spiritual_insights
  FOR ALL USING (user_id = current_user);