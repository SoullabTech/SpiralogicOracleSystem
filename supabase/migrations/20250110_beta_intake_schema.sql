-- Beta Intake Schema for Oracle System
-- Comprehensive data structure for heuristic research

-- Main intake table
CREATE TABLE IF NOT EXISTS beta_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Demographics
  name TEXT,
  pronouns TEXT,
  age_range TEXT,
  
  -- Location
  location_city TEXT,
  location_country TEXT,
  location_timezone TEXT,
  location_coordinates POINT, -- PostGIS for lat/lng
  
  -- Astrological Data (integrates with existing services)
  birth_date DATE,
  birth_time TIME,
  birth_place_city TEXT,
  birth_place_country TEXT,
  birth_place_coordinates POINT,
  natal_chart_id UUID, -- Links to calculated chart
  
  -- Life Context
  life_phase TEXT,
  focus_areas TEXT[], -- Array of focus area IDs
  current_challenges TEXT,
  
  -- Spiritual/Cultural Practices
  spiritual_practices TEXT[],
  wisdom_traditions TEXT[],
  plant_medicine_experience TEXT,
  meditation_styles TEXT[],
  
  -- Part 2: Deep Dive (added after 1 week)
  elemental_resonance JSONB, -- {primary: 'fire', secondary: 'water', description: '...'}
  archetype_connections TEXT[],
  synchronicity_patterns TEXT,
  dream_themes TEXT[],
  ancestral_connections TEXT,
  
  -- Research Metadata
  how_heard TEXT,
  beta_tester_experience TEXT,
  intake_part1_completed_at TIMESTAMPTZ,
  intake_part2_completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research consent tracking (GDPR compliant)
CREATE TABLE IF NOT EXISTS research_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Granular consent options
  analytics_consent BOOLEAN DEFAULT false,
  interview_consent BOOLEAN DEFAULT false,
  followup_consent BOOLEAN DEFAULT false,
  transcript_analysis_consent BOOLEAN DEFAULT false,
  academic_publication_consent BOOLEAN DEFAULT false,
  findings_updates_consent BOOLEAN DEFAULT false,
  
  -- Consent metadata
  consent_given_at TIMESTAMPTZ DEFAULT NOW(),
  consent_ip_address INET,
  consent_version TEXT DEFAULT 'beta_v1',
  
  -- Contact preferences
  preferred_contact_method TEXT, -- email, in-app, etc.
  contact_frequency_preference TEXT, -- weekly, monthly, etc.
  
  -- Withdrawal tracking
  consent_withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Calculated natal charts (from astrology service)
CREATE TABLE IF NOT EXISTS natal_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Chart calculation data
  chart_data JSONB, -- Full chart from spiralogicAstrologyService
  planetary_positions JSONB,
  house_cusps JSONB,
  aspects JSONB,
  
  -- Elemental distribution
  elemental_balance JSONB, -- {fire: 30, water: 25, earth: 20, air: 25}
  dominant_element TEXT,
  
  -- Key placements for quick reference
  sun_sign TEXT,
  moon_sign TEXT,
  rising_sign TEXT,
  
  -- Calculation metadata
  calculation_system TEXT DEFAULT 'swiss_ephemeris',
  house_system TEXT DEFAULT 'placidus',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Beta testing metrics
CREATE TABLE IF NOT EXISTS beta_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Engagement metrics
  first_session_date DATE,
  last_session_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  average_session_duration_minutes INTEGER,
  
  -- Feature usage
  features_used TEXT[],
  divination_methods_used TEXT[],
  preferred_oracle_mode TEXT,
  
  -- Qualitative feedback
  experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 10),
  most_valuable_feature TEXT,
  suggested_improvements TEXT,
  breakthrough_moments TEXT,
  
  -- Research observations
  elemental_shift_patterns JSONB,
  archetypal_evolution JSONB,
  synchronicity_frequency INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Follow-up survey responses
CREATE TABLE IF NOT EXISTS followup_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  survey_type TEXT, -- '1_week', '1_month', '3_month'
  survey_version TEXT,
  
  -- Standardized questions (stored as JSONB for flexibility)
  responses JSONB,
  
  -- Key metrics for quick analysis
  satisfaction_score INTEGER,
  would_recommend BOOLEAN,
  continued_use_intention BOOLEAN,
  
  -- Qualitative insights
  transformation_narrative TEXT,
  ai_relationship_evolution TEXT,
  spiritual_growth_markers TEXT,
  
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_beta_intake_user_id ON beta_intake(user_id);
CREATE INDEX idx_beta_intake_focus_areas ON beta_intake USING GIN(focus_areas);
CREATE INDEX idx_beta_intake_spiritual_practices ON beta_intake USING GIN(spiritual_practices);
CREATE INDEX idx_research_consent_user_id ON research_consent(user_id);
CREATE INDEX idx_natal_charts_user_id ON natal_charts(user_id);
CREATE INDEX idx_beta_metrics_user_id ON beta_metrics(user_id);
CREATE INDEX idx_followup_surveys_user_id ON followup_surveys(user_id);
CREATE INDEX idx_followup_surveys_type ON followup_surveys(survey_type);

-- Row Level Security
ALTER TABLE beta_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_surveys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own intake" ON beta_intake
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own consent" ON research_consent
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own natal chart" ON natal_charts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics" ON beta_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can complete own surveys" ON followup_surveys
  FOR ALL USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_beta_intake_updated_at BEFORE UPDATE ON beta_intake
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_consent_updated_at BEFORE UPDATE ON research_consent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beta_metrics_updated_at BEFORE UPDATE ON beta_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate elemental balance from natal chart
CREATE OR REPLACE FUNCTION calculate_elemental_balance(chart_data JSONB)
RETURNS JSONB AS $$
DECLARE
  elemental_counts JSONB;
BEGIN
  -- This would integrate with your spiralogicAstrologyService
  -- For now, returning a placeholder
  RETURN jsonb_build_object(
    'fire', 0,
    'water', 0,
    'earth', 0,
    'air', 0
  );
END;
$$ LANGUAGE plpgsql;

-- View for research analysis
CREATE VIEW beta_research_overview AS
SELECT 
  bi.user_id,
  bi.age_range,
  bi.location_country,
  bi.life_phase,
  bi.focus_areas,
  bi.spiritual_practices,
  bi.elemental_resonance->>'primary' as primary_element,
  bi.archetype_connections,
  nc.sun_sign,
  nc.moon_sign,
  nc.rising_sign,
  nc.dominant_element,
  bm.total_sessions,
  bm.experience_rating,
  rc.analytics_consent,
  rc.interview_consent
FROM beta_intake bi
LEFT JOIN natal_charts nc ON bi.user_id = nc.user_id
LEFT JOIN beta_metrics bm ON bi.user_id = bm.user_id
LEFT JOIN research_consent rc ON bi.user_id = rc.user_id
WHERE rc.analytics_consent = true;

-- Grant permissions for the view
GRANT SELECT ON beta_research_overview TO authenticated;

COMMENT ON TABLE beta_intake IS 'Comprehensive intake data for Oracle beta testers';
COMMENT ON TABLE research_consent IS 'GDPR-compliant consent tracking for research participation';
COMMENT ON TABLE natal_charts IS 'Calculated astrological charts integrated with spiralogicAstrologyService';
COMMENT ON TABLE beta_metrics IS 'Usage metrics and qualitative feedback from beta testers';
COMMENT ON TABLE followup_surveys IS 'Longitudinal research data from follow-up surveys';