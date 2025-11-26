-- Update emotion_label to emotion_name (or add if it doesn't exist)
-- Run this in Supabase SQL Editor

-- First, add the column if it doesn't exist
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotion_name TEXT;

-- If emotion_label exists, copy data to emotion_name and drop emotion_label
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mood_entries' 
    AND column_name = 'emotion_label'
  ) THEN
    -- Copy data from emotion_label to emotion_name
    UPDATE mood_entries 
    SET emotion_name = emotion_label 
    WHERE emotion_label IS NOT NULL AND emotion_name IS NULL;
    
    -- Drop the old column
    ALTER TABLE mood_entries DROP COLUMN emotion_label;
  END IF;
END $$;

-- Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_name IS 'User-provided name for the emotion/mood (from dropdown or custom input)';


