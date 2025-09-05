-- Beta Signup Tables
-- Run this migration in Supabase SQL Editor

-- Beta Signups Table (main application data)
CREATE TABLE IF NOT EXISTS beta_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beta_access_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  preferred_element TEXT DEFAULT 'aether' CHECK (preferred_element IN ('air', 'fire', 'water', 'earth', 'aether')),
  has_webcam BOOLEAN DEFAULT false,
  has_microphone BOOLEAN DEFAULT false,
  tech_background TEXT DEFAULT '',
  motivation TEXT DEFAULT '',
  consent_analytics BOOLEAN NOT NULL DEFAULT false,
  consent_contact BOOLEAN NOT NULL DEFAULT false,
  signup_source TEXT DEFAULT 'beta_signup_page',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  
  INDEX(email),
  INDEX(status),
  INDEX(created_at),
  INDEX(city)
);

-- Beta Access Sessions (track when users access Maya)
CREATE TABLE IF NOT EXISTS beta_access_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beta_access_id TEXT NOT NULL REFERENCES beta_signups(beta_access_id),
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_minutes INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  milestones_completed JSONB DEFAULT '[]',
  onboarding_completed BOOLEAN DEFAULT false,
  feedback_submitted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  
  INDEX(beta_access_id),
  INDEX(started_at),
  INDEX(onboarding_completed)
);

-- Beta Invitation Emails (track email communications)
CREATE TABLE IF NOT EXISTS beta_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beta_access_id TEXT NOT NULL REFERENCES beta_signups(beta_access_id),
  email_type TEXT NOT NULL, -- 'welcome', 'reminder', 'follow_up'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  email_subject TEXT,
  email_template TEXT,
  send_status TEXT DEFAULT 'sent' CHECK (send_status IN ('sent', 'delivered', 'opened', 'clicked', 'failed')),
  metadata JSONB DEFAULT '{}',
  
  INDEX(beta_access_id),
  INDEX(email_type),
  INDEX(sent_at)
);

-- RLS policies for security
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin access to beta signups" ON beta_signups
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to beta sessions" ON beta_access_sessions
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin access to beta invitations" ON beta_invitations
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions for beta management
CREATE OR REPLACE FUNCTION approve_beta_signup(signup_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  access_id TEXT;
BEGIN
  -- Update status to approved
  UPDATE beta_signups 
  SET status = 'approved', updated_at = now()
  WHERE id = signup_id
  RETURNING beta_access_id INTO access_id;
  
  IF access_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Signup not found');
  END IF;
  
  -- Create welcome email record (to be sent by external service)
  INSERT INTO beta_invitations (beta_access_id, email_type, email_subject, send_status)
  VALUES (access_id, 'welcome', 'Your Maya Beta Access is Ready!', 'pending');
  
  RETURN json_build_object('success', true, 'beta_access_id', access_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get beta signup stats
CREATE OR REPLACE FUNCTION get_beta_signup_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_signups', (SELECT COUNT(*) FROM beta_signups),
    'pending_count', (SELECT COUNT(*) FROM beta_signups WHERE status = 'pending'),
    'approved_count', (SELECT COUNT(*) FROM beta_signups WHERE status = 'approved'),
    'completed_count', (SELECT COUNT(*) FROM beta_signups WHERE status = 'completed'),
    'cities_represented', (SELECT COUNT(DISTINCT city) FROM beta_signups),
    'elements_breakdown', (
      SELECT json_object_agg(preferred_element, count)
      FROM (
        SELECT preferred_element, COUNT(*) as count
        FROM beta_signups 
        GROUP BY preferred_element
      ) t
    ),
    'tech_readiness', json_build_object(
      'with_microphone', (SELECT COUNT(*) FROM beta_signups WHERE has_microphone = true),
      'with_webcam', (SELECT COUNT(*) FROM beta_signups WHERE has_webcam = true)
    ),
    'signup_trend', (
      SELECT json_agg(json_build_object('date', date, 'count', count))
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM beta_signups 
        WHERE created_at > now() - interval '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate beta access link
CREATE OR REPLACE FUNCTION generate_beta_access_link(access_id TEXT)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT := 'https://your-domain.com'; -- Update with actual domain
  encrypted_id TEXT;
BEGIN
  -- In a real implementation, you'd encrypt/hash the access_id
  -- For now, just return a simple URL
  RETURN base_url || '/beta-access/' || access_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample Swiss cities for validation (optional)
CREATE TABLE IF NOT EXISTS swiss_cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  canton TEXT,
  population INTEGER
);

INSERT INTO swiss_cities (name, canton, population) VALUES
  ('Zurich', 'ZH', 434008),
  ('Geneva', 'GE', 203856),
  ('Basel', 'BS', 177595),
  ('Bern', 'BE', 144043),
  ('Lausanne', 'VD', 140202),
  ('Winterthur', 'ZH', 111851),
  ('Lucerne', 'LU', 82257),
  ('St. Gallen', 'SG', 76213),
  ('Lugano', 'TI', 62315),
  ('Biel/Bienne', 'BE', 55206)
ON CONFLICT DO NOTHING;