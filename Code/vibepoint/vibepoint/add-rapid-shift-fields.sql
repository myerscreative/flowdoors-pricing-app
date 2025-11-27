-- Add rapid shift tracking fields to mood_entries table
-- Run this in Supabase SQL Editor if the columns don't exist
-- These fields support entry throttling (30-minute buffer with 3 overrides per day)

ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS is_rapid_shift BOOLEAN DEFAULT FALSE;

ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS rapid_shift_context TEXT;

ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS minutes_since_last_entry INTEGER;

-- Add comments to document the fields
COMMENT ON COLUMN mood_entries.is_rapid_shift IS 'True if this entry was logged within 30 minutes of the previous entry (override used)';
COMMENT ON COLUMN mood_entries.rapid_shift_context IS 'Optional context provided by user when overriding the 30-minute throttle';
COMMENT ON COLUMN mood_entries.minutes_since_last_entry IS 'Number of minutes since the user''s last mood entry';

-- Create index for efficient queries on rapid shift entries
CREATE INDEX IF NOT EXISTS idx_mood_entries_rapid_shift 
ON mood_entries(user_id, is_rapid_shift) 
WHERE is_rapid_shift = true;

