-- Retreat Support Tables for Real-time Management

-- Daily Check-ins Table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  day_number INTEGER NOT NULL,
  
  -- Morning State
  morning_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { energyLevel, emotionalTone, bodyAwareness, sleepQuality, dreams, intentions }
  
  -- Elemental Balance
  elemental_balance JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { fire, water, earth, air, aether }
  
  -- Shadow Work
  shadow_work JSONB DEFAULT '{}'::jsonb,
  -- Structure: { patternsNoticed, triggersExperienced, breakthroughMoments, resistanceAreas }
  
  oracle_insights TEXT,
  gratitudes TEXT[],
  support_needed TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Sessions Table
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES retreat_sessions(id),
  session_type VARCHAR(50) NOT NULL,
  facilitator_id UUID,
  intention TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  participant_count INTEGER DEFAULT 0,
  energy_field JSONB DEFAULT '{}'::jsonb,
  wisdom_captured JSONB DEFAULT '[]'::jsonb,
  closing_insights TEXT,
  next_steps TEXT,
  summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Tracking Table
CREATE TABLE IF NOT EXISTS session_tracking (
  session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  tracking_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { participantStates, energyReadings, wisdomNuggets, breakthroughs }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id)
);

-- Session Participations Table
CREATE TABLE IF NOT EXISTS session_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  
  -- Engagement metrics
  engagement JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { presenceLevel, shareDepth, energyContribution, breakthroughs }
  
  -- Group resonance
  group_resonance JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { feltSupported, supportedOthers, groupCoherence, conflictsNoticed }
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collective Wisdom Table
CREATE TABLE IF NOT EXISTS collective_wisdom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES retreat_sessions(id),
  session_id UUID REFERENCES live_sessions(id),
  type VARCHAR(20) NOT NULL, -- insight, revelation, pattern, teaching, vision
  
  -- Content
  content JSONB NOT NULL,
  -- Structure: { essence, elaboration, contributors, element, tags }
  
  -- Resonance metrics
  resonance JSONB NOT NULL,
  -- Structure: { immediateImpact, depthLevel, shareability }
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant States Table (for group dynamics)
CREATE TABLE IF NOT EXISTS participant_states (
  retreat_id UUID REFERENCES retreat_sessions(id),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  state_data JSONB NOT NULL,
  -- Structure: { name, element, currentEnergy, emotionalTone, contribution, needsSupport }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (retreat_id, participant_id)
);

-- Group Dynamics Table
CREATE TABLE IF NOT EXISTS group_dynamics (
  retreat_id UUID REFERENCES retreat_sessions(id),
  dynamics_data JSONB NOT NULL,
  -- Structure: { elementalBalance, energyField, coherenceMap, collectivePatterns, recommendations }
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (retreat_id)
);

-- Session Dynamics Table
CREATE TABLE IF NOT EXISTS session_dynamics (
  session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  field_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id)
);

-- Participant Interactions Table (for coherence mapping)
CREATE TABLE IF NOT EXISTS participant_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES retreat_sessions(id),
  participant1_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10),
  type VARCHAR(20) DEFAULT 'neutral', -- supportive, challenging, neutral
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(retreat_id, participant1_id, participant2_id)
);

-- Support Requests Table
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  issue TEXT NOT NULL,
  urgency_level VARCHAR(20) NOT NULL, -- low, medium, high, urgent
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Support Flags Table
CREATE TABLE IF NOT EXISTS support_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  support_needed TEXT NOT NULL,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, addressed, monitoring
  addressed_by UUID,
  addressed_at TIMESTAMP WITH TIME ZONE
);

-- Facilitator Alerts Table
CREATE TABLE IF NOT EXISTS facilitator_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Participant Notifications Table
CREATE TABLE IF NOT EXISTS participant_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Integration Tracking Table
CREATE TABLE IF NOT EXISTS integration_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES retreat_participants(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES retreat_sessions(id),
  insights JSONB NOT NULL,
  commitments JSONB NOT NULL,
  practices_adopted JSONB NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  follow_up_completed BOOLEAN DEFAULT FALSE
);

-- Retreat Facilitators Table
CREATE TABLE IF NOT EXISTS retreat_facilitators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES retreat_sessions(id),
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  bio TEXT,
  specialties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_checkins_participant ON daily_checkins(participant_id);
CREATE INDEX idx_daily_checkins_retreat ON daily_checkins(retreat_id);
CREATE INDEX idx_daily_checkins_day ON daily_checkins(day_number);
CREATE INDEX idx_live_sessions_retreat ON live_sessions(retreat_id);
CREATE INDEX idx_session_participations_session ON session_participations(session_id);
CREATE INDEX idx_session_participations_participant ON session_participations(participant_id);
CREATE INDEX idx_collective_wisdom_retreat ON collective_wisdom(retreat_id);
CREATE INDEX idx_collective_wisdom_type ON collective_wisdom(type);
CREATE INDEX idx_support_requests_retreat ON support_requests(retreat_id);
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_participant_notifications_participant ON participant_notifications(participant_id);
CREATE INDEX idx_participant_notifications_read ON participant_notifications(read);

-- Functions and Triggers

-- Function to update participant count in live sessions
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE live_sessions
  SET participant_count = (
    SELECT COUNT(DISTINCT participant_id)
    FROM session_participations
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_count_trigger
AFTER INSERT OR DELETE ON session_participations
FOR EACH ROW
EXECUTE FUNCTION update_session_participant_count();

-- Function to create support flag when check-in indicates need
CREATE OR REPLACE FUNCTION check_support_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.support_needed IS NOT NULL OR (NEW.morning_state->>'energyLevel')::INTEGER < 4 THEN
    INSERT INTO support_flags (participant_id, support_needed, flagged_at)
    VALUES (
      NEW.participant_id,
      COALESCE(NEW.support_needed, 'Low energy detected - check-in recommended'),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_support_trigger
AFTER INSERT ON daily_checkins
FOR EACH ROW
EXECUTE FUNCTION check_support_needed();

-- Function to alert facilitators on urgent support
CREATE OR REPLACE FUNCTION alert_on_urgent_support()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.urgency_level IN ('high', 'urgent') THEN
    INSERT INTO facilitator_alerts (facilitator_id, type, content, severity)
    SELECT 
      f.user_id,
      'urgent_support',
      jsonb_build_object(
        'support_request_id', NEW.id,
        'participant_id', NEW.participant_id,
        'issue', NEW.issue,
        'urgency', NEW.urgency_level
      ),
      CASE 
        WHEN NEW.urgency_level = 'urgent' THEN 'high'
        ELSE 'medium'
      END
    FROM retreat_facilitators f
    WHERE f.retreat_id = NEW.retreat_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER urgent_support_alert_trigger
AFTER INSERT ON support_requests
FOR EACH ROW
EXECUTE FUNCTION alert_on_urgent_support();

-- Update triggers for timestamps
CREATE TRIGGER update_participant_interactions_updated_at 
BEFORE UPDATE ON participant_interactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_tracking_updated_at 
BEFORE UPDATE ON session_tracking
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participant_states_updated_at 
BEFORE UPDATE ON participant_states
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_dynamics_updated_at 
BEFORE UPDATE ON session_dynamics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO retreat_facilitators (retreat_id, name, role, specialties)
SELECT 
  id,
  'Kelly Flanagan',
  'Lead Facilitator & Founder',
  ARRAY['Spiralogic Process', 'Shadow Work', 'Elemental Integration']
FROM retreat_sessions
WHERE name LIKE '%Switzerland%'
LIMIT 1;