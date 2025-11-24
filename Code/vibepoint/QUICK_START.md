# Vibepoint - Quick Start Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Initial Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest vibepoint --typescript --tailwind --app --no-src-dir
Which linter would you like to use? › ESLint
? Would you like to use React Compiler? › No / Yes
```

When prompted, choose:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: No (or default @/*)

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts
npm install zustand # optional, for state management
npm install date-fns # for date formatting
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- We'll reference auth.users

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

-- Create indexes for performance
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX idx_patterns_user_id ON patterns(user_id);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can view their own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own patterns"
  ON patterns FOR ALL
  USING (auth.uid() = user_id);
```

### 5. Project Structure

Create the following structure:

```
vibepoint/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── mood/
│   │   ├── page.tsx
│   │   └── questions/page.tsx
│   ├── history/page.tsx
│   └── patterns/page.tsx
├── components/
│   ├── GradientSelector.tsx
│   ├── QuestionForm.tsx
│   ├── MoodTimeline.tsx
│   └── PatternsDashboard.tsx
├── lib/
│   ├── supabase.ts
│   ├── patterns.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── public/
    └── gradient-reference.png
```

### 6. Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 7. Define Types

Create `types/index.ts`:

```typescript
export interface MoodEntry {
  id: string
  user_id: string
  timestamp: string
  happiness_level: number // 0-1
  motivation_level: number // 0-1
  focus: string
  self_talk: string
  physical_sensations: string
  notes?: string
  created_at: string
}

export interface Pattern {
  id: string
  user_id: string
  pattern_type: 'focus' | 'self_talk' | 'physical'
  trigger_text: string
  avg_happiness: number
  avg_motivation: number
  occurrence_count: number
  created_at: string
  updated_at: string
}

export interface MoodCoordinates {
  x: number // motivation (0-1)
  y: number // happiness (0-1)
}
```

## Development Workflow

### Phase 1: Build the Gradient Selector

Start with the core feature - the gradient mood selector:

1. Create `components/GradientSelector.tsx`
2. Implement click/touch handling
3. Calculate coordinates (0-1 range)
4. Display visual feedback

### Phase 2: Questions Form

1. Create `components/QuestionForm.tsx`
2. Three text inputs for focus, self-talk, physical sensations
3. Optional notes field
4. Submit to Supabase

### Phase 3: History View

1. Fetch user's mood entries
2. Display as timeline
3. Show mood gradient position
4. Allow filtering by date range

### Phase 4: Pattern Analysis

1. Implement pattern detection algorithms in `lib/patterns.ts`
2. Create dashboard to display insights
3. Show correlations and trends

## Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Configure Custom Domain

In Vercel dashboard:
1. Go to project settings
2. Domains tab
3. Add `vibepoint.app`
4. Follow DNS configuration instructions

## Key Implementation Tips

### Gradient Colors

Use CSS linear-gradient with multiple stops to create the mood gradient:

```css
background: linear-gradient(
  to bottom right,
  #87CEEB, /* top-left: happy + unmotivated (light blue) */
  #FFD700, /* top-right: happy + motivated (gold) */
  #4B0082, /* bottom-left: unhappy + unmotivated (indigo) */
  #8B0000  /* bottom-right: unhappy + motivated (dark red) */
);
```

### Capturing Coordinates

```typescript
const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width // motivation
  const y = 1 - (e.clientY - rect.top) / rect.height // happiness (inverted because top = happy)
  
  setMoodCoordinates({ x, y })
}
```

### Pattern Analysis

After 20+ entries, run analysis to find correlations:

```typescript
// Example: Find most common focus areas
const analyzePatterns = async (userId: string) => {
  const { data: entries } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
  
  // Group by focus, calculate average mood
  // Identify correlations
  // Store in patterns table
}
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Docs](https://recharts.org/)

## Need Help?

Refer to the full [PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md) for detailed specifications and implementation guidance.

---

**Ready to build Vibepoint!** 🎨✨
