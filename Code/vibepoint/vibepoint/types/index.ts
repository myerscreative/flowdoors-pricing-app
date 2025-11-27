export interface MoodEntry {
  id: string
  user_id: string
  timestamp: string
  created_at?: string // Database timestamp when entry was created
  // Core numeric mood coordinates (0–1 floats)
  happiness_level: number
  motivation_level: number
  // Free text responses
  focus: string
  self_talk: string
  physical_sensations: string
  // Optional emotion label (string or null)
  emotion_name?: string | null
  // Optional notes field (future use)
  notes?: string | null
  // Rapid shift tracking (entry throttling)
  is_rapid_shift?: boolean
  rapid_shift_context?: string | null
  minutes_since_last_entry?: number | null
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

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

export interface PatternInsight {
  type: 'correlation' | 'trend' | 'suggestion'
  title: string
  description: string
  confidence: number // 0-1
  related_entries?: MoodEntry[]
}

export interface MoodStats {
  total_entries: number
  entries_this_week: number
  average_happiness: number
  average_motivation: number
  most_common_focus: string
  patterns_unlocked: boolean
}

// Recipe types (Pro tier)
export interface RecipeStep {
  step: number
  focus: string
  instruction: string
  duration: number
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  target_emotion: string
  duration: string
  steps: RecipeStep[]
  why_this_works: string
  is_favorite: boolean
  use_count: number
  created_at: string
  last_used_at?: string | null
}

export interface RecipeInput {
  title: string
  target_emotion: string
  duration?: string
  steps: RecipeStep[]
  why_this_works: string
  is_favorite?: boolean
}
