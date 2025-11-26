-- Verify and add emotion_name column to mood_entries table
-- Run this in Supabase SQL Editor

-- First, check if the column exists
DO $$
BEGIN
  -- Check if emotion_name column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mood_entries' 
    AND column_name = 'emotion_name'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE mood_entries 
    ADD COLUMN emotion_name TEXT;
    
    RAISE NOTICE 'Added emotion_name column to mood_entries table';
  ELSE
    RAISE NOTICE 'emotion_name column already exists in mood_entries table';
  END IF;
END $$;

-- Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_name IS 'User-provided name for the emotion/mood (from dropdown or custom input)';

-- Verify the column was added (this will show an error if it wasn't)
SELECT emotion_name FROM mood_entries LIMIT 1;


