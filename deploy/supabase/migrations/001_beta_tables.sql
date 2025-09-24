-- Create beta_applications table
CREATE TABLE IF NOT EXISTS beta_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  why TEXT NOT NULL,
  commitment VARCHAR(50) NOT NULL,
  agreement BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beta_testers table (for approved testers)
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES beta_applications(id),
  user_id UUID,
  access_token VARCHAR(255) UNIQUE,
  first_login TIMESTAMP,
  last_login TIMESTAMP,
  sessions_count INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  bugs_reported INTEGER DEFAULT 0,
  trust_level DECIMAL(3,2) DEFAULT 0.50,
  presence_average DECIMAL(3,2) DEFAULT 0.70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beta_sessions table
CREATE TABLE IF NOT EXISTS beta_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID REFERENCES beta_testers(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  interactions_count INTEGER DEFAULT 0,
  presence_min DECIMAL(3,2),
  presence_max DECIMAL(3,2),
  presence_avg DECIMAL(3,2),
  trust_start DECIMAL(3,2),
  trust_end DECIMAL(3,2),
  archetype_used VARCHAR(50),
  intelligence_sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beta_interactions table
CREATE TABLE IF NOT EXISTS beta_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES beta_sessions(id),
  tester_id UUID REFERENCES beta_testers(id),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  presence_level DECIMAL(3,2),
  trust_level DECIMAL(3,2),
  archetype VARCHAR(50),
  intelligence_source VARCHAR(50),
  response_time_ms INTEGER,
  word_count INTEGER,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beta_feedback table
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID REFERENCES beta_testers(id),
  interaction_id UUID REFERENCES beta_interactions(id),
  type VARCHAR(50), -- bug, suggestion, praise, concern
  category VARCHAR(100),
  severity VARCHAR(20), -- critical, major, minor, cosmetic
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  screenshot_url TEXT,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, wont_fix
  assigned_to VARCHAR(255),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beta_metrics table (daily aggregates)
CREATE TABLE IF NOT EXISTS beta_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  active_testers INTEGER DEFAULT 0,
  new_testers INTEGER DEFAULT 0,
  avg_session_duration INTEGER,
  avg_interactions_per_session DECIMAL(5,2),
  avg_presence DECIMAL(3,2),
  avg_trust_change DECIMAL(3,2),
  total_feedback INTEGER DEFAULT 0,
  total_bugs INTEGER DEFAULT 0,
  bugs_resolved INTEGER DEFAULT 0,
  most_used_archetype VARCHAR(50),
  most_used_intelligence VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_applications_email ON beta_applications(email);
CREATE INDEX idx_applications_status ON beta_applications(status);
CREATE INDEX idx_testers_user_id ON beta_testers(user_id);
CREATE INDEX idx_testers_access_token ON beta_testers(access_token);
CREATE INDEX idx_sessions_tester ON beta_sessions(tester_id);
CREATE INDEX idx_interactions_session ON beta_interactions(session_id);
CREATE INDEX idx_interactions_tester ON beta_interactions(tester_id);
CREATE INDEX idx_feedback_tester ON beta_feedback(tester_id);
CREATE INDEX idx_feedback_status ON beta_feedback(status);
CREATE INDEX idx_metrics_date ON beta_metrics(date);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON beta_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testers_updated_at BEFORE UPDATE ON beta_testers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON beta_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE beta_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Public can insert applications" ON beta_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all applications" ON beta_applications
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Testers can view own data" ON beta_testers
  FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Testers can view own sessions" ON beta_sessions
  FOR SELECT USING (
    tester_id IN (SELECT id FROM beta_testers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Testers can insert own interactions" ON beta_interactions
  FOR INSERT WITH CHECK (
    tester_id IN (SELECT id FROM beta_testers WHERE user_id = auth.uid())
  );

CREATE POLICY "Testers can insert feedback" ON beta_feedback
  FOR INSERT WITH CHECK (
    tester_id IN (SELECT id FROM beta_testers WHERE user_id = auth.uid())
  );

-- Public can view metrics (for showing stats on landing page)
CREATE POLICY "Public can view metrics" ON beta_metrics
  FOR SELECT USING (true);