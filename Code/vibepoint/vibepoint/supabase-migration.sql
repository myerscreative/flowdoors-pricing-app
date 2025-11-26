-- ============================================
-- VibePoint Database Migration
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- Location: Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Mood entries table
-- ============================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  happiness_level FLOAT NOT NULL CHECK (happiness_level >= 0 AND happiness_level <= 1),
  motivation_level FLOAT NOT NULL CHECK (motivation_level >= 0 AND motivation_level <= 1),
  focus TEXT NOT NULL,
  self_talk TEXT NOT NULL,
  physical_sensations TEXT NOT NULL,
  emotion_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Patterns table (for cached insights)
-- ============================================
CREATE TABLE IF NOT EXISTS patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('focus', 'self_talk', 'physical')),
  trigger_text TEXT NOT NULL,
  avg_happiness FLOAT NOT NULL,
  avg_motivation FLOAT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User profiles table (optional extensions)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_entries INTEGER DEFAULT 0,
  patterns_unlocked BOOLEAN DEFAULT FALSE,
  -- AI rate limiting fields
  last_ai_request TIMESTAMPTZ,
  ai_request_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop existing policies if they exist (for re-running)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete their own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can view their own patterns" ON patterns;
DROP POLICY IF EXISTS "Users can manage their own patterns" ON patterns;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- ============================================
-- Mood entries policies
-- ============================================
CREATE POLICY "Users can view their own mood entries"
  ON mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood entries"
  ON mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Patterns policies
-- ============================================
CREATE POLICY "Users can view their own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own patterns"
  ON patterns FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- User profiles policies
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Migration complete!
-- ============================================
-- Next steps:
-- 1. Verify tables exist: Go to Table Editor
-- 2. Set up environment variables in .env.local
-- 3. Create a dev user account (see create-dev-user.js)
-- ============================================

