-- MAIA Safety & Assessment System Database Schema
-- Comprehensive tracking for user wellness, crisis prevention, and growth measurement

-- Core safety assessments and responses
CREATE TABLE user_safety_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    message_text TEXT,
    risk_level VARCHAR(20) CHECK (risk_level IN ('none', 'moderate', 'high', 'crisis')),
    confidence_score DECIMAL(3,2),
    risk_flags JSONB DEFAULT '[]',
    action_taken VARCHAR(50),
    response_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for performance
    INDEX idx_safety_user_time (user_id, created_at DESC),
    INDEX idx_safety_risk_level (risk_level, created_at DESC)
);

-- Validated assessment instruments and scores
CREATE TABLE user_assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255),
    assessment_type VARCHAR(50) NOT NULL, -- phq2, gad2, maas, perma, etc.
    raw_responses JSONB NOT NULL, -- Store actual user responses
    computed_score DECIMAL(10,2),
    max_possible_score DECIMAL(10,2),
    interpretation TEXT,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'elevated', 'high')),
    next_action VARCHAR(50) CHECK (next_action IN ('continue', 'weekly_followup', 'clinical_referral', 'crisis_protocol')),
    administered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Ensure we don't duplicate assessments too frequently
    UNIQUE(user_id, assessment_type, DATE(administered_at)),

    INDEX idx_assessments_user_type (user_id, assessment_type, administered_at DESC),
    INDEX idx_assessments_risk (risk_level, administered_at DESC)
);

-- Assessment scheduling and frequency management
CREATE TABLE assessment_schedule (
    user_id UUID NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    frequency_days INTEGER NOT NULL, -- How often to administer
    last_completed_at TIMESTAMPTZ,
    next_due_at TIMESTAMPTZ,
    completion_count INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0, -- Track when user declines
    personalized_frequency INTEGER, -- Adjusted based on risk/engagement

    PRIMARY KEY (user_id, assessment_type),
    INDEX idx_schedule_due (next_due_at, assessment_type)
);

-- User trajectory and longitudinal tracking
CREATE TABLE user_wellness_trajectory (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    week_start DATE NOT NULL, -- Week-based aggregation

    -- Mood & Mental Health Metrics
    avg_mood_rating DECIMAL(3,1), -- From session mood checks
    depression_score DECIMAL(5,2), -- Latest PHQ score
    anxiety_score DECIMAL(5,2), -- Latest GAD score

    -- Crisis & Safety Metrics
    crisis_flags_count INTEGER DEFAULT 0,
    moderate_risk_episodes INTEGER DEFAULT 0,
    safety_interventions INTEGER DEFAULT 0,

    -- Growth & Breakthrough Metrics
    breakthrough_moments INTEGER DEFAULT 0,
    insight_quality_avg DECIMAL(3,1),
    coherence_score DECIMAL(5,2), -- HRV if available
    mindfulness_minutes INTEGER DEFAULT 0,

    -- Engagement Metrics
    session_count INTEGER DEFAULT 0,
    total_session_minutes INTEGER DEFAULT 0,
    assessment_completion_rate DECIMAL(3,2),

    -- Derived Wellness Indicators
    overall_wellness_score DECIMAL(5,2), -- Composite score
    trajectory_direction VARCHAR(20) CHECK (trajectory_direction IN ('improving', 'stable', 'declining', 'crisis')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, week_start),
    INDEX idx_trajectory_user_week (user_id, week_start DESC),
    INDEX idx_trajectory_wellness (overall_wellness_score, week_start DESC)
);

-- Crisis escalation and intervention tracking
CREATE TABLE crisis_interventions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    trigger_message TEXT,
    risk_assessment JSONB, -- Full risk assessment data
    intervention_type VARCHAR(50) NOT NULL, -- lock_session, escalate, therapist_alert

    -- Escalation details
    therapist_notified_at TIMESTAMPTZ,
    therapist_id UUID, -- If assigned therapist
    emergency_contact_called BOOLEAN DEFAULT FALSE,
    emergency_services_contacted BOOLEAN DEFAULT FALSE,

    -- Resolution tracking
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    follow_up_scheduled TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_crisis_user (user_id, created_at DESC),
    INDEX idx_crisis_unresolved (user_id) WHERE resolved_at IS NULL
);

