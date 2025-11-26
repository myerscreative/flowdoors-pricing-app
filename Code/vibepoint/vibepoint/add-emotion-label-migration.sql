-- Add emotion_label column to mood_entries table
-- Run this in Supabase SQL Editor

ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotion_label TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_label IS 'User-provided label for the emotion/mood (e.g., happy, carefree, worried, angry)';


