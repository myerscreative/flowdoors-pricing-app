import { MoodEntry, Pattern, PatternInsight } from '@/types'

// Analyze mood entries to find patterns and correlations
export function analyzePatterns(entries: MoodEntry[]): Pattern[] {
  const patterns: Pattern[] = []

  if (entries.length < 10) {
    return patterns // Need minimum data for meaningful patterns
  }

  // Analyze focus patterns
  const focusPatterns = analyzeFocusPatterns(entries)
  patterns.push(...focusPatterns)

  // Analyze self-talk patterns
  const selfTalkPatterns = analyzeSelfTalkPatterns(entries)
  patterns.push(...selfTalkPatterns)

  // Analyze physical sensation patterns
  const physicalPatterns = analyzePhysicalPatterns(entries)
  patterns.push(...physicalPatterns)

  return patterns
}

// Generate insights from patterns and entries
export function generateInsights(entries: MoodEntry[], patterns: Pattern[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  if (entries.length < 10) {
    return [{
      type: 'suggestion',
      title: 'Keep tracking!',
      description: `You've logged ${entries.length} entries. Log ${10 - entries.length} more to unlock pattern analysis.`,
      confidence: 1.0
    }]
  }

  // Find happiness boosters
  const happinessBoosters = findHappinessBoosters(entries)
  insights.push(...happinessBoosters)

  // Find mood triggers
  const moodTriggers = findMoodTriggers(entries)
  insights.push(...moodTriggers)

  // Find body-mind correlations
  const bodyMindCorrelations = findBodyMindCorrelations(entries)
  insights.push(...bodyMindCorrelations)

  // Pattern-based insights
  const patternInsights = generatePatternInsights(patterns)
  insights.push(...patternInsights)

  return insights.sort((a, b) => b.confidence - a.confidence)
}

// Analyze focus-related patterns
function analyzeFocusPatterns(entries: MoodEntry[]): Pattern[] {
  const focusGroups: Record<string, { entries: MoodEntry[], avgHappiness: number, avgMotivation: number }> = {}

  entries.forEach(entry => {
    const focus = normalizeText(entry.focus)
    if (!focusGroups[focus]) {
      focusGroups[focus] = { entries: [], avgHappiness: 0, avgMotivation: 0 }
    }
    focusGroups[focus].entries.push(entry)
  })

  return Object.entries(focusGroups)
    .filter(([, group]) => group.entries.length >= 3) // Minimum 3 occurrences
    .map(([focus, group]) => {
      const avgHappiness = group.entries.reduce((sum, e) => sum + e.happiness_level, 0) / group.entries.length
      const avgMotivation = group.entries.reduce((sum, e) => sum + e.motivation_level, 0) / group.entries.length

      return {
        id: `focus-${Date.now()}-${Math.random()}`,
        user_id: group.entries[0].user_id,
        pattern_type: 'focus' as const,
        trigger_text: focus,
        avg_happiness: avgHappiness,
        avg_motivation: avgMotivation,
        occurrence_count: group.entries.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
}

// Analyze self-talk patterns
function analyzeSelfTalkPatterns(entries: MoodEntry[]): Pattern[] {
  const selfTalkGroups: Record<string, { entries: MoodEntry[], avgHappiness: number, avgMotivation: number }> = {}

  entries.forEach(entry => {
    const selfTalk = normalizeText(entry.self_talk)
    if (!selfTalkGroups[selfTalk]) {
      selfTalkGroups[selfTalk] = { entries: [], avgHappiness: 0, avgMotivation: 0 }
    }
    selfTalkGroups[selfTalk].entries.push(entry)
  })

  return Object.entries(selfTalkGroups)
    .filter(([, group]) => group.entries.length >= 3)
    .map(([selfTalk, group]) => {
      const avgHappiness = group.entries.reduce((sum, e) => sum + e.happiness_level, 0) / group.entries.length
      const avgMotivation = group.entries.reduce((sum, e) => sum + e.motivation_level, 0) / group.entries.length

      return {
        id: `self_talk-${Date.now()}-${Math.random()}`,
        user_id: group.entries[0].user_id,
        pattern_type: 'self_talk' as const,
        trigger_text: selfTalk,
        avg_happiness: avgHappiness,
        avg_motivation: avgMotivation,
        occurrence_count: group.entries.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
}

// Analyze physical sensation patterns
function analyzePhysicalPatterns(entries: MoodEntry[]): Pattern[] {
  const physicalGroups: Record<string, { entries: MoodEntry[], avgHappiness: number, avgMotivation: number }> = {}

  entries.forEach(entry => {
    const physical = normalizeText(entry.physical_sensations)
    if (!physicalGroups[physical]) {
      physicalGroups[physical] = { entries: [], avgHappiness: 0, avgMotivation: 0 }
    }
    physicalGroups[physical].entries.push(entry)
  })

  return Object.entries(physicalGroups)
    .filter(([, group]) => group.entries.length >= 3)
    .map(([physical, group]) => {
      const avgHappiness = group.entries.reduce((sum, e) => sum + e.happiness_level, 0) / group.entries.length
      const avgMotivation = group.entries.reduce((sum, e) => sum + e.motivation_level, 0) / group.entries.length

      return {
        id: `physical-${Date.now()}-${Math.random()}`,
        user_id: group.entries[0].user_id,
        pattern_type: 'physical' as const,
        trigger_text: physical,
        avg_happiness: avgHappiness,
        avg_motivation: avgMotivation,
        occurrence_count: group.entries.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
}

// Find what boosts happiness
function findHappinessBoosters(entries: MoodEntry[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Find focus areas with high happiness
  const focusHappiness = new Map<string, { total: number, count: number, avg: number }>()
  entries.forEach(entry => {
    const focus = normalizeText(entry.focus)
    const current = focusHappiness.get(focus) || { total: 0, count: 0, avg: 0 }
    current.total += entry.happiness_level
    current.count += 1
    current.avg = current.total / current.count
    focusHappiness.set(focus, current)
  })

  const happyFocus = Array.from(focusHappiness.entries())
    .filter(([, stats]) => stats.count >= 3 && stats.avg > 0.7)
    .sort(([,a], [,b]) => b.avg - a.avg)

  if (happyFocus.length > 0) {
    const [focus, stats] = happyFocus[0]
    insights.push({
      type: 'correlation',
      title: 'Your Happiness Booster',
      description: `When you focus on "${focus}", your happiness averages ${Math.round(stats.avg * 100)}%. This is ${Math.round((stats.avg - 0.5) * 100)}% above your baseline.`,
      confidence: Math.min(stats.count / 10, 1.0)
    })
  }

  return insights
}

// Find mood triggers (negative correlations)
function findMoodTriggers(entries: MoodEntry[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Find self-talk patterns with low happiness
  const selfTalkMood = new Map<string, { total: number, count: number, avg: number }>()
  entries.forEach(entry => {
    const selfTalk = normalizeText(entry.self_talk)
    const current = selfTalkMood.get(selfTalk) || { total: 0, count: 0, avg: 0 }
    current.total += entry.happiness_level
    current.count += 1
    current.avg = current.total / current.count
    selfTalkMood.set(selfTalk, current)
  })

  const negativeSelfTalk = Array.from(selfTalkMood.entries())
    .filter(([, stats]) => stats.count >= 3 && stats.avg < 0.4)
    .sort(([,a], [,b]) => a.avg - b.avg)

  if (negativeSelfTalk.length > 0) {
    const [selfTalk, stats] = negativeSelfTalk[0]
    insights.push({
      type: 'correlation',
      title: 'Mood Pattern Detected',
      description: `When you tell yourself "${selfTalk}", your happiness drops to ${Math.round(stats.avg * 100)}%. Consider reframing this thought.`,
      confidence: Math.min(stats.count / 10, 1.0)
    })
  }

  return insights
}

// Find body-mind correlations
function findBodyMindCorrelations(entries: MoodEntry[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Find physical sensations that predict low motivation
  const physicalMotivation = new Map<string, { total: number, count: number, avg: number }>()
  entries.forEach(entry => {
    const physical = normalizeText(entry.physical_sensations)
    const current = physicalMotivation.get(physical) || { total: 0, count: 0, avg: 0 }
    current.total += entry.motivation_level
    current.count += 1
    current.avg = current.total / current.count
    physicalMotivation.set(physical, current)
  })

  const lowMotivationPhysical = Array.from(physicalMotivation.entries())
    .filter(([, stats]) => stats.count >= 3 && stats.avg < 0.4)
    .sort(([,a], [,b]) => a.avg - b.avg)

  if (lowMotivationPhysical.length > 0) {
    const [physical, stats] = lowMotivationPhysical[0]
    insights.push({
      type: 'correlation',
      title: 'Body-Mind Connection',
      description: `"${physical}" appears when your motivation is at ${Math.round(stats.avg * 100)}%. Your body might be signaling something important.`,
      confidence: Math.min(stats.count / 10, 1.0)
    })
  }

  return insights
}

// Generate insights from stored patterns
function generatePatternInsights(patterns: Pattern[]): PatternInsight[] {
  const insights: PatternInsight[] = []

  // Find strongest positive patterns
  const positivePatterns = patterns
    .filter(p => p.avg_happiness > 0.7 || p.avg_motivation > 0.7)
    .sort((a, b) => (b.avg_happiness + b.avg_motivation) - (a.avg_happiness + a.avg_motivation))

  if (positivePatterns.length > 0) {
    const pattern = positivePatterns[0]
    const dimension = pattern.avg_happiness > pattern.avg_motivation ? 'happiness' : 'motivation'
    insights.push({
      type: 'trend',
      title: 'Your Winning Pattern',
      description: `Your ${pattern.pattern_type.replace('_', ' ')} "${pattern.trigger_text}" correlates with high ${dimension} (${Math.round(Math.max(pattern.avg_happiness, pattern.avg_motivation) * 100)}%).`,
      confidence: Math.min(pattern.occurrence_count / 15, 1.0)
    })
  }

  return insights
}

// Normalize text for pattern matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .substring(0, 100) // Limit length
}
