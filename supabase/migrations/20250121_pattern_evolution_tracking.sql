-- Pattern Evolution Tracking for Maya Beta
-- Captures how protection patterns shift over time

-- Add columns to existing evolution_tracking table
ALTER TABLE evolution_tracking ADD COLUMN IF NOT EXISTS
  pattern_transitions JSONB DEFAULT '{}',
  breakthrough_precursors TEXT[] DEFAULT '{}',
  resistance_points JSONB DEFAULT '{}',
  session_quality_score FLOAT,
  depth_score FLOAT,
  coherence_score FLOAT,
  calibration_accuracy FLOAT;

-- Create index for pattern analysis
CREATE INDEX IF NOT EXISTS idx_pattern_transitions ON evolution_tracking
  USING gin (pattern_transitions);

-- Session quality metrics table
CREATE TABLE IF NOT EXISTS session_quality (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  explorer_id TEXT NOT NULL,
  session_number INT NOT NULL,

  -- Quality scores (0-1 scale)
  depth_score FLOAT CHECK (depth_score >= 0 AND depth_score <= 1),
  coherence_score FLOAT CHECK (coherence_score >= 0 AND coherence_score <= 1),
  calibration_accuracy FLOAT CHECK (calibration_accuracy >= 0 AND calibration_accuracy <= 1),

  -- Breakthrough tracking
  breakthrough_detected BOOLEAN DEFAULT FALSE,
  breakthrough_context TEXT,
  pre_breakthrough_themes TEXT[],

  -- Resistance tracking
  resistance_encountered BOOLEAN DEFAULT FALSE,
  resistance_type TEXT,
  resistance_intensity INT CHECK (resistance_intensity >= 1 AND resistance_intensity <= 5),

  -- Explorer feedback
  pulse_check_responses JSONB DEFAULT '{}',
  session_word TEXT,
  explorer_satisfaction INT CHECK (explorer_satisfaction >= 1 AND explorer_satisfaction <= 5),

  -- Escape hatch usage
  pause_count INT DEFAULT 0,
  topic_changes INT DEFAULT 0,
  intensity_adjustments INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern transition tracking table
CREATE TABLE IF NOT EXISTS pattern_transitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  explorer_id TEXT NOT NULL,
  conversation_id UUID REFERENCES conversations(id),

  from_pattern TEXT NOT NULL,
  to_pattern TEXT NOT NULL,
  transition_type TEXT, -- 'evolution', 'regression', 'lateral'

  trigger_context TEXT,
  transition_speed TEXT, -- 'sudden', 'gradual', 'oscillating'
  stability_score FLOAT,

  session_number INT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Dropout analysis table
CREATE TABLE IF NOT EXISTS dropout_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  explorer_id TEXT NOT NULL,

  last_conversation_id UUID REFERENCES conversations(id),
  dropout_point TEXT, -- 'after_vulnerability', 'during_exploration', 'post_breakthrough'
  dropout_context JSONB,

  -- Timing analysis
  time_of_day TIME,
  day_of_week INT,
  session_duration_before_dropout INT, -- minutes

  -- Topic analysis
  last_topic_discussed TEXT,
  emotional_tone_before_dropout TEXT,

  -- Return data (if they come back)
  returned BOOLEAN DEFAULT FALSE,
  return_date TIMESTAMPTZ,
  sessions_missed INT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time pulse check responses
CREATE TABLE IF NOT EXISTS pulse_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  explorer_id TEXT NOT NULL,

  check_type TEXT NOT NULL, -- 'landing', 'resonance', 'session_end'
  question TEXT NOT NULL,
  response TEXT NOT NULL,

  message_index INT, -- which message triggered this check
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create views for analytics dashboard

-- Pattern evolution view
CREATE OR REPLACE VIEW pattern_evolution_summary AS
SELECT
  explorer_id,
  from_pattern,
  to_pattern,
  COUNT(*) as transition_count,
  AVG(stability_score) as avg_stability,
  MODE() WITHIN GROUP (ORDER BY transition_type) as most_common_transition_type
FROM pattern_transitions
GROUP BY explorer_id, from_pattern, to_pattern;

-- Session quality trends
CREATE OR REPLACE VIEW session_quality_trends AS
SELECT
  explorer_id,
  DATE(created_at) as session_date,
  AVG(depth_score) as avg_depth,
  AVG(coherence_score) as avg_coherence,
  AVG(calibration_accuracy) as avg_calibration,
  SUM(CASE WHEN breakthrough_detected THEN 1 ELSE 0 END) as breakthroughs,
  SUM(CASE WHEN resistance_encountered THEN 1 ELSE 0 END) as resistances,
  AVG(explorer_satisfaction) as avg_satisfaction
FROM session_quality
GROUP BY explorer_id, DATE(created_at)
ORDER BY session_date;

-- Dropout risk indicators
CREATE OR REPLACE VIEW dropout_risk_indicators AS
SELECT
  e.explorer_id,
  COUNT(DISTINCT e.conversation_id) as total_sessions,
  MAX(e.created_at) as last_session,
  EXTRACT(DAY FROM NOW() - MAX(e.created_at)) as days_since_last_session,
  AVG(sq.explorer_satisfaction) as avg_satisfaction,
  SUM(sq.pause_count + sq.topic_changes + sq.intensity_adjustments) as total_escape_uses,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - MAX(e.created_at)) > 7 THEN 'high'
    WHEN EXTRACT(DAY FROM NOW() - MAX(e.created_at)) > 3 THEN 'medium'
    ELSE 'low'
  END as dropout_risk
