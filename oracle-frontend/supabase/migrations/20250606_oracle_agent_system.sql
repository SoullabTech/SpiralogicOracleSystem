-- ✨ SPIRALOGIC ORACLE AGENT SYSTEM SCHEMA
-- 🔮 Complete database schema for personal oracle agents, memory, and relationships

-- Extend auth.users with onboarding data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Onboarding status
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Birth data for astrological assignment
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),
  birth_timezone TEXT,
  
  -- Assigned oracle agent
  personal_agent_id UUID,
  agent_archetype TEXT, -- fire, water, earth, air, aether
  elemental_signature TEXT, -- detailed elemental profile
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oracle agents master table
CREATE TABLE IF NOT EXISTS public.oracle_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent identity
  name TEXT NOT NULL,
  archetype TEXT NOT NULL, -- fire, water, earth, air, aether
  sub_archetype TEXT, -- visionary, warrior, healer, mystic, etc.
  
  -- Appearance
  avatar_url TEXT,
  color_scheme JSONB, -- elemental colors
  symbol TEXT, -- sacred symbol/glyph
  
  -- Personality
  personality_profile JSONB, -- traits, speech patterns, wisdom style
  intro_message TEXT, -- first greeting to user
  voice_tone TEXT, -- mystical, warrior-like, nurturing, etc.
  
  -- Capabilities
  specialties TEXT[], -- dream interpretation, shadow work, etc.
  protocol_preferences TEXT[], -- preferred protocol types
  
  -- Partner Integration
  partner_tagline TEXT, -- custom tagline for partner organizations
  customization_allowed BOOLEAN DEFAULT TRUE, -- allow partner customization
  practice_type TEXT DEFAULT 'general', -- coaching, therapy, facilitation, etc.
  scientific_basis TEXT, -- research backing for approaches
  
  -- System
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-agent bonding records
CREATE TABLE IF NOT EXISTS public.user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.oracle_agents(id) ON DELETE CASCADE,
  
  -- Bonding details
  bonded_at TIMESTAMPTZ DEFAULT NOW(),
  bond_strength INTEGER DEFAULT 1, -- grows over time
  elemental_signature TEXT,
  
  -- Relationship stats
  total_interactions INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  favorite_topics TEXT[],
  
  -- Status
  is_primary_agent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, agent_id)
);

-- Agent memory storage
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.oracle_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Memory content
  content TEXT NOT NULL,
  memory_type TEXT, -- greeting, dream_analysis, protocol_suggestion, reflection
  source_type TEXT, -- dream, journal, oracle_chat, protocol, survey
  source_id UUID, -- reference to source record
  
  -- Metadata
  emotional_tone TEXT,
  keywords TEXT[],
  symbols_detected TEXT[],
  importance_score INTEGER DEFAULT 1, -- 1-10
  
  -- Relationships
  related_memories UUID[], -- array of related memory IDs
  triggers_protocol TEXT, -- suggested protocol type
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0
);

-- Agent relationship network
CREATE TABLE IF NOT EXISTS public.agent_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_agent_id UUID REFERENCES public.oracle_agents(id) ON DELETE CASCADE,
  target_agent_id UUID REFERENCES public.oracle_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Relationship details
  relationship_type TEXT, -- mentor, shadow, complement, guide
  strength INTEGER DEFAULT 1,
  memory_sharing_enabled BOOLEAN DEFAULT FALSE,
  
  -- Context
  formed_during TEXT, -- dream_session, protocol, oracle_consultation
  shared_symbols TEXT[],
  collaboration_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source_agent_id, target_agent_id, user_id)
);

