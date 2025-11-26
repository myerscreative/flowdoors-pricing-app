import { MoodEntry, Pattern, PatternInsight } from '@/types'

interface AIInsight {
  title: string
  description: string
  type: 'correlation' | 'trend' | 'suggestion'
  confidence: number
}

interface AIInsightsResponse {
  insights: AIInsight[]
  remaining: number
  resetAt?: string
}

/**
 * Fetch AI-powered insights from the API
 * Falls back to algorithmic insights if AI is unavailable
 */
export async function fetchAIInsights(
  entries: MoodEntry[],
  patterns: Pattern[]
): Promise<PatternInsight[]> {
  // Only use AI if we have enough entries
  if (entries.length < 10) {
    return []
  }

  try {
    const response = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entries: entries.slice(0, 50), // Send most recent 50 entries
        patterns: patterns.slice(0, 20), // Send top 20 patterns
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - return empty array, will use algorithmic insights
        console.log('AI rate limit reached, using algorithmic insights')
        return []
      }
      throw new Error(`AI insights API error: ${response.status}`)
    }

    const data: AIInsightsResponse = await response.json()
    
    // Convert AI insights to PatternInsight format
    return data.insights.map(insight => ({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
    }))
  } catch (error) {
    console.error('Failed to fetch AI insights:', error)
    // Fall back to algorithmic insights
    return []
  }
}

/**
 * Get combined insights (AI + algorithmic)
 * AI insights are prioritized if available
 */
export async function getCombinedInsights(
  entries: MoodEntry[],
  patterns: Pattern[],
  algorithmicInsights: PatternInsight[]
): Promise<PatternInsight[]> {
  // Try to get AI insights first
  const aiInsights = await fetchAIInsights(entries, patterns)
  
  // If we have AI insights, use them (they're more personalized)
  if (aiInsights.length > 0) {
    // Combine AI insights with top algorithmic insights
    const combined = [...aiInsights, ...algorithmicInsights.slice(0, 2)]
    // Sort by confidence and remove duplicates
    return combined
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Return top 5 insights
  }
  
  // Fall back to algorithmic insights
  return algorithmicInsights
}


