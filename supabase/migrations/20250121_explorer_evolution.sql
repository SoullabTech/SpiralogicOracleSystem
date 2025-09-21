-- Explorer Evolution Tracking
-- Captures the Universal Arc™ progression for each explorer

CREATE TABLE IF NOT EXISTS explorer_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  explorer_name TEXT NOT NULL,

  -- Universal Arc™ Level (1.0 - 5.0)
  arc_level FLOAT DEFAULT 1.0 CHECK (arc_level >= 1.0 AND arc_level <= 5.0),
  arc_phase TEXT DEFAULT 'Safety Building',

  -- Phase progression
  safety_established BOOLEAN DEFAULT FALSE,
  safety_established_at TIMESTAMPTZ,

  awareness_reached BOOLEAN DEFAULT FALSE,
  awareness_reached_at TIMESTAMPTZ,

  exploration_entered BOOLEAN DEFAULT FALSE,
  exploration_entered_at TIMESTAMPTZ,

  breakthrough_achieved BOOLEAN DEFAULT FALSE,
  breakthrough_achieved_at TIMESTAMPTZ,

  integration_begun BOOLEAN DEFAULT FALSE,
  integration_begun_at TIMESTAMPTZ,

  -- Pattern evolution tracking
  initial_patterns TEXT[] DEFAULT '{}',
  current_patterns TEXT[] DEFAULT '{}',
  evolved_patterns TEXT[] DEFAULT '{}',
  pattern_shift_count INT DEFAULT 0,

  -- Threshold markers
  threshold_moments INT DEFAULT 0,
  last_threshold_at TIMESTAMPTZ,
  threshold_contexts TEXT[] DEFAULT '{}',

  -- Engagement metrics
  total_sessions INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  avg_session_depth FLOAT DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  days_active INT DEFAULT 0,

  -- Quality indicators
  reflection_completion_rate FLOAT DEFAULT 0,
  pulse_check_positivity FLOAT DEFAULT 0,
  escape_hatch_usage INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(explorer_id)
);

-- Pattern evolution view
CREATE OR REPLACE VIEW pattern_evolution AS
SELECT
  ee.explorer_id,
  ee.explorer_name,
  ee.arc_level,
  ee.arc_phase,

  -- Pattern transition analysis
  ee.initial_patterns,
  ee.current_patterns,
  ee.evolved_patterns,
  ee.pattern_shift_count,

  -- Calculate pattern evolution percentage
  CASE
    WHEN array_length(ee.initial_patterns, 1) > 0
    THEN (array_length(ee.evolved_patterns, 1)::FLOAT / array_length(ee.initial_patterns, 1)) * 100
    ELSE 0
  END as evolution_percentage,

  -- Time-based progression
  EXTRACT(DAY FROM NOW() - ee.created_at) as days_in_beta,
  ee.days_active,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - ee.created_at) > 0
    THEN (ee.days_active::FLOAT / EXTRACT(DAY FROM NOW() - ee.created_at)) * 100
    ELSE 0
  END as engagement_rate,

  -- Quality metrics
  ee.avg_session_depth,
  ee.reflection_completion_rate,
  ee.pulse_check_positivity,

  -- Risk indicators
  CASE
    WHEN ee.last_session_at < NOW() - INTERVAL '7 days' THEN 'high'
    WHEN ee.last_session_at < NOW() - INTERVAL '3 days' THEN 'medium'
    ELSE 'low'
  END as dropout_risk,

  ee.escape_hatch_usage as safety_needs_indicator

FROM explorer_evolution ee
ORDER BY ee.arc_level DESC, ee.days_active DESC;

-- Arc progression summary view
CREATE OR REPLACE VIEW arc_progression_summary AS
SELECT
  arc_phase,
  COUNT(*) as explorers_in_phase,
  AVG(arc_level) as avg_level,
  AVG(total_sessions) as avg_sessions,
  AVG(pattern_shift_count) as avg_pattern_shifts,
  AVG(threshold_moments) as avg_thresholds,
  AVG(reflection_completion_rate) as avg_reflection_rate
FROM explorer_evolution
GROUP BY arc_phase
ORDER BY
  CASE arc_phase
    WHEN 'Safety Building' THEN 1
    WHEN 'Pattern Awareness' THEN 2
    WHEN 'Deep Exploration' THEN 3
    WHEN 'Breakthrough Territory' THEN 4
    WHEN 'Integration Phase' THEN 5
  END;

