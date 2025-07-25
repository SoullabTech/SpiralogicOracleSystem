-- Create birth_charts table to store user birth data and calculated charts
CREATE TABLE IF NOT EXISTS birth_charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date TIMESTAMP NOT NULL,
  birth_time TIME NOT NULL,
  birth_location JSONB NOT NULL, -- {lat, lng, timezone, place_name}
  chart_data JSONB NOT NULL, -- Full calculated chart data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create spiralogic_reports table
CREATE TABLE IF NOT EXISTS spiralogic_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL DEFAULT 'natal', -- natal, transit, synastry, etc.
  report_data JSONB NOT NULL, -- Full report content
  pdf_url TEXT, -- URL to stored PDF
  created_by UUID REFERENCES auth.users(id), -- For practitioner-generated reports
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create practitioner_clients table for practitioner portal
CREATE TABLE IF NOT EXISTS practitioner_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(practitioner_id, client_id)
);

-- Create practitioner_branding table
CREATE TABLE IF NOT EXISTS practitioner_branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7),
  custom_css TEXT,
  report_header_text TEXT,
  report_footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create retreat_participants table for retreat mode
CREATE TABLE IF NOT EXISTS retreat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  birth_chart_id UUID REFERENCES birth_charts(id),
  spiralogic_report_id UUID REFERENCES spiralogic_reports(id),
  depth_agent VARCHAR(20), -- water, earth, fire, air, aether
  current_state TEXT,
  becoming_state TEXT,
  journal_entries JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX idx_spiralogic_reports_user_id ON spiralogic_reports(user_id);
CREATE INDEX idx_spiralogic_reports_birth_chart_id ON spiralogic_reports(birth_chart_id);
CREATE INDEX idx_practitioner_clients_practitioner_id ON practitioner_clients(practitioner_id);
CREATE INDEX idx_retreat_participants_retreat_id ON retreat_participants(retreat_id);

-- Add RLS policies
ALTER TABLE birth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiralogic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE retreat_participants ENABLE ROW LEVEL SECURITY;

-- Users can view their own birth charts
CREATE POLICY "Users can view own birth charts" ON birth_charts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own birth charts
CREATE POLICY "Users can create own birth charts" ON birth_charts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own birth charts
CREATE POLICY "Users can update own birth charts" ON birth_charts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON spiralogic_reports
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Practitioners can view client reports they created
CREATE POLICY "Practitioners can view client reports" ON spiralogic_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM practitioner_clients 
      WHERE practitioner_id = auth.uid() 
      AND client_id = spiralogic_reports.user_id
    )
  );

-- Practitioners can manage their clients
CREATE POLICY "Practitioners can manage clients" ON practitioner_clients
  FOR ALL USING (auth.uid() = practitioner_id);

-- Practitioners can manage their branding
CREATE POLICY "Practitioners can manage branding" ON practitioner_branding
  FOR ALL USING (auth.uid() = practitioner_id);

-- Retreat participants can view their own data
CREATE POLICY "Participants can view own retreat data" ON retreat_participants
  FOR SELECT USING (auth.uid() = user_id);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_birth_charts_updated_at BEFORE UPDATE ON birth_charts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spiralogic_reports_updated_at BEFORE UPDATE ON spiralogic_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioner_clients_updated_at BEFORE UPDATE ON practitioner_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioner_branding_updated_at BEFORE UPDATE ON practitioner_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retreat_participants_updated_at BEFORE UPDATE ON retreat_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();