-- Personalization and adaptive assessment timing
CREATE TABLE user_assessment_preferences (
    user_id UUID PRIMARY KEY,

    -- Timing preferences
    preferred_assessment_frequency JSONB, -- Per assessment type
    time_sensitive BOOLEAN DEFAULT TRUE, -- Adapt frequency based on risk

    -- Communication style
    prefers_direct_questions BOOLEAN DEFAULT TRUE,
    prefers_contextual_embedding BOOLEAN DEFAULT TRUE,
    assessment_anxiety_level INTEGER CHECK (assessment_anxiety_level BETWEEN 1 AND 10),

    -- Wellness goals and focus areas
    primary_wellness_goals TEXT[], -- depression, anxiety, mindfulness, etc.
    secondary_measures TEXT[], -- Additional assessments they want

    -- Response patterns (learned)
    typical_session_length INTEGER, -- Minutes
    engagement_peak_times JSONB, -- Time of day patterns
    response_quality_indicators JSONB, -- What indicates good engagement

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Growth milestones and celebrations
CREATE TABLE wellness_milestones (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    milestone_type VARCHAR(50) NOT NULL, -- depression_improvement, anxiety_reduction, breakthrough_streak

    -- Milestone details
    metric_name VARCHAR(100), -- e.g., 'PHQ-2 Score'
    baseline_value DECIMAL(10,2),
    milestone_value DECIMAL(10,2),
    improvement_percentage DECIMAL(5,2),

    -- Timeline
    baseline_date DATE,
    achieved_date DATE NOT NULL,
    celebration_sent BOOLEAN DEFAULT FALSE,

    -- Context
    contributing_factors TEXT[], -- What helped achieve this
    user_reflection TEXT, -- Their thoughts on the achievement

    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_milestones_user (user_id, achieved_date DESC),
    INDEX idx_milestones_type (milestone_type, achieved_date DESC)
);

-- Real-time dashboard views
CREATE VIEW user_current_status AS
SELECT
    u.user_id,

    -- Latest assessment scores
    (SELECT computed_score FROM user_assessments
     WHERE user_id = u.user_id AND assessment_type = 'phq2'
     ORDER BY administered_at DESC LIMIT 1) as latest_phq2,

    (SELECT computed_score FROM user_assessments
     WHERE user_id = u.user_id AND assessment_type = 'gad2'
     ORDER BY administered_at DESC LIMIT 1) as latest_gad2,

    -- Current risk level
    (SELECT risk_level FROM user_safety_log
     WHERE user_id = u.user_id
     ORDER BY created_at DESC LIMIT 1) as current_risk_level,

    -- Recent trajectory
    (SELECT trajectory_direction FROM user_wellness_trajectory
     WHERE user_id = u.user_id
     ORDER BY week_start DESC LIMIT 1) as trajectory,

    -- Pending assessments
    (SELECT COUNT(*) FROM assessment_schedule
     WHERE user_id = u.user_id AND next_due_at <= NOW()) as assessments_due,

    -- Active crisis flag
    (SELECT COUNT(*) > 0 FROM crisis_interventions
     WHERE user_id = u.user_id AND resolved_at IS NULL) as active_crisis

FROM (SELECT DISTINCT user_id FROM user_safety_log) u;

-- Trigger to update wellness trajectory weekly
CREATE OR REPLACE FUNCTION update_wellness_trajectory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_wellness_trajectory (
        user_id,
        week_start,
        depression_score,
        anxiety_score,
        crisis_flags_count
    )
    VALUES (
        NEW.user_id,
        DATE_TRUNC('week', NEW.administered_at)::DATE,
        CASE WHEN NEW.assessment_type = 'phq2' THEN NEW.computed_score END,
        CASE WHEN NEW.assessment_type = 'gad2' THEN NEW.computed_score END,
        0
    )
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
        depression_score = COALESCE(EXCLUDED.depression_score, user_wellness_trajectory.depression_score),
        anxiety_score = COALESCE(EXCLUDED.anxiety_score, user_wellness_trajectory.anxiety_score),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trajectory
    AFTER INSERT ON user_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_trajectory();

-- Insert default assessment schedules for new users
INSERT INTO assessment_schedule (user_id, assessment_type, frequency_days, next_due_at)
SELECT
    DISTINCT user_id,
    unnest(ARRAY['phq2', 'gad2', 'session_mood']) as assessment_type,
    CASE
        WHEN unnest(ARRAY['phq2', 'gad2', 'session_mood']) IN ('phq2', 'gad2') THEN 7
        ELSE 1 -- Session mood every session
    END as frequency_days,
    NOW() as next_due_at
FROM user_safety_log
WHERE user_id NOT IN (SELECT user_id FROM assessment_schedule);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_safety_log_composite ON user_safety_log (user_id, risk_level, created_at DESC);
CREATE INDEX CONCURRENTLY idx_assessments_recent ON user_assessments (user_id, assessment_type, administered_at DESC);
CREATE INDEX CONCURRENTLY idx_trajectory_analysis ON user_wellness_trajectory (user_id, week_start, overall_wellness_score);