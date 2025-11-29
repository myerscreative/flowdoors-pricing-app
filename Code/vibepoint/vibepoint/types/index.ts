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

// Recipe types (Pro tier) - New schema
export interface RecipeStep {
  id: string
  recipe_id: string
  order_index: number
  title: string
  description: string
  duration: number // seconds
  created_at: string
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  description: string
  total_duration: number // total seconds
  is_favorite: boolean
  created_at: string
  updated_at: string
  recipe_steps?: RecipeStep[] // populated when fetching with steps
  // Effectiveness tracking (optional, may not be present if recipe hasn't been used)
  times_used?: number
  success_count?: number
  avg_rating?: number
}

export interface RecipeInput {
  title: string
  description: string
  total_duration: number
  is_favorite?: boolean
  steps: Omit<RecipeStep, 'id' | 'recipe_id' | 'created_at'>[]
}
