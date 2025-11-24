# Vibepoint Database Schema

This document contains the complete SQL schema for the Vibepoint mood tracking application.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard

## Schema Setup

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mood entries table
CREATE TABLE mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  happiness_level FLOAT NOT NULL CHECK (happiness_level >= 0 AND happiness_level <= 1),
  motivation_level FLOAT NOT NULL CHECK (motivation_level >= 0 AND motivation_level <= 1),
  focus TEXT NOT NULL,
  self_talk TEXT NOT NULL,
  physical_sensations TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patterns table (for cached insights)
CREATE TABLE patterns (
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

-- User profiles table (optional extensions)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_entries INTEGER DEFAULT 0,
  patterns_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_user_profiles_id ON user_profiles(id);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Mood entries policies
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

-- Patterns policies
CREATE POLICY "Users can view their own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own patterns"
  ON patterns FOR ALL
  USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Environment Variables

After setting up the database, create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

## Testing the Setup

To verify your database setup is working:

1. Go to your Supabase dashboard
2. Navigate to the Table Editor
3. You should see the `mood_entries`, `patterns`, and `user_profiles` tables
4. Try inserting a test row in the SQL Editor:

```sql
INSERT INTO mood_entries (user_id, happiness_level, motivation_level, focus, self_talk, physical_sensations)
VALUES ('test-user-id', 0.8, 0.6, 'work project', 'I can do this', 'energized');
```

## Data Types

### MoodEntry
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `timestamp`: TIMESTAMPTZ (when the mood was logged)
- `happiness_level`: FLOAT (0-1, where 1 = happiest)
- `motivation_level`: FLOAT (0-1, where 1 = most motivated)
- `focus`: TEXT (what the user is focusing on)
- `self_talk`: TEXT (internal dialogue)
- `physical_sensations`: TEXT (body sensations)
- `notes`: TEXT (optional additional notes)

### Pattern
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `pattern_type`: TEXT ('focus', 'self_talk', or 'physical')
- `trigger_text`: TEXT (the specific trigger being analyzed)
- `avg_happiness`: FLOAT (average happiness when this trigger occurs)
- `avg_motivation`: FLOAT (average motivation when this trigger occurs)
- `occurrence_count`: INTEGER (how many times this pattern has been observed)

### UserProfile
- `id`: UUID (references auth.users, primary key)
- `display_name`: TEXT (optional user display name)
- `onboarding_completed`: BOOLEAN (whether user has completed onboarding)
- `total_entries`: INTEGER (cached count of user's mood entries)
- `patterns_unlocked`: BOOLEAN (whether user has enough data for pattern analysis)
