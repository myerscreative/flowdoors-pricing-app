# Vibepoint - Cursor Implementation Guide

## Project Overview
Vibepoint is a mood mapping application that teaches users to understand and control their emotional states by tracking the mental patterns that create their moods. The app uses an intuitive gradient interface where users plot their current mood, then answer reflective questions to build awareness of the thoughts, focus, and physical sensations driving their emotions.

**Core Philosophy:** Moods are created by controllable internal factors (what we focus on, what we tell ourselves, physical sensations) rather than external circumstances. By tracking these patterns over time, users learn to recognize and adjust the mental habits that shape their emotional experience.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context or Zustand (optional)
- **Charts:** Recharts

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### Key Libraries
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts
npm install date-fns
npm install zustand # optional
```

---

## Critical Design Decisions

### 1. Gradient Rendering - MUST USE CANVAS
**❌ DO NOT use CSS gradients** - they cannot achieve proper four-corner bilinear interpolation.

**✅ MUST use HTML5 Canvas** with pixel-level manipulation:
```typescript
// Required approach: Bilinear interpolation on Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);

// For each pixel, calculate color using bilinear interpolation
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const color = bilinearInterpolate(
      topLeft, topRight, bottomLeft, bottomRight,
      x / width, y / height
    );
    // Set pixel color in imageData
  }
}
```

**Gradient Corner Colors:**
- **Top-left** (happy + unmotivated): Cyan/Light Blue `#5BC0EB`
- **Top-right** (happy + motivated): Yellow/Gold `#FDE74C`
- **Bottom-left** (unhappy + unmotivated): Deep Blue/Indigo `#3A506B`
- **Bottom-right** (unhappy + motivated): Red/Coral `#E63946`

**Background Page Gradients** (separate from mood selector):
- Use soft CSS gradients: cyan → pink → cream → peach
- These are for aesthetic page backgrounds, NOT the mood selector

### 2. Pattern Insights Threshold
- **Start showing insights at 7 entries** (not 10)
- Rationale: Users need quick wins within first week
- Progressive disclosure:
  - 5 entries: "Your mood map" (scatter plot visualization)
  - 7 entries: "Early patterns emerging" (basic observations)
  - 15 entries: "Pattern correlations" (when X → then Y)
  - 30+ entries: "Deep insights" (multi-variable, predictive)

### 3. Multiple Daily Entries - Encouraged
- Users can log **multiple times per day** to track mood shifts
- Messaging: "Log whenever you notice your mood shift"
- This is a CORE FEATURE, not an edge case
- Mood shifts contain the richest learning data

### 4. Entry Throttling System

**30-minute minimum buffer between entries (soft limit):**

When user tries to log within 30 minutes:
```typescript
// Prompt shown:
"You logged a mood 12 minutes ago.

For clearer patterns, we recommend waiting at least 30 minutes between entries.

[Wait] [Log anyway]"
```

**Override mechanism:**
- Allow up to **3 overrides per day**
- If user selects [Log anyway], prompt:
```typescript
"Something significant just happened?

This will be marked as a rapid shift entry.

[What happened?]
[Optional text field]

[Cancel] [Save entry]"
```

**After 3 overrides in one day:**
```typescript
"You've logged 4 times in the last 2 hours.

For the clearest insights, try spacing entries at least 30 minutes apart. 
You can log again in 18 minutes.

[Okay]"
```

**Implementation:**
```typescript
interface MoodEntry {
  id: string
  user_id: string
  timestamp: string
  happiness_level: number // 0-1 (y coordinate)
  motivation_level: number // 0-1 (x coordinate)
  focus: string
  self_talk: string
  physical_sensations: string
  notes?: string
  
  // Rapid shift tracking
  is_rapid_shift?: boolean
  rapid_shift_context?: string
  minutes_since_last_entry?: number
  
  created_at: string
}
```

### 5. Automatic Mood Shift Detection

**DO NOT ask user to declare if entry is a "mood shift"** - app detects automatically.

