-- Create holoflower_entries table for storing elemental state check-ins
-- This table stores the 6 elemental intensities and optional reflection

CREATE TABLE holoflower_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Elemental intensities (0-100)
  fire INTEGER NOT NULL CHECK (fire >= 0 AND fire <= 100),
  water INTEGER NOT NULL CHECK (water >= 0 AND water <= 100),
  earth INTEGER NOT NULL CHECK (earth >= 0 AND earth <= 100),
  air INTEGER NOT NULL CHECK (air >= 0 AND air <= 100),
  aether INTEGER NOT NULL CHECK (aether >= 0 AND aether <= 100),
  shadow INTEGER NOT NULL CHECK (shadow >= 0 AND shadow <= 100),
  
  -- Optional reflection
  reflection TEXT,
  
  -- Calculated coherence score (computed from variance)
  coherence_score INTEGER GENERATED ALWAYS AS (
    GREATEST(0, LEAST(100, 
      100 - (
        sqrt(
          (power(fire - 50, 2) + power(water - 50, 2) + power(earth - 50, 2) + 
           power(air - 50, 2) + power(aether - 50, 2) + power(shadow - 50, 2)) / 6.0
        ) * 2
      )::INTEGER
    ))
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE holoflower_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own holoflower entries" 
  ON holoflower_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holoflower entries" 
  ON holoflower_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holoflower entries" 
  ON holoflower_entries FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holoflower entries" 
  ON holoflower_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_holoflower_entries_updated_at
  BEFORE UPDATE ON holoflower_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_holoflower_entries_user_id ON holoflower_entries(user_id);
CREATE INDEX idx_holoflower_entries_created_at ON holoflower_entries(created_at DESC);
CREATE INDEX idx_holoflower_entries_coherence ON holoflower_entries(coherence_score DESC);

-- Create view for analytics
CREATE VIEW holoflower_analytics AS
SELECT 
  user_id,
  DATE(created_at) as entry_date,
  AVG(fire) as avg_fire,
  AVG(water) as avg_water,
  AVG(earth) as avg_earth,
  AVG(air) as avg_air,
  AVG(aether) as avg_aether,
  AVG(shadow) as avg_shadow,
  AVG(coherence_score) as avg_coherence,
  COUNT(*) as entries_count
FROM holoflower_entries
GROUP BY user_id, DATE(created_at)
ORDER BY user_id, entry_date DESC;

-- Grant permissions on the view
GRANT SELECT ON holoflower_analytics TO authenticated;

-- RLS for the view
ALTER VIEW holoflower_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own holoflower analytics" 
  ON holoflower_analytics FOR SELECT 
  USING (auth.uid() = user_id);