-- Add nudges_enabled column to user_preferences table
-- Migration: Add support for Maya voice nudge preferences

-- Add the nudges_enabled column with default TRUE
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS nudges_enabled boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.user_preferences.nudges_enabled IS 'Whether Maya should provide gentle nudges during long silences';

-- Verify the change
SELECT 'Nudges enabled column added successfully' AS status;