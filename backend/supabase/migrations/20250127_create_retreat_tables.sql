-- Switzerland Retreat Onboarding Database Schema

-- Retreat Sessions Table
CREATE TABLE IF NOT EXISTS retreat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(100) DEFAULT 'switzerland',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 20,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, active, completed
  theme TEXT,
  description TEXT,
  guiding_questions JSONB DEFAULT '[]'::jsonb,
  daily_schedule JSONB DEFAULT '[]'::jsonb,
  facilitators JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat Participants Table
CREATE TABLE IF NOT EXISTS retreat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  
  -- Onboarding Status
  onboarding_status VARCHAR(50) DEFAULT 'registered', -- registered, welcomed, oracle_assigned, intentions_set, completed
  welcomed_at TIMESTAMP WITH TIME ZONE,
  oracle_assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Personal Oracle Assignment
  personal_oracle_id UUID,
  oracle_element VARCHAR(20),
  oracle_archetype VARCHAR(100),
  
  -- Current State
  current_state JSONB,
  
  -- Retreat Intentions
  retreat_intentions JSONB,
  
  -- Elemental Profile
  elemental_profile JSONB,
  
  -- Retreat Details
  retreat_id UUID REFERENCES retreat_sessions(id),
  arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  accommodation_type VARCHAR(100),
  dietary_restrictions TEXT[],
  special_needs TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE
);

-- Onboarding Flows Table
CREATE TABLE IF NOT EXISTS onboarding_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  current_step VARCHAR(50) NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Step Data
  welcome_data JSONB,
  oracle_assignment JSONB,
  intention_data JSONB
);

-- Personal Oracles Table
CREATE TABLE IF NOT EXISTS personal_oracles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  element VARCHAR(20) NOT NULL,
  archetype VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction_at TIMESTAMP WITH TIME ZONE
);

-- Retreat Messages Table
CREATE TABLE IF NOT EXISTS retreat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- founder_welcome, intention_reflection, oracle_introduction, daily_guidance, etc.
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Retreat Oracle Sessions Table
CREATE TABLE IF NOT EXISTS retreat_oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  oracle_id UUID REFERENCES personal_oracles(id),
  session_type VARCHAR(50), -- daily_guidance, integration_support, vision_quest, etc.
  messages JSONB DEFAULT '[]'::jsonb,
  insights JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER
);

-- Indexes for performance
CREATE INDEX idx_retreat_participants_email ON retreat_participants(email);
CREATE INDEX idx_retreat_participants_retreat_id ON retreat_participants(retreat_id);
CREATE INDEX idx_retreat_participants_onboarding_status ON retreat_participants(onboarding_status);
CREATE INDEX idx_retreat_messages_participant_id ON retreat_messages(participant_id);
CREATE INDEX idx_retreat_messages_type ON retreat_messages(type);
CREATE INDEX idx_retreat_oracle_sessions_participant_id ON retreat_oracle_sessions(participant_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_retreat_sessions_updated_at BEFORE UPDATE ON retreat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retreat_participants_updated_at BEFORE UPDATE ON retreat_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_flows_updated_at BEFORE UPDATE ON onboarding_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample retreat session
INSERT INTO retreat_sessions (
  name,
  location,
  start_date,
  end_date,
  max_participants,
  theme,
  description,
  guiding_questions
) VALUES (
  'Switzerland Spring Awakening 2024',
  'switzerland',
  '2024-05-15 14:00:00+00',
  '2024-05-20 11:00:00+00',
  20,
  'Elemental Integration & Soul Evolution',
  'Join us in the sacred Swiss Alps for a transformative journey through the elements, guided by the Spiralogic Process and your Personal Oracle.',
  '[
    "What is ready to transform in your life?",
    "How can you embody your elemental nature more fully?",
    "What wants to emerge through you in service to the collective?"
  ]'::jsonb
);