# Vibepoint App - Project Instructions

## Project Overview
Vibepoint is a mood mapping application that teaches users to understand and control their emotional states by tracking the mental patterns that create their moods. The app uses an intuitive gradient interface where users plot their current mood, then answer reflective questions to build awareness of the thoughts, focus, and physical sensations driving their emotions.

## Core Concept
The app operates on the principle that moods are created by controllable internal factors (what we focus on, what we tell ourselves, physical sensations) rather than external circumstances. By tracking these patterns over time, users learn to recognize and adjust the mental habits that shape their emotional experience.

## Visual Interface

### Gradient Screen
- **Vertical Axis**: Happy (top) to Unhappy (bottom)
- **Horizontal Axis**: Unmotivated (left) to Motivated (right)
- **Interaction**: User taps/clicks on the gradient to select the point that best represents their current mood
- **Visual**: Smooth color gradient transitioning through the mood spectrum

### Color Mapping
- Top-right (happy + motivated): Bright, energetic colors (yellows, oranges)
- Top-left (happy + unmotivated): Calm, content colors (light blues, soft yellows)
- Bottom-right (unhappy + motivated): Tense, driven colors (deep purples, burgundy)
- Bottom-left (unhappy + unmotivated): Low-energy colors (dark blues, deep purples)

## User Flow

### 1. Mood Selection
- User opens app
- Presented with full-screen gradient
- Taps location that matches current mood
- Mood coordinates are recorded (x: motivation level, y: happiness level)

### 2. Reflective Questions
After mood selection, user answers three core questions:

**Question 1: What are you focusing on?**
- What thoughts, situations, or concerns have your attention?
- Examples: "my upcoming deadline", "argument with partner", "vacation plans"
- Allow free-text entry
- Optional: Suggest common categories (work, relationships, health, future, past, etc.)

**Question 2: What are you telling yourself?**
- What internal dialogue or self-talk is running?
- Examples: "I can't handle this", "Everything will work out", "I'm not good enough"
- Free-text entry
- This captures the narrative/interpretation layer

**Question 3: What physical sensations are you experiencing?**
- What do you notice in your body?
- Examples: "tight chest", "relaxed shoulders", "butterflies in stomach", "energized"
- Free-text or checkbox options
- Common sensations: tension, relaxation, energy, fatigue, restlessness, calm, pain, lightness

### 3. Save & Confirm
- Brief confirmation message
- Option to add notes
- Timestamp recorded
- Return to home screen

## Data Tracking & Analysis

### Data Points Per Entry
- Timestamp
- Mood coordinates (x, y)
- Focus content (text)
- Self-talk content (text)
- Physical sensations (text/tags)
- Optional notes

### Pattern Recognition Features

**After 10+ Entries:**
- Show user their mood map (scatter plot of all mood selections on gradient)
- Identify most common mood zones

**After 20+ Entries:**
- Begin showing correlations:
  - "When you focus on [work deadlines], you tend to be in the [bottom-right quadrant]"
  - "When you tell yourself [positive affirmations], your mood averages [higher on happiness scale]"
  - "Physical sensation [tight chest] appears in [% of unhappy entries]"

**Pattern Insights Display:**
- "Your Patterns" dashboard
- Top 5 focus areas and their associated mood ranges
- Most common self-talk phrases and their mood correlations
- Physical sensations that predict mood states
- Visual charts showing these relationships

**Actionable Insights:**
- "Notice: When you focus on 'things you're grateful for', your mood is typically in the top-left (happy, calm) zone"
- "Pattern detected: Telling yourself 'I should be better' correlates with lower happiness scores"
- "Your body knows: 'Tension in shoulders' appears in 80% of your unmotivated entries"

## Key Features

### 1. Quick Entry
- Fast, low-friction mood logging
- Can complete full entry in under 60 seconds
- No overwhelming forms or lengthy questionnaires

### 2. Progressive Insights
- Insights unlock as data accumulates
- Early: Simple mood tracking
- Medium: Pattern identification
- Advanced: Predictive awareness and suggestions

### 3. Mood Literacy Education
- Brief tips explaining how focus, self-talk, and physical state create emotions
- Educational content delivered gradually
- Not preachy—discovery-based learning from user's own data

### 4. Privacy First
- All data stored locally or with end-to-end encryption
- User owns their data
- Optional export functionality
- No social features (this is personal work)

## Technical Requirements

### Frontend
- Responsive gradient interface (works on mobile and desktop)
- Smooth touch/click interaction on gradient
- Clean, minimal UI
- Data visualization for patterns (charts, graphs)
- Timeline view of mood entries

### Backend
- Database to store mood entries
- Pattern analysis algorithms
- Text analysis for identifying recurring themes in focus/self-talk
- API for CRUD operations on mood data

