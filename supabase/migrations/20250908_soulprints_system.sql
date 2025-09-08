-- Soulprints System Migration
-- Tracks soul journey progression through 5 milestones with petal resonance scores

-- Main soulprints table
CREATE TABLE soulprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Petal interaction scores (Fire1, Water2, Earth3, etc.)
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Journey milestone tracking
  milestone TEXT NOT NULL CHECK (milestone IN ('first-bloom', 'pattern-keeper', 'depth-seeker', 'sacred-gardener', 'wisdom-keeper')),
  
  -- Sacred coherence calculation (0.0-1.0)
  coherence NUMERIC(4,3) NOT NULL CHECK (coherence >= 0 AND coherence <= 1),
  
  -- Elemental balance breakdown
  elemental_balance JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Session metadata
  session_duration INTEGER, -- milliseconds
  interaction_count INTEGER DEFAULT 0,
  total_activation NUMERIC(4,3), -- sum of all petal scores
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sacred journey tracking
  breakthrough_moments TEXT[], -- key insights during session
  shadow_elements TEXT[], -- elements needing integration
  
  -- Performance metadata
  device_info JSONB DEFAULT '{}'::jsonb,
  session_quality TEXT CHECK (session_quality IN ('low', 'medium', 'high'))
);

-- Milestone progression tracking
CREATE TABLE milestone_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Current milestone status
  current_milestone TEXT NOT NULL DEFAULT 'first-bloom',
  milestones_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Progress metrics
  total_sessions INTEGER DEFAULT 0,
  average_coherence NUMERIC(4,3) DEFAULT 0,
  highest_coherence NUMERIC(4,3) DEFAULT 0,
  
  -- Elemental mastery tracking
  elemental_mastery JSONB DEFAULT '{
    "fire": 0.0,
    "water": 0.0, 
    "earth": 0.0,
    "air": 0.0,
    "aether": 0.0
  }'::jsonb,
  
  -- Timeline
  first_session_at TIMESTAMPTZ,
  last_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sacred timeline for coherence visualization
CREATE TABLE coherence_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  soulprint_id UUID REFERENCES soulprints(id) ON DELETE CASCADE,
  
  -- Coherence snapshot
  coherence_value NUMERIC(4,3) NOT NULL,
  milestone TEXT NOT NULL,
  
  -- Context
  session_phase TEXT, -- 'opening', 'exploration', 'integration', 'completion'
  major_shifts BOOLEAN DEFAULT FALSE, -- significant coherence change
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_soulprints_user_milestone ON soulprints(user_id, milestone);
CREATE INDEX idx_soulprints_created_at ON soulprints(created_at DESC);
CREATE INDEX idx_soulprints_coherence ON soulprints(coherence DESC);

CREATE INDEX idx_milestone_progression_user ON milestone_progression(user_id);
CREATE INDEX idx_milestone_progression_current ON milestone_progression(current_milestone);

CREATE INDEX idx_coherence_timeline_user ON coherence_timeline(user_id);
CREATE INDEX idx_coherence_timeline_soulprint ON coherence_timeline(soulprint_id);
CREATE INDEX idx_coherence_timeline_recorded ON coherence_timeline(recorded_at DESC);

-- JSONB indexes for efficient querying
CREATE INDEX idx_soulprints_scores ON soulprints USING GIN(scores);
CREATE INDEX idx_soulprints_elemental_balance ON soulprints USING GIN(elemental_balance);
CREATE INDEX idx_milestone_elemental_mastery ON milestone_progression USING GIN(elemental_mastery);

-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_soulprints_updated_at 
    BEFORE UPDATE ON soulprints 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_progression_updated_at 
    BEFORE UPDATE ON milestone_progression 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- User progression management function
CREATE OR REPLACE FUNCTION update_milestone_progression(
  p_user_id UUID,
  p_milestone TEXT,
  p_coherence NUMERIC,
  p_elemental_balance JSONB
)
RETURNS VOID AS $$
DECLARE
  current_avg NUMERIC;
  current_high NUMERIC;
  session_count INTEGER;
BEGIN
  -- Insert or update milestone progression
  INSERT INTO milestone_progression (
    user_id, 
    current_milestone,
    total_sessions,
    average_coherence,
    highest_coherence,
    elemental_mastery,
    first_session_at,
    last_session_at
  )
  VALUES (
    p_user_id,
    p_milestone,
    1,
    p_coherence,
    p_coherence,
    p_elemental_balance,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_milestone = CASE 
      WHEN milestone_progression.current_milestone = 'wisdom-keeper' THEN milestone_progression.current_milestone
      ELSE p_milestone
    END,
    total_sessions = milestone_progression.total_sessions + 1,
    average_coherence = (
      (milestone_progression.average_coherence * milestone_progression.total_sessions + p_coherence) / 
      (milestone_progression.total_sessions + 1)
    ),
    highest_coherence = GREATEST(milestone_progression.highest_coherence, p_coherence),
    last_session_at = NOW(),
    updated_at = NOW();
    
  -- Mark milestone as completed if coherence threshold reached
  IF p_coherence >= 0.85 THEN
    UPDATE milestone_progression 
    SET milestones_completed = array_append(
      CASE WHEN p_milestone = ANY(milestones_completed) 
           THEN milestones_completed 
           ELSE milestones_completed 
      END,
      p_milestone
    )
    WHERE user_id = p_user_id 
    AND NOT (p_milestone = ANY(milestones_completed));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE soulprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE coherence_timeline ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sacred data
CREATE POLICY "Users can manage own soulprints" ON soulprints
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage own progression" ON milestone_progression
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage own coherence timeline" ON coherence_timeline
  FOR ALL USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate progression records
ALTER TABLE milestone_progression ADD CONSTRAINT unique_user_progression UNIQUE (user_id);

-- Comments for sacred context
COMMENT ON TABLE soulprints IS 'Sacred soul resonance captures from petal interactions';
COMMENT ON TABLE milestone_progression IS 'Tracks spiritual journey through 5 awakening milestones';
COMMENT ON TABLE coherence_timeline IS 'Timeline of coherence evolution for visualization';

COMMENT ON COLUMN soulprints.scores IS 'JSONB mapping of facet IDs to resonance scores (0.0-1.0)';
COMMENT ON COLUMN soulprints.coherence IS 'Overall session coherence calculated from elemental balance';
COMMENT ON COLUMN soulprints.milestone IS 'Current milestone: first-bloom → wisdom-keeper progression';