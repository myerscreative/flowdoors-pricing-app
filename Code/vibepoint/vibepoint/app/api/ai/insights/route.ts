import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { MoodEntry } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Rate limiting: 10 requests per day per user
const MAX_DAILY_REQUESTS = 10
const RATE_LIMIT_WINDOW_HOURS = 24

interface RateLimitCheck {
  allowed: boolean
  remaining: number
  resetAt?: Date
}

async function checkRateLimit(userId: string): Promise<RateLimitCheck> {
  const supabase = await createServerSupabaseClient()
  
  // Get user profile with AI request tracking
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is fine
    console.error('Rate limit check error:', error)
    return { allowed: false, remaining: 0 }
  }

  // If no profile exists, create one
  if (!profile) {
    await supabase
      .from('user_profiles')
      .insert({ id: userId, ai_request_count: 0 })
    return { allowed: true, remaining: MAX_DAILY_REQUESTS }
  }

  // Check if we need to reset the counter (24 hours passed)
  const now = new Date()
  const lastRequest = profile.last_ai_request 
    ? new Date(profile.last_ai_request) 
    : null

  let requestCount = profile.ai_request_count || 0
  let resetAt: Date | undefined

  if (lastRequest) {
    const hoursSinceLastRequest = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceLastRequest >= RATE_LIMIT_WINDOW_HOURS) {
      // Reset counter
      requestCount = 0
    } else {
      // Calculate when the window resets
      resetAt = new Date(lastRequest.getTime() + RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000)
    }
  }

  if (requestCount >= MAX_DAILY_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: resetAt || new Date(now.getTime() + RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000)
    }
  }

  return {
    allowed: true,
    remaining: MAX_DAILY_REQUESTS - requestCount,
    resetAt
  }
}

async function incrementRateLimit(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Fetch current count
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('ai_request_count')
    .eq('id', userId)
    .single()

  const currentCount = (profile?.ai_request_count as number) || 0
  const newCount = currentCount + 1
  
  // Update or insert profile
  await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      last_ai_request: new Date().toISOString(),
      ai_request_count: newCount
    }, {
      onConflict: 'id'
    })
}

function formatEntriesForAI(entries: MoodEntry[]): string {
  return entries
    .slice(0, 20) // Limit to most recent 20 for context
    .map((entry, idx) => {
      const happiness = Math.round(entry.happiness_level * 100)
      const motivation = Math.round(entry.motivation_level * 100)
      const date = new Date(entry.timestamp).toLocaleDateString()
      
      return `Entry ${idx + 1} (${date}):
- Mood: ${happiness}% happy, ${motivation}% motivated
- Focus: ${entry.focus}
- Self-talk: ${entry.self_talk}
- Physical sensations: ${entry.physical_sensations}`
    })
    .join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt?.toISOString()
        },
        { status: 429 }
      )
    }

    // Get request body
    const body = await request.json()
    const { entries, patterns } = body

    if (!entries || !Array.isArray(entries) || entries.length < 10) {
      return NextResponse.json(
        { error: 'At least 10 entries required for AI insights' },
        { status: 400 }
      )
    }

    // Format entries for AI
    const entriesText = formatEntriesForAI(entries as MoodEntry[])
    
    // Build prompt for Claude
    const prompt = `You are a compassionate mood analysis assistant helping someone understand their emotional patterns.

The user has logged ${entries.length} mood entries. Here are their recent entries:

${entriesText}

${patterns && patterns.length > 0 ? `\nDetected patterns:\n${patterns.map((p: any) => `- ${p.pattern_type}: "${p.trigger_text}" (appears ${p.occurrence_count} times, avg happiness: ${Math.round(p.avg_happiness * 100)}%, avg motivation: ${Math.round(p.avg_motivation * 100)}%)`).join('\n')}` : ''}

Please provide 2-3 personalized insights that:
1. Are empathetic and non-judgmental
2. Help the user understand connections between their focus, self-talk, physical sensations, and mood
3. Are actionable and specific to their data
4. Use a warm, supportive tone

Format your response as a JSON array of insight objects, each with:
- "title": A short, engaging title
- "description": 2-3 sentences explaining the insight
- "type": One of "correlation", "trend", or "suggestion"
- "confidence": A number between 0 and 1 indicating how confident you are

Example format:
[
  {
    "title": "Your Happiness Booster",
    "description": "When you focus on gratitude and positive self-talk, your happiness averages 85%. This pattern appears in 60% of your top mood entries.",
    "type": "correlation",
    "confidence": 0.9
  }
]

Return ONLY the JSON array, no other text.`

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract content from response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API')
    }

    // Parse JSON response
    let insights
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        insights = JSON.parse(content.text)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.text)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Increment rate limit counter
    await incrementRateLimit(user.id)

    return NextResponse.json({
      insights,
      remaining: rateLimit.remaining - 1,
      resetAt: rateLimit.resetAt?.toISOString()
    })

  } catch (error: any) {
    console.error('AI insights error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