### Data Privacy
- Secure authentication
- Encrypted data storage
- GDPR/privacy compliance
- No third-party data sharing

## Development Phases

### Phase 1: MVP
- Gradient mood selection interface
- Three reflective questions
- Basic data storage
- Timeline view of past entries
- Simple statistics (average mood, total entries)

### Phase 2: Pattern Recognition
- Data analysis algorithms
- Pattern correlation engine
- "Your Patterns" dashboard
- Basic insights generation

### Phase 3: Advanced Insights
- Predictive patterns ("When you focus on X, you tend to feel Y")
- Personalized suggestions
- Trend analysis over time
- Export and reporting features

### Phase 4: Enhancement
- Reminders/notifications (gentle, not intrusive)
- Widget for quick mood logging
- Advanced visualization options
- Educational content library

## Success Metrics
- Daily active usage (goal: users check in 1-2x daily)
- Insight engagement (users viewing patterns dashboard)
- Behavior change indicators (mood patterns improving over time)
- User retention (continued use after 30, 60, 90 days)

## Design Principles
1. **Simplicity**: No clutter, fast interaction
2. **Non-judgmental**: All moods are valid data points
3. **Empowering**: Focus on user agency and control
4. **Private**: Safe space for honest self-reflection
5. **Educational**: Teach through personal discovery, not lectures
6. **Beautiful**: Gradient interface should be aesthetically pleasing

## User Experience Goals
- User feels this takes less effort than traditional journaling
- User experiences "aha moments" when seeing their patterns
- User feels empowered rather than analyzed
- User develops genuine mood awareness and control skills
- App becomes a tool for self-mastery, not just tracking

## Technology Stack Recommendations

### Recommended Stack
- **Frontend Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Charts/Visualization**: Recharts or Chart.js
- **State Management**: React Context or Zustand

### Alternative Stack Options
- **Mobile-First**: React Native with Expo
- **Database Alternative**: Firebase (if real-time features needed)
- **Deployment Alternative**: Railway or Render

## Database Schema

### Tables

#### users
```sql
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
- updated_at (timestamp)
```

#### mood_entries
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- timestamp (timestamp)
- happiness_level (float, 0-1) -- y coordinate
- motivation_level (float, 0-1) -- x coordinate
- focus (text)
- self_talk (text)
- physical_sensations (text)
- notes (text, nullable)
- created_at (timestamp)
```

#### patterns (generated insights)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- pattern_type (enum: 'focus', 'self_talk', 'physical')
- trigger_text (text) -- the focus/self-talk/sensation
- avg_happiness (float)
- avg_motivation (float)
- occurrence_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

## File Structure
```
vibepoint/
├── README.md
├── PROJECT_INSTRUCTIONS.md
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.local
├── public/
│   └── gradient-reference.png
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── mood/
│   │   │   ├── page.tsx (gradient selector)
│   │   │   └── questions/
│   │   │       └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── patterns/
│   │       └── page.tsx
│   ├── components/
│   │   ├── GradientSelector.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── MoodTimeline.tsx
│   │   ├── PatternsDashboard.tsx
│   │   └── InsightCard.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── patterns.ts (pattern analysis logic)
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       ├── useMoodEntries.ts
│       └── usePatterns.ts
└── supabase/
    ├── migrations/
    └── seed.sql
```

## Next Steps for Development

### Setup Phase
1. ✅ Create project directory and instructions
2. Initialize Next.js project with TypeScript
3. Set up Supabase project and get credentials
4. Configure environment variables
5. Install dependencies (Tailwind, Recharts, etc.)
6. Copy gradient reference image to public folder

### Development Phase 1: Core Functionality
1. Create gradient selector component
2. Implement mood coordinate capture
3. Build reflective questions form
4. Set up Supabase authentication
5. Create database tables and migrations
6. Implement mood entry storage
7. Build timeline/history view

### Development Phase 2: Analysis & Insights
1. Develop pattern analysis algorithms
2. Create patterns dashboard
3. Build insight generation system
4. Add data visualization components
5. Implement correlation detection

### Development Phase 3: Polish & Deploy
1. Responsive design refinements
2. Add loading states and error handling
3. Implement data export
4. Set up Vercel deployment
5. User testing and iteration
6. Performance optimization

---

## Contact & Resources
- Domain: vibepoint.app
- Repository: [To be created]
- Design Assets: Gradient reference image included
- Documentation: This file

## Notes for Developer
- Focus on mobile-first design (most users will log moods on phone)
- Keep the gradient interaction smooth and responsive
- Ensure questions feel conversational, not clinical
- Privacy is paramount—make users feel safe
- Insights should feel like discoveries, not judgments
- The goal is empowerment through awareness
