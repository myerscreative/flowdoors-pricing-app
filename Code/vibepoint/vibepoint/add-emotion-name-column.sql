-- Add emotion_name column to mood_entries table
-- Run this in Supabase SQL Editor if the column doesn't exist
-- This migration also refreshes the schema cache so Supabase recognizes the new column

-- Step 1: Add the column if it doesn't exist
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotion_name TEXT;

-- Step 2: Add a comment to document the field
COMMENT ON COLUMN mood_entries.emotion_name IS 'User-provided name for the emotion/mood (from dropdown or custom input)';

-- Step 3: Refresh schema cache by querying the column
-- This forces Supabase to recognize the new column in its schema cache
SELECT emotion_name FROM mood_entries LIMIT 1;

-- Step 4: Verify the column was added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mood_entries' 
  AND column_name = 'emotion_name';

-- Note: If the error persists after running this migration, you may need to:
-- 1. Restart your Supabase project (Project Settings > Infrastructure > Restart)
-- 2. Wait a few minutes for the schema cache to update automatically

