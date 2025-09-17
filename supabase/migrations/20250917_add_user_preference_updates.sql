-- Create user_preference_updates table for tracking preference changes over time
-- Migration: Add analytics table for user preference change tracking

CREATE TABLE IF NOT EXISTS public.user_preference_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preference values at time of update
  voice_profile_id text,
  voice_mode text,
  interaction_mode text,
  nudges_enabled boolean,

  -- Metadata
  updated_at timestamptz DEFAULT now(),

  -- Index for performance
  INDEX idx_user_preference_updates_user_id (user_id),
  INDEX idx_user_preference_updates_updated_at (updated_at)
);

-- Enable RLS
ALTER TABLE public.user_preference_updates ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only access their own preference updates
CREATE POLICY "Users can view own preference updates"
  ON public.user_preference_updates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert updates for analytics
CREATE POLICY "Service role can insert preference updates"
  ON public.user_preference_updates
  FOR INSERT
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.user_preference_updates IS 'Tracks changes to user preferences over time for analytics';
COMMENT ON COLUMN public.user_preference_updates.nudges_enabled IS 'Whether Maya nudges were enabled at time of update';

-- Verify the change
SELECT 'User preference updates table created successfully' AS status;