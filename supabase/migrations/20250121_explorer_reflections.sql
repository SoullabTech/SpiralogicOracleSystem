-- Explorer Reflections Table
-- Stores weekly reflection responses tied to operational principles

CREATE TABLE IF NOT EXISTS explorer_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,  -- References betaUserId from session
  explorer_name TEXT NOT NULL,
  week INT NOT NULL CHECK (week >= 1 AND week <= 4),

  -- Individual reflection storage for analytics
  question TEXT NOT NULL,
  response TEXT,
  principle TEXT NOT NULL,  -- The operational principle this maps to
  principle_tag TEXT NOT NULL,  -- Searchable tag for analytics

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one response per question per week per explorer
  UNIQUE(explorer_id, week, principle_tag)
);

-- Index for fast lookups
CREATE INDEX idx_reflections_explorer ON explorer_reflections(explorer_id, week);
CREATE INDEX idx_reflections_principle ON explorer_reflections(principle_tag);
CREATE INDEX idx_reflections_created ON explorer_reflections(created_at DESC);

-- Aggregated weekly reflection summary
CREATE TABLE IF NOT EXISTS weekly_reflection_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  explorer_name TEXT NOT NULL,
  week INT NOT NULL CHECK (week >= 1 AND week <= 4),

  -- All responses for the week
  prompt_responses JSONB NOT NULL DEFAULT '{}',

  -- Additional fields
  free_journal TEXT,
  self_marker TEXT CHECK (self_marker IN ('Grounded', 'Protective', 'Insightful', 'Breakthrough', 'Overwhelming')),

  -- Tracking
  responses_count INT DEFAULT 0,
  completion_percentage FLOAT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(explorer_id, week)
);

-- View for principle-based analytics
CREATE OR REPLACE VIEW reflection_principle_analysis AS
SELECT
  principle_tag,
  principle,
  week,
  COUNT(DISTINCT explorer_id) as explorers_responded,
  COUNT(*) as total_responses,
  AVG(LENGTH(response)) as avg_response_length,
  ARRAY_AGG(DISTINCT
    CASE
      WHEN LENGTH(response) > 200 THEN 'deep'
      WHEN LENGTH(response) > 100 THEN 'moderate'
      ELSE 'brief'
    END
  ) as engagement_levels
FROM explorer_reflections
WHERE response IS NOT NULL AND response != ''
GROUP BY principle_tag, principle, week
ORDER BY week, principle_tag;

-- View for explorer journey progression
CREATE OR REPLACE VIEW explorer_journey_progression AS
SELECT
  er.explorer_id,
  er.explorer_name,
  er.week,
  COUNT(DISTINCT er.principle_tag) as principles_reflected,
  AVG(LENGTH(er.response)) as avg_reflection_depth,
  wrs.self_marker,
  wrs.completion_percentage,
  CASE
    WHEN er.week = 1 THEN 'Orientation'
    WHEN er.week = 2 THEN 'Pattern Recognition'
    WHEN er.week = 3 THEN 'Deeper Exploration'
    WHEN er.week = 4 THEN 'Integration'
  END as phase
FROM explorer_reflections er
LEFT JOIN weekly_reflection_summary wrs
  ON er.explorer_id = wrs.explorer_id AND er.week = wrs.week
GROUP BY er.explorer_id, er.explorer_name, er.week, wrs.self_marker, wrs.completion_percentage
ORDER BY er.explorer_id, er.week;

-- Function to calculate reflection insights
CREATE OR REPLACE FUNCTION get_reflection_insights(p_explorer_id TEXT)
RETURNS TABLE(
  insight_type TEXT,
  insight_value TEXT
) AS $$
BEGIN
  RETURN QUERY

  -- Most engaged principle
  SELECT
    'most_engaged_principle'::TEXT,
    principle_tag::TEXT
  FROM explorer_reflections
  WHERE explorer_id = p_explorer_id
    AND response IS NOT NULL
  GROUP BY principle_tag
  ORDER BY SUM(LENGTH(response)) DESC
  LIMIT 1

  UNION ALL

  -- Depth progression
  SELECT
    'depth_progression'::TEXT,
    CASE
      WHEN AVG(LENGTH(response)) > prev_avg THEN 'deepening'
      WHEN AVG(LENGTH(response)) < prev_avg THEN 'lightening'
      ELSE 'stable'
    END::TEXT
  FROM (
    SELECT
      week,
      AVG(LENGTH(response)) as avg_length,
      LAG(AVG(LENGTH(response))) OVER (ORDER BY week) as prev_avg
    FROM explorer_reflections
    WHERE explorer_id = p_explorer_id
      AND response IS NOT NULL
    GROUP BY week
    ORDER BY week DESC
    LIMIT 1
  ) depth_calc

  UNION ALL

  -- Breakthrough week
  SELECT
    'breakthrough_week'::TEXT,
    week::TEXT
  FROM weekly_reflection_summary
  WHERE explorer_id = p_explorer_id
    AND self_marker = 'Breakthrough'
  ORDER BY week
  LIMIT 1;

END;
$$ LANGUAGE plpgsql;

-- Sample reflection prompts reference table
CREATE TABLE IF NOT EXISTS reflection_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week INT NOT NULL CHECK (week >= 1 AND week <= 4),
  question_order INT NOT NULL,
  question TEXT NOT NULL,
  principle TEXT NOT NULL,
  principle_tag TEXT NOT NULL,

  UNIQUE(week, question_order)
);

-- Insert the weekly prompts
INSERT INTO reflection_prompts (week, question_order, question, principle, principle_tag) VALUES
-- Week 1
(1, 1, 'What was it like meeting Maya for the first time?', 'Authentic Engagement', 'authentic_engagement'),
(1, 2, 'Did anything surprise you about how she responded?', 'Adaptive Communication', 'adaptive_communication'),
(1, 3, 'What energy or protection pattern did you notice in yourself?', 'Protection-as-Wisdom Framework', 'protection_wisdom'),

-- Week 2
(2, 1, 'Which protection patterns did Maya reflect back to you this week?', 'Protection-as-Wisdom Framework', 'protection_wisdom'),
(2, 2, 'Did you notice these patterns outside of sessions?', 'Container Awareness', 'container_awareness'),
(2, 3, 'How do you feel about them when you see them as intelligent rather than obstacles?', 'Honest Reflection', 'honest_reflection'),

-- Week 3
(3, 1, 'Was there a moment that felt like a shift or breakthrough?', 'Mental Health Awareness', 'mental_health_awareness'),
(3, 2, 'What happened just before that moment? (thoughts, emotions, words)', 'Critical Thinking & Truth-Telling', 'critical_thinking'),
(3, 3, 'What felt supportive, and what felt too much?', 'Adaptive Communication', 'adaptive_communication'),

-- Week 4
(4, 1, 'Looking back, what feels different now compared to Week 1?', 'Honest Reflection', 'honest_reflection'),
(4, 2, 'Which protection patterns softened, evolved, or revealed new wisdom?', 'Protection-as-Wisdom Framework', 'protection_wisdom'),
(4, 3, 'What will you carry forward after this beta?', 'Container Awareness', 'container_awareness')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;