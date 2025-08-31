-- SpiralogicOracleSystem Production Database Schema
-- Complete schema for deployment readiness

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Core memory system
CREATE TABLE IF NOT EXISTS soul_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('oracle_exchange', 'journal_entry', 'ritual_moment', 'breakthrough', 'shadow_work', 'voice_journal', 'semantic_pattern')),
  content TEXT NOT NULL,
  element TEXT CHECK (element IN ('fire', 'water', 'earth', 'air', 'aether')),
  emotional_tone TEXT,
  shadow_content BOOLEAN DEFAULT FALSE,
  transformation_marker BOOLEAN DEFAULT FALSE,
  sacred_moment BOOLEAN DEFAULT FALSE,
  spiral_phase TEXT,
  ritual_context TEXT,
  oracle_response TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for soul_memories
CREATE INDEX IF NOT EXISTS idx_soul_memories_user_id ON soul_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_soul_memories_type ON soul_memories(type);
CREATE INDEX IF NOT EXISTS idx_soul_memories_timestamp ON soul_memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_soul_memories_sacred ON soul_memories(sacred_moment) WHERE sacred_moment = TRUE;
CREATE INDEX IF NOT EXISTS idx_soul_memories_transformation ON soul_memories(transformation_marker) WHERE transformation_marker = TRUE;
CREATE INDEX IF NOT EXISTS idx_soul_memories_element ON soul_memories(element);

-- Safety and moderation system
CREATE TABLE IF NOT EXISTS safety_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  input_safety JSONB NOT NULL,
  emotional_state JSONB NOT NULL,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_metrics_user_id ON safety_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_metrics_timestamp ON safety_metrics(timestamp);

-- Semantic pattern analysis
CREATE TABLE IF NOT EXISTS semantic_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('recurring_theme', 'archetypal_emergence', 'transformation_arc', 'shadow_integration', 'spiritual_progression')),
  pattern_content TEXT NOT NULL,
  confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  memories_involved TEXT[] DEFAULT '{}',
  insights TEXT[] DEFAULT '{}',
  suggested_explorations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_semantic_patterns_user_id ON semantic_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_patterns_type ON semantic_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_semantic_patterns_confidence ON semantic_patterns(confidence_score);

-- Archetypal constellation mapping
CREATE TABLE IF NOT EXISTS archetypal_constellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  primary_archetype TEXT NOT NULL,
  secondary_archetypes TEXT[] DEFAULT '{}',
  constellation_description TEXT NOT NULL,
  evolutionary_stage TEXT NOT NULL,
  integration_challenges TEXT[] DEFAULT '{}',
  growth_opportunities TEXT[] DEFAULT '{}',
  supporting_memories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archetypal_constellations_user_id ON archetypal_constellations(user_id);
CREATE INDEX IF NOT EXISTS idx_archetypal_constellations_primary ON archetypal_constellations(primary_archetype);

-- Memory threads for journey tracking
CREATE TABLE IF NOT EXISTS memory_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thread_name TEXT NOT NULL,
  thread_type TEXT NOT NULL CHECK (thread_type IN ('ritual', 'shadow_work', 'transformation', 'integration')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  memories TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_threads_user_id ON memory_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_threads_status ON memory_threads(status);
CREATE INDEX IF NOT EXISTS idx_memory_threads_type ON memory_threads(thread_type);

-- Journey insights and predictions
CREATE TABLE IF NOT EXISTS journey_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('breakthrough_prediction', 'pattern_completion', 'integration_opportunity', 'shadow_emergence', 'spiritual_milestone')),
  insight_content TEXT NOT NULL,
  confidence_level FLOAT NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  supporting_memories TEXT[] DEFAULT '{}',
  actionable_suggestions TEXT[] DEFAULT '{}',
  spiritual_context TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journey_insights_user_id ON journey_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_insights_type ON journey_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_journey_insights_status ON journey_insights(status);

-- Voice journaling metadata
CREATE TABLE IF NOT EXISTS voice_journal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  memory_id UUID REFERENCES soul_memories(id) ON DELETE CASCADE,
  original_filename TEXT,
  transcription_confidence FLOAT,
  audio_duration INTEGER, -- in seconds
  language_detected TEXT DEFAULT 'en',
  workflow_suggestion JSONB,
  audio_archived BOOLEAN DEFAULT FALSE,
  archive_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON voice_journal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_memory_id ON voice_journal_sessions(memory_id);

-- Sacred workflow orchestration
CREATE TABLE IF NOT EXISTS sacred_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  journey_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  current_step_index INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}',
  step_history JSONB DEFAULT '[]',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_journeys_user_id ON sacred_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_journeys_workflow_id ON sacred_journeys(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sacred_journeys_status ON sacred_journeys(status);

-- User profiles for Oracle system
CREATE TABLE IF NOT EXISTS oracle_user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  oracle_name TEXT DEFAULT 'Sacred Mirror',
  elemental_resonance TEXT DEFAULT 'aether' CHECK (elemental_resonance IN ('fire', 'water', 'earth', 'air', 'aether')),
  voice_preferences JSONB DEFAULT '{}',
  personalization_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oracle_profiles_user_id ON oracle_user_profiles(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE soul_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetypal_constellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_journal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user data isolation
CREATE POLICY "Users can only access their own soul memories" ON soul_memories
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own safety metrics" ON safety_metrics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own semantic patterns" ON semantic_patterns
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own archetypal constellations" ON archetypal_constellations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own memory threads" ON memory_threads
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own journey insights" ON journey_insights
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own voice sessions" ON voice_journal_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own sacred journeys" ON sacred_journeys
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own oracle profile" ON oracle_user_profiles
  FOR ALL USING (user_id = auth.uid());

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updated_at automation
CREATE TRIGGER update_soul_memories_updated_at BEFORE UPDATE ON soul_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_semantic_patterns_updated_at BEFORE UPDATE ON semantic_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archetypal_constellations_updated_at BEFORE UPDATE ON archetypal_constellations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_threads_updated_at BEFORE UPDATE ON memory_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journey_insights_updated_at BEFORE UPDATE ON journey_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sacred_journeys_updated_at BEFORE UPDATE ON sacred_journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oracle_profiles_updated_at BEFORE UPDATE ON oracle_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust based on your authentication setup)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;