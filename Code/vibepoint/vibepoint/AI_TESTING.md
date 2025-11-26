# AI Testing Guide for Vibepoint

This guide helps you test the AI-powered features in Vibepoint to ensure they work correctly before launch.

## Prerequisites

### 1. Environment Setup

Ensure your `.env.local` file contains:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

⚠️ Important: The Anthropic API key must have access to Claude models.

### 2. Minimum Data Requirements

AI features require:

- Pattern Analysis: Minimum 10 mood entries
- Emotion Recipes: Minimum 10 mood entries with varied data

## AI Features to Test

### Feature 1: AI-Powered Pattern Insights

**Location**: `/patterns` page → "Generate AI Insights" button

**What it does**: Analyzes mood entry patterns and provides personalized coaching insights.

**Test Steps**:

1. **Create Test Data** (if you don't have 10+ entries):
   - Log 10-15 diverse mood entries
   - Use different focus areas (work, relationships, exercise, etc.)
   - Vary self-talk and body states
   - Include both high and low mood states
   - Spread entries across different times of day

2. **Navigate to Patterns Page**:
   - Go to `/patterns`
   - Verify you see local pattern insights first (these are non-AI)
   - Scroll to "AI-Powered Insights" section (purple/pink gradient card)

3. **Generate Insights**:
   - Click "✨ Generate AI Insights" button
   - Should show loading spinner: "AI is analyzing your patterns..."
   - Wait 3-10 seconds (API call to Claude)

4. **Verify Output**:
   - ✅ Expected Results:
     - 3-5 insight cards appear
     - Each card has:
       - Type badge (discovery/pattern/suggestion/warning)
       - Emoji icon
       - Meaningful insight text (2-3 sentences)
     - Insights are personalized to your data
     - "🔄 Regenerate Insights" button appears

   - ❌ Common Errors:
     - "Failed to generate insights" - Check ANTHROPIC_API_KEY
     - "Not enough data" - Need 10+ entries
     - Timeout - Check API key permissions and rate limits

5. **Test Regeneration**:
   - Click "🔄 Regenerate Insights"
   - Should generate new insights (Claude is non-deterministic)
   - Compare to previous insights - should be different but relevant

**What to Look For**:
- **Relevance**: Do insights relate to your actual mood patterns?
- **Personalization**: Do they reference your specific focus areas?
- **Actionability**: Are suggestions concrete and doable?
- **Diversity**: Mix of discovery, pattern, and suggestion types
- **Quality**: Coherent, helpful language (not generic)

### Feature 2: Emotion Recipes (Pro)

**Location**: `/recipes` page or `/patterns` page teaser

**What it does**: Generates personalized 60-second exercises to shift emotional states.

**Test Steps**:

1. **Navigate to Recipe Player**:
   - Go to `/patterns` page
   - Click "Try an Emotion Recipe" card (pink/orange gradient)
   - OR go to `/recipes` and click "New"
   - Should land on `/recipe-player`

2. **Review Recipe Structure**:
   - ✅ Check that the recipe includes:
     - Title: "Your Confidence Recipe" (or similar)
     - Target emotion
     - Duration: "60 seconds"
     - 3 steps with specific instructions
     - Timer circle UI
     - "Why this works for you" explanation

3. **Test Player Functionality**:
   - **Step 1**: Click "Start" button
     - Timer should count down
     - Circle should animate (fill clockwise)
   - **Step 2**: Let timer run out OR click "Next →"
     - Should auto-advance to step 2
     - Instruction changes
   - **Step 3**: Click "Previous ←"
     - Should go back to step 1
     - Timer resets
   - **Step 4**: Click "Pause" during playback
     - Timer should freeze
     - Button changes to "Resume"
   - **Step 5**: Complete all 3 steps
     - Should show completion screen: "Recipe Complete! 🎉"
     - Options to "Log Your New State" or "Run Recipe Again"

4. **Test Navigation**:
   - "Log Your New State" → Should go to `/mood/log`
   - "Run Recipe Again" → Should reset to step 1
   - "Back to Recipes" → Should go to `/recipes`
   - Close button (✕) → Should go back

## Privacy & Data Testing

### Test Data Minimization

**Verify**:
1. Open browser DevTools → Network tab
2. Click "Generate AI Insights"
3. Find POST request to `/api/ai/analyze-patterns`
4. Check request payload

✅ Should send:
- Pattern summaries (e.g., "work appears 5 times with avg happiness 40%")
- Statistical aggregates
- General trends

❌ Should NOT send:
- Raw notes/thoughts from entries
- Personally identifiable information
- Exact timestamps
- Specific identifiable contexts

**Verification**: Check `lib/ai-utils.ts` → `stripPII()` function is working.

## Rate Limiting & Error Handling

### Test Rate Limits

Current Limits:
- 10 AI requests per hour per user

**Test Steps**:
1. Generate AI insights 10 times in a row (click regenerate)
2. On 11th attempt, should see error message
3. Wait 1 hour or check `last_ai_request` in database
4. Should be able to request again

### Test API Failures

**Simulate by**:
- Temporarily using invalid `ANTHROPIC_API_KEY`
- Or remove API key from environment

**Expected**:
- Friendly error message: "Failed to generate AI insights"
- No app crash
- Ability to try again
- Error logged to console (for debugging)

## Manual Quality Checks

### Insight Quality Rubric

For each AI-generated insight, rate:
- **Relevance** (1-5): Does it relate to my actual patterns?
- **Specificity** (1-5): Is it personalized vs. generic?
- **Actionability** (1-5): Can I actually do something with this?
- **Tone** (1-5): Is it supportive and non-judgmental?
- **Accuracy** (1-5): Does it correctly interpret my data?

**Target**: Average score 4+ across all dimensions.

### Recipe Quality Rubric

- **Clarity** (1-5): Are instructions clear and specific?
- **Feasibility** (1-5): Can I do this in 60 seconds?
- **Relevance** (1-5): Does it match target emotion?
- **Personalization** (1-5): Does it use my data patterns?
- **Effectiveness** (1-5): Did it help shift my state?

## Success Criteria

Before launching AI features, ensure:
- ✅ Pattern insights generate successfully 90%+ of time
- ✅ Insights are personalized and relevant (quality score 4+)
- ✅ No PII leaks in API requests
- ✅ Rate limiting works correctly
- ✅ Error messages are user-friendly
- ✅ Recipe player UI works smoothly
- ✅ Loading states are clear
- ✅ Response time < 10 seconds average