FROM evolution_tracking e
LEFT JOIN session_quality sq ON e.conversation_id = sq.conversation_id
GROUP BY e.explorer_id;

-- Breakthrough precursor patterns
CREATE OR REPLACE VIEW breakthrough_patterns AS
SELECT
  unnest(pre_breakthrough_themes) as theme,
  COUNT(*) as occurrence_count,
  ARRAY_AGG(DISTINCT explorer_id) as explorers_affected
FROM session_quality
WHERE breakthrough_detected = TRUE
GROUP BY theme
ORDER BY occurrence_count DESC;

-- Create functions for pattern analysis

-- Function to detect pattern transitions
CREATE OR REPLACE FUNCTION detect_pattern_transition(
  p_explorer_id TEXT,
  p_conversation_id UUID,
  p_current_pattern TEXT,
  p_previous_pattern TEXT
) RETURNS VOID AS $$
DECLARE
  v_transition_type TEXT;
BEGIN
  -- Determine transition type
  IF p_current_pattern != p_previous_pattern THEN
    IF p_current_pattern IN ('vulnerability', 'authenticity', 'curiosity') THEN
      v_transition_type := 'evolution';
    ELSIF p_previous_pattern IN ('vulnerability', 'authenticity', 'curiosity') THEN
      v_transition_type := 'regression';
    ELSE
      v_transition_type := 'lateral';
    END IF;

    -- Record the transition
    INSERT INTO pattern_transitions (
      explorer_id,
      conversation_id,
      from_pattern,
      to_pattern,
      transition_type,
      transition_speed,
      timestamp
    ) VALUES (
      p_explorer_id,
      p_conversation_id,
      p_previous_pattern,
      p_current_pattern,
      v_transition_type,
      'gradual',
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate session quality score
CREATE OR REPLACE FUNCTION calculate_session_quality(
  p_conversation_id UUID
) RETURNS FLOAT AS $$
DECLARE
  v_depth_score FLOAT;
  v_coherence_score FLOAT;
  v_calibration_score FLOAT;
  v_quality_score FLOAT;
BEGIN
  -- Get individual scores from session_quality table
  SELECT
    COALESCE(depth_score, 0.5),
    COALESCE(coherence_score, 0.5),
    COALESCE(calibration_accuracy, 0.5)
  INTO v_depth_score, v_coherence_score, v_calibration_score
  FROM session_quality
  WHERE conversation_id = p_conversation_id;

  -- Calculate weighted average
  v_quality_score := (v_depth_score * 0.4 + v_coherence_score * 0.3 + v_calibration_score * 0.3);

  RETURN v_quality_score;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_quality_explorer ON session_quality(explorer_id);
CREATE INDEX IF NOT EXISTS idx_pattern_transitions_explorer ON pattern_transitions(explorer_id);
CREATE INDEX IF NOT EXISTS idx_dropout_analysis_explorer ON dropout_analysis(explorer_id);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_explorer ON pulse_checks(explorer_id);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_conversation ON pulse_checks(conversation_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;