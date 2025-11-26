-- Fix emotion_name column issue
-- Run this in Supabase SQL Editor

-- Step 1: Add the column if it doesn't exist (using IF NOT EXISTS)
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotion_name TEXT;

-- Step 2: Refresh the schema cache by querying the column
-- This forces Supabase to recognize the new column
DO $$
BEGIN
  -- Force a schema refresh by checking the column exists
  PERFORM emotion_name FROM mood_entries LIMIT 1;
  RAISE NOTICE 'emotion_name column is now available';
EXCEPTION
  WHEN undefined_column THEN
    RAISE EXCEPTION 'Column emotion_name still not found after adding it';
END $$;

-- Step 3: Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_name IS 'User-provided name for the emotion/mood (from dropdown or custom input)';

-- Step 4: Verify the column structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'mood_entries' 
AND column_name = 'emotion_name';