**Detection logic:**
```typescript
const detectMoodShift = (lastEntry: MoodEntry, currentEntry: MoodEntry) => {
  // Only compare if last entry was within 6 hours
  const hoursSince = (currentEntry.timestamp - lastEntry.timestamp) / 3600000
  if (hoursSince > 6) return false
  
  // Calculate Euclidean distance on gradient
  const dx = currentEntry.motivation_level - lastEntry.motivation_level
  const dy = currentEntry.happiness_level - lastEntry.happiness_level
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Significant shift = 0.3+ on 0-1 scale (or quadrant change)
  return distance >= 0.3
}
```

**When shift detected, show after submission:**
```typescript
"Entry saved ✓

✨ Mood shift detected!
You moved from [anxious] → [energized]

[See what changed] [Got it]"
```

**Show side-by-side comparison:**
```typescript
2 hours ago:
• Focus: Tomorrow's presentation
• Self-talk: "What if I mess up?"
• Physical: Tight chest, shallow breathing

Now:
• Focus: Making progress on project
• Self-talk: "I'm handling this"
• Physical: Relaxed, energized
```

---

## Database Schema

### Tables

#### mood_entries
```sql
CREATE TABLE mood_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Mood coordinates (0-1 range)
  happiness_level FLOAT NOT NULL CHECK (happiness_level >= 0 AND happiness_level <= 1),
  motivation_level FLOAT NOT NULL CHECK (motivation_level >= 0 AND motivation_level <= 1),
  
  -- Three questions
  focus TEXT NOT NULL,
  self_talk TEXT NOT NULL,
  physical_sensations TEXT NOT NULL,
  notes TEXT,
  
  -- Rapid shift tracking
  is_rapid_shift BOOLEAN DEFAULT FALSE,
  rapid_shift_context TEXT,
  minutes_since_last_entry INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX idx_mood_entries_rapid_shift ON mood_entries(user_id, is_rapid_shift) WHERE is_rapid_shift = true;
```

#### patterns
```sql
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

CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_type ON patterns(user_id, pattern_type);
```

#### recipes (Premium feature)
```sql
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

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_effectiveness ON recipes(user_id, avg_rating DESC);
```

#### recipe_attempts (Premium feature)
```sql
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

CREATE INDEX idx_recipe_attempts_user_id ON recipe_attempts(user_id);
CREATE INDEX idx_recipe_attempts_recipe_id ON recipe_attempts(recipe_id);
CREATE INDEX idx_recipe_attempts_rating ON recipe_attempts(recipe_id, effectiveness_rating);
```

#### user_subscription (for Free vs Premium)
```sql
CREATE TABLE user_subscription (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subscription_user_id ON user_subscription(user_id);
```

---

## Free vs Premium Features

### Free Tier Features
✅ Unlimited mood logging  
✅ View mood history timeline  
✅ Mood map visualization (scatter plot of all entries)  
✅ Basic pattern insights (descriptive observations)  
✅ Automatic shift detection  
✅ 90-day history retention  

**Messaging to free users:**
"You're building awareness of what creates your moods. Upgrade to turn these patterns into actionable recipes."

### Premium Tier Features ($4.99/mo or $39.99/yr)
Everything in Free, plus:

✅ **"My Recipes"** - Save proven state-shift formulas  
✅ **"Up Your Vibe"** - Active recipe suggestions after low mood logs  
✅ **Recipe effectiveness tracking** - See what works best for you  
✅ **Adaptive learning** - Recipes improve based on your feedback  
✅ **Recipe builder** - Create custom recipes  
✅ **Advanced pattern insights** - Multi-variable correlations, time-of-day patterns  
✅ **Unlimited history retention**  
✅ **Priority support**  

---

## Premium Feature: "Up Your Vibe" Recipe System

### Trigger Conditions
After user logs a mood in:
- Bottom-left quadrant (unhappy + unmotivated), OR
- Bottom-right quadrant (unhappy + motivated), OR
- Significant drop from previous entry

### UI Flow

**1. After logging low mood:**
```typescript
"Entry saved ✓

🎯 Want to shift your vibe?

Based on your patterns, here's what typically works for you:

┌─────────────────────────────────┐
│ Try: "Quick Reset" recipe       │
│                                 │
│ • Focus on: One small task you  │
│   can complete right now        │
│ • Tell yourself: "I can handle  │
│   the next 10 minutes"          │
│ • Physically: 3 deep breaths,   │
│   stand up and stretch          │
│                                 │
│ This shift works for you 78%    │
│ of the time                     │
└─────────────────────────────────┘

[Try this recipe] [Not right now]"
```

