-- Add emotion_name column to mood_entries table
-- Run this in Supabase SQL Editor if the column doesn't exist

ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotion_name TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_name IS 'User-provided name for the emotion/mood (from dropdown or custom input)';

