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
