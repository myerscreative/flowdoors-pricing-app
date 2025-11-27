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
  emotion_name TEXT,
  
  -- Rapid shift tracking
  is_rapid_shift BOOLEAN DEFAULT FALSE,
  rapid_shift_context TEXT,
  minutes_since_last_entry INTEGER,
  
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

-- Recipes table (Premium feature)
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  
  -- Recipe instructions
  focus_shift TEXT NOT NULL,
  self_talk_shift TEXT NOT NULL,
  physiology_shift TEXT NOT NULL,
  
  -- Context for when to use
  best_for_mood_range TEXT, -- e.g., "bottom-left quadrant"
  best_for_situation TEXT, -- e.g., "morning slump", "work stress"
  
  -- Effectiveness tracking
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0, -- times rated 4+ stars
  avg_rating FLOAT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe attempts table (Premium feature)
CREATE TABLE recipe_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  
  -- Context
  triggered_after_entry_id UUID REFERENCES mood_entries(id),
  starting_mood_x FLOAT, -- motivation level at start
  starting_mood_y FLOAT, -- happiness level at start
  
  -- Results
  completed BOOLEAN DEFAULT FALSE,
  follow_up_entry_id UUID REFERENCES mood_entries(id),
  ending_mood_x FLOAT,
  ending_mood_y FLOAT,
  
  -- User feedback
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  most_helpful_ingredient TEXT CHECK (most_helpful_ingredient IN ('focus', 'self_talk', 'physiology', 'combination')),
  user_notes TEXT,
  
  -- Calculated
  mood_improvement FLOAT, -- Euclidean distance moved
  time_to_shift INTEGER, -- Minutes between start and follow-up
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscription table (for Free vs Premium)
CREATE TABLE user_subscription (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX idx_mood_entries_rapid_shift ON mood_entries(user_id, is_rapid_shift) WHERE is_rapid_shift = true;
CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_type ON patterns(user_id, pattern_type);
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_effectiveness ON recipes(user_id, avg_rating DESC);
CREATE INDEX idx_recipe_attempts_user_id ON recipe_attempts(user_id);
CREATE INDEX idx_recipe_attempts_recipe_id ON recipe_attempts(recipe_id);
CREATE INDEX idx_recipe_attempts_rating ON recipe_attempts(recipe_id, effectiveness_rating);
CREATE INDEX idx_user_subscription_user_id ON user_subscription(user_id);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscription ENABLE ROW LEVEL SECURITY;

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

-- Recipes policies
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recipes"
  ON recipes FOR ALL
  USING (auth.uid() = user_id);

-- Recipe attempts policies
CREATE POLICY "Users can view their own recipe attempts"
  ON recipe_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recipe attempts"
  ON recipe_attempts FOR ALL
  USING (auth.uid() = user_id);

-- User subscription policies
CREATE POLICY "Users can view their own subscription"
  ON user_subscription FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription"
  ON user_subscription FOR ALL
  USING (auth.uid() = user_id);
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
3. You should see the following tables:
   - `mood_entries`
   - `patterns`
   - `user_profiles`
   - `recipes` (Premium feature)
   - `recipe_attempts` (Premium feature)
   - `user_subscription` (Free vs Premium)
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
- `emotion_name`: TEXT (optional user-provided name for the emotion/mood)
- `is_rapid_shift`: BOOLEAN (true if logged within 30 minutes of previous entry)
- `rapid_shift_context`: TEXT (optional context for rapid shift entries)
- `minutes_since_last_entry`: INTEGER (minutes since last entry, if rapid shift)

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

### Recipe (Premium Feature)
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `name`: TEXT (recipe name)
- `focus_shift`: TEXT (instructions for focus shift)
- `self_talk_shift`: TEXT (instructions for self-talk shift)
- `physiology_shift`: TEXT (instructions for physical shift)
- `best_for_mood_range`: TEXT (e.g., "bottom-left quadrant")
- `best_for_situation`: TEXT (e.g., "morning slump", "work stress")
- `times_used`: INTEGER (how many times recipe has been used)
- `success_count`: INTEGER (times rated 4+ stars)
- `avg_rating`: FLOAT (average effectiveness rating)
- `is_active`: BOOLEAN (whether recipe is currently active)

### RecipeAttempt (Premium Feature)
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `recipe_id`: UUID (references recipes)
- `triggered_after_entry_id`: UUID (mood entry that triggered recipe)
- `starting_mood_x`: FLOAT (motivation level at start)
- `starting_mood_y`: FLOAT (happiness level at start)
- `completed`: BOOLEAN (whether user completed the recipe)
- `follow_up_entry_id`: UUID (mood entry after recipe attempt)
- `ending_mood_x`: FLOAT (motivation level after recipe)
- `ending_mood_y`: FLOAT (happiness level after recipe)
- `effectiveness_rating`: INTEGER (1-5 star rating)
- `most_helpful_ingredient`: TEXT ('focus', 'self_talk', 'physiology', or 'combination')
- `user_notes`: TEXT (optional user feedback)
- `mood_improvement`: FLOAT (Euclidean distance moved on gradient)
- `time_to_shift`: INTEGER (minutes between start and follow-up)

### UserSubscription
- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users, unique)
- `tier`: TEXT ('free' or 'premium')
- `subscription_start`: TIMESTAMPTZ (when subscription started)
- `subscription_end`: TIMESTAMPTZ (when subscription ends, null for active)