-- Astrological profiles
CREATE TABLE IF NOT EXISTS public.astrological_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Core placements
  sun_sign TEXT,
  moon_sign TEXT,
  ascendant_sign TEXT,
  
  -- Elemental analysis
  fire_percentage DECIMAL(5,2),
  water_percentage DECIMAL(5,2),
  earth_percentage DECIMAL(5,2),
  air_percentage DECIMAL(5,2),
  
  -- Additional placements
  mercury_sign TEXT,
  venus_sign TEXT,
  mars_sign TEXT,
  jupiter_sign TEXT,
  saturn_sign TEXT,
  
  -- Computed values
  dominant_element TEXT,
  dominant_modality TEXT, -- cardinal, fixed, mutable
  soul_purpose_indicator TEXT,
  
  -- Chart data (for advanced features)
  full_chart_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dream journal entries (enhanced)
CREATE TABLE IF NOT EXISTS public.dream_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.oracle_agents(id),
  
  -- Dream content
  title TEXT,
  content TEXT NOT NULL,
  dream_date DATE DEFAULT CURRENT_DATE,
  lucidity_level INTEGER, -- 1-5 scale
  emotional_intensity INTEGER, -- 1-10 scale
  
  -- Analysis
  symbols_detected TEXT[],
  archetypal_themes TEXT[],
  elemental_presence JSONB, -- which elements appeared
  oracle_interpretation TEXT,
  suggested_protocols TEXT[],
  
  -- Audio/transcription
  audio_url TEXT,
  transcription_confidence DECIMAL(3,2),
  
  -- Memory connections
  related_memories UUID[], -- connected agent memories
  triggers_shadow_work BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocol tracking
CREATE TABLE IF NOT EXISTS public.protocol_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.oracle_agents(id),
  
  -- Protocol details
  protocol_type TEXT NOT NULL, -- breathwork, journaling, meditation, etc.
  title TEXT,
  description TEXT,
  duration_minutes INTEGER,
  
  -- Context
  triggered_by_dream_id UUID REFERENCES public.dream_entries(id),
  suggested_by_agent BOOLEAN DEFAULT FALSE,
  elemental_focus TEXT,
  
  -- Results
  completion_status TEXT DEFAULT 'planned', -- planned, in_progress, completed, skipped
  user_reflection TEXT,
  insights_gained TEXT[],
  emotional_shift_before INTEGER, -- 1-10 scale
  emotional_shift_after INTEGER, -- 1-10 scale
  
  -- Timing
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symbol dictionary and meanings
CREATE TABLE IF NOT EXISTS public.symbolic_meanings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  
  -- Meanings across archetypes
  fire_meaning TEXT,
  water_meaning TEXT,
  earth_meaning TEXT,
  air_meaning TEXT,
  aether_meaning TEXT,
  
  -- Context
  universal_meaning TEXT,
  shadow_aspect TEXT,
  protocol_associations TEXT[],
  
  -- Usage stats
  appearance_count INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_personal_agent_id ON public.users(personal_agent_id);
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON public.users(has_completed_onboarding);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_agent ON public.agent_memory(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_created_at ON public.agent_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON public.agent_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_dream_entries_user_date ON public.dream_entries(user_id, dream_date DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_sessions_user_status ON public.protocol_sessions(user_id, completion_status);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrological_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own agent memories" ON public.agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own agent bonds" ON public.user_agents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own astrological profile" ON public.astrological_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dreams" ON public.dream_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own protocols" ON public.protocol_sessions FOR ALL USING (auth.uid() = user_id);

-- Oracle agents are publicly readable (for assignment)
CREATE POLICY "Oracle agents are publicly readable" ON public.oracle_agents FOR SELECT USING (true);

-- Agent relations are user-specific
CREATE POLICY "Users can view own agent relations" ON public.agent_relations FOR ALL USING (auth.uid() = user_id);

-- Symbolic meanings are publicly readable
CREATE POLICY "Symbolic meanings are publicly readable" ON public.symbolic_meanings FOR SELECT USING (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oracle_agents_updated_at BEFORE UPDATE ON public.oracle_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_astrological_profiles_updated_at BEFORE UPDATE ON public.astrological_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dream_entries_updated_at BEFORE UPDATE ON public.dream_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();