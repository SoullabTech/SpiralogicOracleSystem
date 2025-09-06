-- Add theme_preference column to profiles table
-- Run this in Supabase SQL editor

-- Add column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS theme_preference TEXT 
DEFAULT 'system' 
CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_theme 
ON profiles(id, theme_preference);

-- Update RLS policies to allow users to update their own theme preference
CREATE POLICY "Users can update own theme preference" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT UPDATE(theme_preference) ON profiles TO authenticated;

-- Optional: Add to user_settings table if you prefer separation
-- CREATE TABLE IF NOT EXISTS user_settings (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );