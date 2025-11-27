import { supabase } from './supabase'
import { MoodEntry } from '@/types'

/**
 * Get the user's most recent mood entry
 */
export async function getLastMoodEntry(userId: string): Promise<MoodEntry | null> {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching last mood entry:', error)
    return null
  }

  return data
}

/**
 * Count how many rapid shift entries the user has created today
 */
export async function countOverridesToday(userId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('mood_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_rapid_shift', true)
    .gte('created_at', startOfDay.toISOString())

  if (error) {
    console.error('Error counting overrides:', error)
    return 0
  }

  return count || 0
}

/**
 * Calculate minutes since a given timestamp
 */
export function calculateMinutesSince(timestamp: string): number {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  return Math.floor((now - then) / 60000)
}

/**
 * Check if user should be throttled and return throttle info
 */
export async function checkThrottle(userId: string): Promise<{
  shouldThrottle: boolean
  minutesSince: number | null
  overridesToday: number
  minutesUntilNext: number | null
}> {
  const lastEntry = await getLastMoodEntry(userId)
  const overridesToday = await countOverridesToday(userId)

  if (!lastEntry) {
    return {
      shouldThrottle: false,
      minutesSince: null,
      overridesToday,
      minutesUntilNext: null,
    }
  }

  // Use created_at for throttle checking (when entry was actually created)
  const timestampToUse = lastEntry.created_at || lastEntry.timestamp
  const minutesSince = calculateMinutesSince(timestampToUse)

  if (minutesSince < 30) {
    // User is within 30 minutes
    if (overridesToday >= 3) {
      // Hard limit reached
      return {
        shouldThrottle: true,
        minutesSince,
        overridesToday,
        minutesUntilNext: 30 - minutesSince,
      }
    }
    // Can override
    return {
      shouldThrottle: true,
      minutesSince,
      overridesToday,
      minutesUntilNext: null,
    }
  }

  // No throttle needed
  return {
    shouldThrottle: false,
    minutesSince,
    overridesToday,
    minutesUntilNext: null,
  }
}

