/**
 * Streak tracking utilities
 * Calculates current streak and longest streak from mood entries
 */

import { MoodEntry } from '@/types';
import { startOfDay, differenceInDays } from 'date-fns';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: Date | null;
  streakActive: boolean; // True if logged today or yesterday
}

/**
 * Calculate current and longest streak from mood entries
 */
export function calculateStreak(entries: MoodEntry[]): StreakInfo {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null,
      streakActive: false,
    };
  }

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get unique days (one entry per day)
  const uniqueDays = new Set<string>();
  sortedEntries.forEach((entry) => {
    const dayString = startOfDay(new Date(entry.timestamp)).toISOString();
    uniqueDays.add(dayString);
  });

  const sortedDays = Array.from(uniqueDays)
    .map((day) => new Date(day))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfDay(new Date());
  const lastEntryDay = sortedDays[0];
  const daysSinceLastEntry = differenceInDays(today, lastEntryDay);

  // Current streak
  let currentStreak = 0;
  const streakActive = daysSinceLastEntry <= 1; // Logged today or yesterday

  if (streakActive) {
    let expectedDay = startOfDay(new Date());
    if (daysSinceLastEntry === 1) {
      // If last entry was yesterday, start counting from yesterday
      expectedDay.setDate(expectedDay.getDate() - 1);
    }

    for (const day of sortedDays) {
      if (differenceInDays(expectedDay, day) === 0) {
        currentStreak++;
        expectedDay.setDate(expectedDay.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < sortedDays.length - 1; i++) {
    const dayDiff = differenceInDays(sortedDays[i], sortedDays[i + 1]);

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastEntryDate: lastEntryDay,
    streakActive,
  };
}

/**
 * Get encouraging message based on streak
 */
export function getStreakMessage(streak: number, streakActive: boolean): string {
  if (!streakActive) {
    return "Start a new streak today! 🌟";
  }

  if (streak === 1) {
    return "Great start! 🌱";
  }

  if (streak < 7) {
    return `${streak} days in a row! 🔥`;
  }

  if (streak < 30) {
    return `${streak}-day streak! You're building a powerful habit! 💪`;
  }

  if (streak < 100) {
    return `${streak} days strong! Incredible consistency! 🏆`;
  }

  return `${streak} days! You're a mood tracking master! 👑`;
}
