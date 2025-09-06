-- Create user_preferences table for storing Attune settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tone & Style settings
  tone integer DEFAULT 50 CHECK (tone >= 0 AND tone <= 100),
  style text DEFAULT 'auto' CHECK (style IN ('prose', 'poetic', 'auto')),
  
  -- Theme settings
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Voice settings (for future)
  voice_enabled boolean DEFAULT true,
  voice_speed numeric(3,2) DEFAULT 1.0 CHECK (voice_speed >= 0.5 AND voice_speed <= 2.0),
  
  -- Additional preferences
  show_thinking boolean DEFAULT true,
  auto_play_voice boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one row per user
  UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add to verification query
SELECT 'User preferences table created successfully' AS status;