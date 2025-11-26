-- Force Supabase schema cache refresh
-- Run this in Supabase SQL Editor

-- Method 1: Query the column to trigger cache update
SELECT emotion_name FROM mood_entries LIMIT 1;

-- Method 2: Get full table structure to refresh cache
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mood_entries' 
ORDER BY ordinal_position;

-- Method 3: If using PostgREST, you may need to restart your Supabase project
-- Go to Project Settings > Infrastructure > Restart


