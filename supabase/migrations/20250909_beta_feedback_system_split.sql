-- Beta Feedback System Tables - CORE TABLES ONLY
-- Migration: 20250909_beta_feedback_system_split
-- Run this after the core user tables are created

-- Beta feedback table for collecting user insights
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_sacred_name TEXT,
  
  -- Feedback content
  feedback_type TEXT NOT NULL DEFAULT 'experience',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  emotional_resonance TEXT,
  
  -- Context metadata
  page_context TEXT,
  session_id UUID,
  user_agent TEXT,
  ip_address TEXT,
  
  -- Analytics
  would_recommend BOOLEAN,
  sacred_insight TEXT,
  improvement_suggestions TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (feedback_type IN ('experience', 'feature', 'bug', 'suggestion', 'general')),
  CHECK (emotional_resonance IN ('inspiring', 'calming', 'energizing', 'grounding', 'challenging', 'confusing', 'transformative', 'joyful'))
);

-- Beta user journey tracking
CREATE TABLE IF NOT EXISTS beta_user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Journey milestones
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_conversation TIMESTAMP WITH TIME ZONE,
  first_memory_saved TIMESTAMP WITH TIME ZONE,
  account_created TIMESTAMP WITH TIME ZONE,
  first_feedback TIMESTAMP WITH TIME ZONE,
  
  -- Usage metrics
  total_conversations INTEGER DEFAULT 0,
  total_memories INTEGER DEFAULT 0,
  total_feedback_given INTEGER DEFAULT 0,
  average_session_duration INTEGER, -- in seconds
  
  -- Engagement patterns
  preferred_interaction_mode TEXT, -- 'voice', 'text', 'mixed'
  most_active_time_of_day INTEGER, -- hour 0-23
  favorite_wisdom_themes TEXT[],
  
  -- Beta program specifics
  referral_source TEXT,
  beta_access_code TEXT,
  completion_status TEXT DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (completion_status IN ('active', 'completed', 'churned', 'graduated'))
);

-- Sacred feedback insights aggregations (for analytics)
CREATE TABLE IF NOT EXISTS feedback_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  
  -- Aggregated data
  total_responses INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  sentiment_distribution JSONB,
  
  -- Key themes
  top_positive_themes TEXT[],
  top_improvement_areas TEXT[],
  common_user_requests TEXT[],
  
  -- Time period
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (insight_type IN ('weekly', 'monthly', 'milestone', 'cohort'))
);

-- Update triggers for beta feedback system
CREATE TRIGGER update_beta_feedback_updated_at
  BEFORE UPDATE ON beta_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_beta_user_journeys_updated_at
  BEFORE UPDATE ON beta_user_journeys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically create beta journey on user creation
CREATE OR REPLACE FUNCTION create_beta_user_journey()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO beta_user_journeys (user_id, beta_access_code, account_created)
  VALUES (NEW.id, NEW.beta_access_code, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create journey tracking
CREATE TRIGGER create_journey_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_beta_user_journey();

-- Function to update journey milestones
CREATE OR REPLACE FUNCTION update_journey_milestone(
  p_user_id UUID,
  p_milestone TEXT
)
RETURNS VOID AS $$
BEGIN
  CASE p_milestone
    WHEN 'first_conversation' THEN
      UPDATE beta_user_journeys 
      SET first_conversation = COALESCE(first_conversation, NOW()),
          total_conversations = total_conversations + 1
      WHERE user_id = p_user_id;
      
    WHEN 'memory_saved' THEN
      UPDATE beta_user_journeys 
      SET first_memory_saved = COALESCE(first_memory_saved, NOW()),
          total_memories = total_memories + 1
      WHERE user_id = p_user_id;
      
    WHEN 'feedback_given' THEN
      UPDATE beta_user_journeys 
      SET first_feedback = COALESCE(first_feedback, NOW()),
          total_feedback_given = total_feedback_given + 1
      WHERE user_id = p_user_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Sample beta feedback categories for reference
INSERT INTO feedback_insights (insight_type, top_positive_themes, top_improvement_areas, common_user_requests)
VALUES (
  'milestone',
  ARRAY['sacred_experience', 'maya_wisdom', 'voice_quality', 'memory_integration', 'intuitive_design'],
  ARRAY['response_speed', 'mobile_optimization', 'more_customization', 'deeper_personalization'],
  ARRAY['export_conversations', 'mobile_app', 'group_sessions', 'integration_with_journals']
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Beta Feedback System Core Tables Created Successfully! 📊✨' as result;

COMMENT ON TABLE beta_feedback IS 'Sacred feedback from beta users to guide system evolution';
COMMENT ON TABLE beta_user_journeys IS 'Tracking beta user progression through sacred technology experience';
COMMENT ON TABLE feedback_insights IS 'Aggregated insights from feedback for strategic development';