**2. If user taps [Try this recipe]:**
```typescript
"Great! Give it a try.

We'll check back with you in 15 minutes.

[Got it]"
```

**3. Follow-up notification (15-30 min later):**
```typescript
"🔔 Vibe check

You tried the "Quick Reset" recipe 18 minutes ago.

Want to log how you're feeling now?

[Log my mood] [Not now]"
```

**4. After they log post-recipe mood:**
```typescript
"Entry saved ✓

📊 Recipe feedback

How well did "Quick Reset" work?

😞 ⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ⭐⭐⭐⭐⭐

Optional: What helped most?
○ The focus shift
○ The self-talk change
○ The physical adjustment
○ The combination

[Skip] [Submit]"
```

### Recipe Learning Algorithm

```typescript
const calculateRecipeEffectiveness = (userId: string, recipeId: string) => {
  const attempts = getRecipeAttempts(userId, recipeId)
  
  return {
    successRate: attempts.filter(a => a.effectiveness_rating >= 4).length / attempts.length,
    avgMoodImprovement: average(attempts.map(a => a.mood_improvement)),
    mostHelpfulIngredient: mode(attempts.map(a => a.most_helpful_ingredient)),
    timesUsed: attempts.length,
    lastUsed: max(attempts.map(a => a.created_at))
  }
}
```

### Recipe Refinement (After 5+ attempts)
```typescript
"📈 Recipe Update

We've learned more about what works for you!

Your "Quick Reset" recipe now emphasizes:
✨ Physical shifts (you rated this most helpful 4 out of 5 times)

Updated recipe:
• Start with: 3 deep breaths + stretch
• Then shift focus to: One completable task
• Tell yourself: "I can handle the next 10 minutes"

[Use updated version] [Keep original]"
```

---

## User Flow & Pages

### 1. Landing / Home Page
- Hero section with gradient preview
- Clear value proposition
- [Get Started] CTA

### 2. Auth Pages
- `/auth/login`
- `/auth/signup`
- Supabase Auth integration

### 3. Mood Entry Flow
**Page: `/mood`**
- Full-screen Canvas gradient selector
- User taps to select mood position
- Capture x,y coordinates (0-1 range)
- Visual indicator of selected position

**Page: `/mood/questions`**
- Three questions in sequence:
  1. "What are you focusing on?"
  2. "What are you telling yourself?"
  3. "What physical sensations are you experiencing?"
- Optional notes field
- [Save Entry] button

**Entry throttling logic:**
- Check time since last entry
- Show 30-min buffer message if needed
- Offer override option (max 3/day)

**After submission:**
- Check for mood shift
- If shift detected, show comparison
- If Premium + low mood, offer "Up Your Vibe" recipe

### 4. Dashboard
**Page: `/dashboard`**

**For Free Users:**
- Entry count and streak
- Quick "Log Mood" button
- Recent entries timeline
- Basic stats (avg mood, most common quadrant)
- Upgrade CTA for recipes

**For Premium Users:**
- All free features plus:
- "My Recipes" section (top performing recipes)
- Quick-access recipe buttons
- Recipe effectiveness stats

### 5. History View
**Page: `/history`**
- Timeline of all mood entries
- Filter by date range
- Mood map scatter plot
- Click entry to see details
- Rapid shift entries marked with ⚡ icon

### 6. Patterns Dashboard
**Page: `/patterns`**

**For Free Users (after 7 entries):**
- Mood distribution chart
- Most common focus areas
- Most frequent self-talk patterns
- Physical sensations frequency

**For Premium Users:**
- All free features plus:
- Correlation insights ("When X → then Y")
- Time-of-day patterns
- Multi-variable analysis
- Predictive signals

### 7. Recipes (Premium Only)
**Page: `/recipes`**
- Recipe library organized by:
  - Most Effective
  - Recently Used
  - By Situation (morning, work stress, etc.)
- Each recipe shows:
  - Name
  - Star rating (avg effectiveness)
  - Success rate percentage
  - Times used
  - [Use now] button
- [+ Create custom recipe] option