-- Function to update arc level based on activity
CREATE OR REPLACE FUNCTION update_arc_level(
  p_explorer_id TEXT
) RETURNS FLOAT AS $$
DECLARE
  v_arc_level FLOAT;
  v_base_level FLOAT;
  v_breakthrough_bonus FLOAT;
  v_engagement_bonus FLOAT;
  v_reflection_bonus FLOAT;
  v_evolution RECORD;
BEGIN
  -- Get current evolution state
  SELECT * INTO v_evolution
  FROM explorer_evolution
  WHERE explorer_id = p_explorer_id;

  IF NOT FOUND THEN
    RETURN 1.0;
  END IF;

  -- Calculate base level from sessions
  v_base_level := LEAST(v_evolution.total_sessions * 0.2, 2.0);

  -- Add breakthrough bonus
  v_breakthrough_bonus := v_evolution.threshold_moments * 0.3;

  -- Add engagement bonus based on consistency
  v_engagement_bonus := v_evolution.engagement_rate * 0.02;

  -- Add reflection completion bonus
  v_reflection_bonus := v_evolution.reflection_completion_rate * 0.5;

  -- Calculate total arc level
  v_arc_level := LEAST(
    v_base_level + v_breakthrough_bonus + v_engagement_bonus + v_reflection_bonus,
    5.0
  );

  -- Update the arc level and phase
  UPDATE explorer_evolution
  SET
    arc_level = v_arc_level,
    arc_phase = CASE
      WHEN v_arc_level < 1.5 THEN 'Safety Building'
      WHEN v_arc_level < 2.5 THEN 'Pattern Awareness'
      WHEN v_arc_level < 3.5 THEN 'Deep Exploration'
      WHEN v_arc_level < 4.5 THEN 'Breakthrough Territory'
      ELSE 'Integration Phase'
    END,
    updated_at = NOW()
  WHERE explorer_id = p_explorer_id;

  -- Mark phase transitions
  IF v_arc_level >= 1.5 AND NOT v_evolution.safety_established THEN
    UPDATE explorer_evolution
    SET safety_established = TRUE, safety_established_at = NOW()
    WHERE explorer_id = p_explorer_id;
  END IF;

  IF v_arc_level >= 2.0 AND NOT v_evolution.awareness_reached THEN
    UPDATE explorer_evolution
    SET awareness_reached = TRUE, awareness_reached_at = NOW()
    WHERE explorer_id = p_explorer_id;
  END IF;

  IF v_arc_level >= 3.0 AND NOT v_evolution.exploration_entered THEN
    UPDATE explorer_evolution
    SET exploration_entered = TRUE, exploration_entered_at = NOW()
    WHERE explorer_id = p_explorer_id;
  END IF;

  IF v_arc_level >= 4.0 AND NOT v_evolution.breakthrough_achieved THEN
    UPDATE explorer_evolution
    SET breakthrough_achieved = TRUE, breakthrough_achieved_at = NOW()
    WHERE explorer_id = p_explorer_id;
  END IF;

  IF v_arc_level >= 4.5 AND NOT v_evolution.integration_begun THEN
    UPDATE explorer_evolution
    SET integration_begun = TRUE, integration_begun_at = NOW()
    WHERE explorer_id = p_explorer_id;
  END IF;

  RETURN v_arc_level;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update arc level after session
CREATE OR REPLACE FUNCTION trigger_update_arc_after_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session count and last session
  UPDATE explorer_evolution
  SET
    total_sessions = total_sessions + 1,
    last_session_at = NOW(),
    days_active = days_active + 1
  WHERE explorer_id = NEW.explorer_id;

  -- Recalculate arc level
  PERFORM update_arc_level(NEW.explorer_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_arc_after_session
AFTER INSERT ON maya_sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_arc_after_session();

-- Initialize explorer evolution on signup
CREATE OR REPLACE FUNCTION initialize_explorer_evolution(
  p_explorer_id TEXT,
  p_explorer_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO explorer_evolution (
    explorer_id,
    explorer_name,
    arc_level,
    arc_phase,
    created_at
  ) VALUES (
    p_explorer_id,
    p_explorer_name,
    1.0,
    'Safety Building',
    NOW()
  )
  ON CONFLICT (explorer_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;