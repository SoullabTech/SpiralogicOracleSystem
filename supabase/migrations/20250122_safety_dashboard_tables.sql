-- Safety Pipeline and Growth Dashboard Tables
-- Creates comprehensive safety monitoring and growth visualization infrastructure

-- Users safety monitoring table
CREATE TABLE IF NOT EXISTS user_safety (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    risk_level VARCHAR(20) CHECK (risk_level IN ('none', 'low', 'moderate', 'high')),
    action_taken VARCHAR(50) CHECK (action_taken IN ('continue', 'gentle_checkin', 'lock_session', 'escalate')),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Assessment responses for mental health tracking
CREATE TABLE IF NOT EXISTS user_assessments (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_type VARCHAR(20) CHECK (assessment_type IN ('PHQ-2', 'PHQ-9', 'GAD-7', 'DASS-21', 'DSES', 'MEQ30', 'custom')),
    question TEXT NOT NULL,
    answer TEXT,
    score INTEGER,
    total_score INTEGER,
    percentile FLOAT,
    interpretation TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Escalation tracking
CREATE TABLE IF NOT EXISTS escalations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT NOT NULL,
    escalated_to VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved')),
    notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Growth metrics for dashboard visualization
CREATE TABLE IF NOT EXISTS growth_metrics (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_type VARCHAR(30) CHECK (metric_type IN ('coherence', 'emotional_balance', 'breakthrough_count', 'engagement', 'progress_velocity')),
    value FLOAT NOT NULL,
    context TEXT,
    source VARCHAR(50) DEFAULT 'maia_analysis',
    metadata JSONB DEFAULT '{}'
);

-- Breakthrough moments tracking
CREATE TABLE IF NOT EXISTS breakthrough_moments (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL,
    intensity FLOAT CHECK (intensity >= 0 AND intensity <= 1),
    context TEXT,
    preceding_topic TEXT,
    associated_message_id TEXT,
    themes TEXT[],
    metadata JSONB DEFAULT '{}'
);

-- Emotional patterns for weather visualization
CREATE TABLE IF NOT EXISTS emotional_patterns (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dominant_emotion VARCHAR(20) CHECK (dominant_emotion IN ('fire', 'water', 'earth', 'air')),
    fire_score FLOAT DEFAULT 0,
    water_score FLOAT DEFAULT 0,
    earth_score FLOAT DEFAULT 0,
    air_score FLOAT DEFAULT 0,
    balance_score FLOAT,
    sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    metadata JSONB DEFAULT '{}'
);

-- Theme evolution tracking
CREATE TABLE IF NOT EXISTS theme_evolution (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start DATE NOT NULL,
    dominant_theme TEXT,
    theme_words TEXT[],
    theme_distribution JSONB,
    topic_coherence FLOAT,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_safety_user_id ON user_safety(user_id);
CREATE INDEX IF NOT EXISTS idx_user_safety_ts ON user_safety(ts DESC);
CREATE INDEX IF NOT EXISTS idx_user_safety_risk_level ON user_safety(risk_level);

CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_ts ON user_assessments(ts DESC);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type);

CREATE INDEX IF NOT EXISTS idx_escalations_user_id ON escalations(user_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_ts ON escalations(ts DESC);

CREATE INDEX IF NOT EXISTS idx_growth_metrics_user_id ON growth_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_type ON growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_ts ON growth_metrics(ts DESC);

CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_user_id ON breakthrough_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_breakthrough_moments_ts ON breakthrough_moments(ts DESC);

CREATE INDEX IF NOT EXISTS idx_emotional_patterns_user_id ON emotional_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_patterns_ts ON emotional_patterns(ts DESC);

CREATE INDEX IF NOT EXISTS idx_theme_evolution_user_id ON theme_evolution(user_id);
CREATE INDEX IF NOT EXISTS idx_theme_evolution_week ON theme_evolution(week_start DESC);

-- Enable Row Level Security
ALTER TABLE user_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakthrough_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_evolution ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_safety
CREATE POLICY "Users can view their own safety data" ON user_safety
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert safety data" ON user_safety
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for user_assessments
CREATE POLICY "Users can view their own assessments" ON user_assessments
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert assessments" ON user_assessments
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for escalations (admin + user access)
CREATE POLICY "Users can view their own escalations" ON escalations
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can manage escalations" ON escalations
  FOR ALL WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for growth_metrics
CREATE POLICY "Users can view their own metrics" ON growth_metrics
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert metrics" ON growth_metrics
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for breakthrough_moments
CREATE POLICY "Users can view their own breakthroughs" ON breakthrough_moments
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert breakthroughs" ON breakthrough_moments
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for emotional_patterns
CREATE POLICY "Users can view their own emotional patterns" ON emotional_patterns
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert emotional patterns" ON emotional_patterns
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- RLS Policies for theme_evolution
CREATE POLICY "Users can view their own theme evolution" ON theme_evolution
  FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

CREATE POLICY "System can insert theme evolution" ON theme_evolution
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR user_id = 'anonymous');

-- Utility functions for dashboard data aggregation
CREATE OR REPLACE FUNCTION get_user_coherence_score(p_user_id TEXT, days_back INTEGER DEFAULT 30)
RETURNS FLOAT AS $$
DECLARE
    coherence_score FLOAT;
BEGIN
    SELECT COALESCE(AVG(value), 0.0)
    INTO coherence_score
    FROM growth_metrics
    WHERE user_id = p_user_id
      AND metric_type = 'coherence'
      AND ts >= NOW() - INTERVAL '1 day' * days_back;

    RETURN coherence_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_breakthrough_timeline(p_user_id TEXT, days_back INTEGER DEFAULT 90)
RETURNS TABLE(
    breakthrough_date DATE,
    description TEXT,
    intensity FLOAT,
    context TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(bm.ts) as breakthrough_date,
        bm.description,
        bm.intensity,
        bm.context
    FROM breakthrough_moments bm
    WHERE bm.user_id = p_user_id
      AND bm.ts >= NOW() - INTERVAL '1 day' * days_back
    ORDER BY bm.ts DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_emotional_weather_data(p_user_id TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    fire_score FLOAT,
    water_score FLOAT,
    earth_score FLOAT,
    air_score FLOAT,
    balance_score FLOAT,
    sentiment_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(ep.ts) as date,
        AVG(ep.fire_score) as fire_score,
        AVG(ep.water_score) as water_score,
        AVG(ep.earth_score) as earth_score,
        AVG(ep.air_score) as air_score,
        AVG(ep.balance_score) as balance_score,
        AVG(ep.sentiment_score) as sentiment_score
    FROM emotional_patterns ep
    WHERE ep.user_id = p_user_id
      AND ep.ts >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(ep.ts)
    ORDER BY DATE(ep.ts) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_coherence_score(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_breakthrough_timeline(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emotional_weather_data(TEXT, INTEGER) TO authenticated;