### 8. Explainer / Education Page
**Page: `/learn`**
- Educational content on emotion engineering
- Three ingredients breakdown (focus, language, physiology)
- Examples and illustrations
- Emphasis on mood shifts
- Calm, educational tone (not Tony Robbins motivational)

---

## Design System

### Typography
- **Headings:** Fraunces (serif) - elegant, distinctive
- **Body:** Outfit (sans-serif) - clean, readable
- Use font weights: 400 (regular), 600 (semibold), 700 (bold)

### Colors

**Mood Gradient Corners:**
```css
--mood-happy-unmotivated: #5BC0EB;    /* Cyan */
--mood-happy-motivated: #FDE74C;       /* Yellow */
--mood-unhappy-unmotivated: #3A506B;   /* Deep Blue */
--mood-unhappy-motivated: #E63946;     /* Red */
```

**UI Colors:**
```css
--bg-gradient-1: #5BC0EB; /* Cyan */
--bg-gradient-2: #FFC1E3; /* Pink */
--bg-gradient-3: #FFF4E0; /* Cream */
--bg-gradient-4: #FFDAB9; /* Peach */

--text-primary: #1A1A2E;
--text-secondary: #6B7280;
--accent: #FDE74C;
```

### Glassmorphism Effects
```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
}
```

### Responsive Breakpoints
```css
/* Mobile first */
@media (min-width: 480px) { /* Large phones */ }
@media (min-width: 640px) { /* Tablets */ }
@media (min-width: 800px) { /* Desktop */ }
```

---

## Component Architecture

### Core Components

#### `<GradientSelector />`
**Location:** `components/GradientSelector.tsx`

**Purpose:** Interactive Canvas-based gradient for mood selection

**Props:**
```typescript
interface GradientSelectorProps {
  onMoodSelect: (coordinates: { x: number; y: number }) => void;
  selectedPosition?: { x: number; y: number };
}
```

**Implementation:**
- Use HTML5 Canvas with bilinear interpolation
- Handle both click and touch events
- Show visual indicator at selected position
- Calculate coordinates: x = motivation (0-1), y = happiness (0-1)
- Y-axis is inverted: top = 1 (happy), bottom = 0 (unhappy)

#### `<QuestionForm />`
**Location:** `components/QuestionForm.tsx`

**Purpose:** Three-question form for mood entry

**Props:**
```typescript
interface QuestionFormProps {
  moodCoordinates: { x: number; y: number };
  onSubmit: (data: MoodEntryData) => Promise<void>;
}
```

**Fields:**
1. Focus (text area, required)
2. Self-talk (text area, required)
3. Physical sensations (text area, required)
4. Notes (text area, optional)

#### `<MoodTimeline />`
**Location:** `components/MoodTimeline.tsx`

**Purpose:** Display history of mood entries

**Features:**
- Chronological list of entries
- Show mood position with colored dot
- Expand to see full details
- Mark rapid shifts with ⚡ icon
- Detect shift between adjacent entries

#### `<RecipeCard />` (Premium)
**Location:** `components/RecipeCard.tsx`

**Purpose:** Display individual recipe with effectiveness stats

**Props:**
```typescript
interface RecipeCardProps {
  recipe: Recipe;
  effectiveness: RecipeEffectiveness;
  onUse: () => void;
}
```

#### `<UpYourVibe />` (Premium)
**Location:** `components/UpYourVibe.tsx`

**Purpose:** Suggest recipe after low mood entry

**Shows:**
- Recipe name and instructions
- Success rate for this user
- [Try this recipe] / [Not now] buttons

---

## Key Algorithms

### 1. Bilinear Color Interpolation
```typescript
function bilinearInterpolate(
  topLeft: RGB,
  topRight: RGB,
  bottomLeft: RGB,
  bottomRight: RGB,
  x: number, // 0-1
  y: number  // 0-1
): RGB {
  // Interpolate top edge
  const top = {
    r: topLeft.r * (1 - x) + topRight.r * x,
    g: topLeft.g * (1 - x) + topRight.g * x,
    b: topLeft.b * (1 - x) + topRight.b * x,
  };
  
  // Interpolate bottom edge
  const bottom = {
    r: bottomLeft.r * (1 - x) + bottomRight.r * x,
    g: bottomLeft.g * (1 - x) + bottomRight.g * x,
    b: bottomLeft.b * (1 - x) + bottomRight.b * x,
  };
  
  // Interpolate between top and bottom
  return {
    r: Math.round(top.r * y + bottom.r * (1 - y)),
    g: Math.round(top.g * y + bottom.g * (1 - y)),
    b: Math.round(top.b * y + bottom.b * (1 - y)),
  };
}
```

