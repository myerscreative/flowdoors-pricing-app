import { MoodEntry } from '@/types'
import { differenceInCalendarDays, format, startOfWeek, endOfWeek, isWithinInterval, subDays } from 'date-fns'

export function formatDate(dateString: string) {
  return format(new Date(dateString), 'MMM d, yyyy')
}

export function formatDateShort(dateString: string) {
  return format(new Date(dateString), 'MMM d')
}

// Compute user streak (consecutive days with entries)
export function computeStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0

  let streak = 1
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i].timestamp)
    const next = new Date(sorted[i + 1].timestamp)

    const diff = differenceInCalendarDays(current, next)

    if (diff === 1) {
      streak++
    } else if (diff > 1) {
      break
    }
  }

  return streak
}

// Extract last N entries
export function lastN(entries: MoodEntry[], n: number): MoodEntry[] {
  return entries.slice(0, n)
}

// Mode (most common value)
export function mode(values: (string | undefined)[]): string | null {
  const counts: Record<string, number> = {}

  values.forEach(v => {
    if (!v) return
    const key = v.trim().toLowerCase()
    counts[key] = (counts[key] || 0) + 1
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return sorted.length > 0 ? sorted[0][0] : null
}

// Last 7 days of data for charts
export function getLastSeven(entries: MoodEntry[]) {
  return entries.slice(0, 7).reverse()
}

// Generate a simple insight
export function generateInsight(entries: MoodEntry[]): string {
  if (entries.length === 0) return "Log more entries to reveal insights."

  const lastEntries = entries.slice(0, 14)

  const focuses = lastEntries.map(e => e.focus.toLowerCase())
  const talks = lastEntries.map(e => e.self_talk.toLowerCase())
  const sensations = lastEntries.map(e => e.physical_sensations.toLowerCase())

  if (focuses.some(f => f.includes('money')))
    return "Money-related thoughts appear often and may influence your mood."

  if (talks.some(t => t.includes('should') || t.includes('not good enough')))
    return "Negative self-talk appears tied to lower happiness days."

  if (sensations.some(s => s.includes('chest') || s.includes('shoulder')))
    return "Physical tension around chest or shoulders appears on tougher days."

  return "Your mood patterns are developing—keep logging entries to unlock deeper insights."
}

// Get entries for this week
export function getThisWeekEntries(entries: MoodEntry[]): MoodEntry[] {
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  return entries.filter(entry =>
    isWithinInterval(new Date(entry.timestamp), { start: weekStart, end: weekEnd })
  )
}

// Get entries for last week
export function getLastWeekEntries(entries: MoodEntry[]): MoodEntry[] {
  const lastWeekStart = startOfWeek(subDays(new Date(), 7))
  const lastWeekEnd = endOfWeek(subDays(new Date(), 7))
  return entries.filter(entry =>
    isWithinInterval(new Date(entry.timestamp), { start: lastWeekStart, end: lastWeekEnd })
  )
}

// Get dominant emotion from entries (using mode)
export function getDominantEmotion(entries: MoodEntry[]): string | null {
  if (!entries || entries.length === 0) return null
  return mode(entries.map(e => e.emotion_name ?? undefined))
}

// Get color for mood coordinates (mini gradient)
export function getMoodColor(happiness: number, motivation: number): string {
  const corners = {
    topLeft: { r: 180, g: 220, b: 255 },
    topRight: { r: 255, g: 240, b: 50 },
    bottomLeft: { r: 40, g: 35, b: 45 },
    bottomRight: { r: 255, g: 20, b: 0 },
  }

  const x = motivation
  const y = 1 - happiness // Flip Y axis

  const r = Math.round(
    corners.topLeft.r * (1 - x) * (1 - y) +
    corners.topRight.r * x * (1 - y) +
    corners.bottomLeft.r * (1 - x) * y +
    corners.bottomRight.r * x * y
  )
  const g = Math.round(
    corners.topLeft.g * (1 - x) * (1 - y) +
    corners.topRight.g * x * (1 - y) +
    corners.bottomLeft.g * (1 - x) * y +
    corners.bottomRight.g * x * y
  )
  const b = Math.round(
    corners.topLeft.b * (1 - x) * (1 - y) +
    corners.topRight.b * x * (1 - y) +
    corners.bottomLeft.b * (1 - x) * y +
    corners.bottomRight.b * x * y
  )

  return `rgb(${r}, ${g}, ${b})`
}

// Get stable day index for rotating content
export function getDayIndex(): number {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % 365 // Rotate through year
}
