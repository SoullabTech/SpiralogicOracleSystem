-- Beta Feedback System - INDEXES & POLICIES
-- Migration: 20250909_beta_feedback_indexes
-- Run this AFTER the beta feedback core tables are created

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_rating ON beta_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created ON beta_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_resonance ON beta_feedback(emotional_resonance);

CREATE INDEX IF NOT EXISTS idx_beta_journeys_user ON beta_user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_journeys_created ON beta_user_journeys(created_at);
CREATE INDEX IF NOT EXISTS idx_beta_journeys_status ON beta_user_journeys(completion_status);

CREATE INDEX IF NOT EXISTS idx_feedback_insights_type ON feedback_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_feedback_insights_period ON feedback_insights(period_start, period_end);

-- Row Level Security
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_insights ENABLE ROW LEVEL SECURITY;

-- Feedback policies
CREATE POLICY feedback_own_data ON beta_feedback FOR ALL USING (
  user_id = auth.uid() OR user_id IS NULL
);

-- Journey policies  
CREATE POLICY journeys_own_data ON beta_user_journeys FOR ALL USING (
  user_id = auth.uid()
);

-- Insights are read-only for authenticated users
CREATE POLICY insights_read_only ON feedback_insights FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- Success message
SELECT 'Beta Feedback System Indexes & Security Policies Applied Successfully! 🔒📊✨' as result;