### 2. Mood Distance Calculation
```typescript
function calculateMoodDistance(
  mood1: { x: number; y: number },
  mood2: { x: number; y: number }
): number {
  const dx = mood2.x - mood1.x;
  const dy = mood2.y - mood1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

### 3. Pattern Detection
```typescript
async function detectPatterns(userId: string) {
  const entries = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(100);

  // Group by focus areas
  const focusPatterns = groupBy(entries.data, 'focus');
  
  // Calculate average mood for each focus area
  const patterns = Object.entries(focusPatterns).map(([focus, entries]) => {
    const avgHappiness = average(entries.map(e => e.happiness_level));
    const avgMotivation = average(entries.map(e => e.motivation_level));
    
    return {
      pattern_type: 'focus',
      trigger_text: focus,
      avg_happiness: avgHappiness,
      avg_motivation: avgMotivation,
      occurrence_count: entries.length
    };
  });
  
  // Store patterns in database
  // Repeat for self_talk and physical_sensations
}
```

### 4. Recipe Suggestion Algorithm
```typescript
function suggestRecipe(
  currentEntry: MoodEntry,
  userRecipes: Recipe[],
  recipeAttempts: RecipeAttempt[]
): Recipe | null {
  // Filter recipes suitable for current mood quadrant
  const suitableRecipes = userRecipes.filter(recipe => {
    return isInMoodRange(currentEntry, recipe.best_for_mood_range);
  });
  
  // Calculate effectiveness for each recipe
  const scoredRecipes = suitableRecipes.map(recipe => {
    const attempts = recipeAttempts.filter(a => a.recipe_id === recipe.id);
    const effectiveness = calculateRecipeEffectiveness(recipe.id, attempts);
    
    return {
      recipe,
      score: effectiveness.successRate * 0.7 + 
             (effectiveness.avgMoodImprovement / 1.414) * 0.3 // Normalize distance
    };
  });
  
  // Return highest scoring recipe
  scoredRecipes.sort((a, b) => b.score - a.score);
  return scoredRecipes[0]?.recipe || null;
}
```

---

## Development Workflow

### Git Branch Strategy
- `main` - production-ready code
- Feature branches - individual features
- Commit directly to main for personal project (simpler workflow)

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET_KEY=your_stripe_key # for Premium subscriptions
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Development Phases

**Phase 1: Core Functionality (MVP)**
1. ✅ Gradient Canvas component with bilinear interpolation
2. ✅ Three-question form
3. ✅ Supabase schema and auth
4. ✅ Basic mood entry storage
5. ✅ History timeline view
6. ✅ Entry throttling (30-min buffer, 3 overrides/day)

**Phase 2: Pattern Recognition**
1. Automatic shift detection
2. Pattern analysis algorithms
3. Patterns dashboard (free tier)
4. Progressive insight unlocking (7, 15, 30 entries)

**Phase 3: Premium Features**
1. Subscription system (Stripe)
2. Recipe creation and storage
3. "Up Your Vibe" suggestion system
4. Recipe effectiveness tracking
5. Feedback loop and adaptive learning
6. Recipe refinement after 5+ attempts

**Phase 4: Polish & Optimization**
1. Responsive design refinements
2. Loading states and error handling
3. Onboarding flow
4. Educational explainer page
5. Performance optimization
6. PWA features (offline support, notifications)

---

## Critical Implementation Notes

### ⚠️ Canvas Gradient - Do Not Skip This
The gradient MUST be rendered using Canvas with mathematical bilinear interpolation. CSS gradients will NOT work correctly for four-corner blending. Reference the gradient image in `/public/gradientreference.png` for the correct appearance.

### ⚠️ Entry Throttling is Important
The 30-minute buffer and 3-override limit are critical for data quality. Do not skip this logic. Rapid shift entries should be tagged separately (`is_rapid_shift: true`) for later analysis.

### ⚠️ Premium Recipe System is Core Value
The "Up Your Vibe" recipe system with feedback loops is what makes Premium worth paying for. This is not a "nice to have"—it's the primary monetization feature. Implement the full learning loop.

### ⚠️ Mobile-First Design
Most users will log moods on mobile. The gradient selector must work perfectly on touch devices. Test extensively on actual phones, not just browser DevTools.

### ⚠️ Privacy and Data Ownership
Users need to trust this app with sensitive emotional data. Emphasize privacy in copy, make data export easy, and never share data with third parties.

---

## Testing Checklist

### Gradient Selector
- [ ] Canvas renders with correct four-corner colors
- [ ] Bilinear interpolation produces smooth gradient (no banding)
- [ ] Click events capture correct x,y coordinates
- [ ] Touch events work on mobile
- [ ] Visual indicator shows selected position
- [ ] Matches reference image (`gradientreference.png`)

### Entry Throttling
- [ ] 30-minute buffer message appears correctly
- [ ] Override option works (max 3/day)
- [ ] After 3 overrides, hard limit enforced
- [ ] Rapid shift context captured when override used
- [ ] `minutes_since_last_entry` recorded accurately

### Mood Shift Detection
- [ ] Detects shifts >0.3 distance on gradient
- [ ] Only compares entries within 6 hours
- [ ] Shows before/after comparison correctly
- [ ] Works for entries logged same day
- [ ] Doesn't trigger false positives

### Pattern Insights
- [ ] No insights shown before 7 entries
- [ ] Basic insights appear at 7 entries
- [ ] Correlation insights appear at 15 entries
- [ ] Calculations are accurate (avg happiness, motivation)
- [ ] Free users see descriptive patterns only

### Premium Recipe System
- [ ] "Up Your Vibe" appears after low mood logs (Premium only)
- [ ] Recipe suggestions match user's mood context
- [ ] Follow-up notification sent after 15-30 min
- [ ] Feedback captured (rating 1-5, most helpful ingredient)
- [ ] Recipe effectiveness calculated correctly
- [ ] Recipes refine after 5+ attempts
- [ ] Free users see upgrade prompt, not recipes

### General UX
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Loading states during database operations
- [ ] Error handling for failed requests
- [ ] Success confirmations after actions
- [ ] Smooth transitions and animations
- [ ] Consistent design system (colors, typography, spacing)

---

## Deployment

### Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - STRIPE_SECRET_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Custom Domain
1. Go to Vercel project settings
2. Domains tab
3. Add `vibepoint.app`
4. Configure DNS (A/CNAME records)

### Supabase Production
- Enable Row Level Security on all tables
- Set up proper policies (users only see their own data)
- Enable email confirmations for auth
- Configure CORS for production domain

---

## Future Enhancements (Post-Launch)

### Phase 5: Advanced Features
- [ ] Reminders/notifications (gentle, not intrusive)
- [ ] Home screen widget for quick logging
- [ ] Data export (CSV, JSON)
- [ ] Insights PDF report generation
- [ ] Weekly/monthly email summaries (opt-in)

### Phase 6: Social Features (Optional)
- [ ] Share individual insights (not raw data)
- [ ] Anonymous community insights (aggregated patterns)
- [ ] Therapist/coach sharing (with explicit permission)

### Phase 7: Integrations
- [ ] Apple Health / Google Fit integration (sleep, activity data)
- [ ] Calendar integration (correlate moods with events)
- [ ] Wearable device integration (heart rate, HRV)

---

## Support & Documentation

### User Support
- In-app help section with FAQs
- Email support: support@vibepoint.app
- For Premium users: Priority response within 24 hours

### Developer Documentation
- This Cursor implementation guide
- `PROJECT_INSTRUCTIONS.md` - original project specification
- `QUICK_START.md` - setup and development workflow
- Inline code comments for complex logic (bilinear interpolation, pattern detection)

---

## Contact & Resources
- **Domain:** vibepoint.app
- **Repository:** myerscreative/vibepoint
- **Design Assets:** `/public/gradientreference.png`
- **Tech Stack:** Next.js + TypeScript + Supabase + Vercel

---

**This guide should be treated as the source of truth for implementation decisions. When in doubt, refer back to this document.**

**Last Updated:** November 2024
