import { MoodEntry, MoodStats } from '@/types';
import { startOfDay, differenceInDays, isToday, isYesterday } from 'date-fns';

export function calculateStats(entries: MoodEntry[]): MoodStats {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      streak: 0,
      avgHappiness: 0,
      avgMotivation: 0,
      quadrantCounts: {
        topLeft: 0,
        topRight: 0,
        bottomLeft: 0,
        bottomRight: 0,
      },
    };
  }

  const avgHappiness = entries.reduce((sum, e) => sum + e.y, 0) / entries.length;
  const avgMotivation = entries.reduce((sum, e) => sum + e.x, 0) / entries.length;

  const quadrantCounts = {
    topLeft: 0,    // y > 0.5 && x < 0.5
    topRight: 0,   // y > 0.5 && x >= 0.5
    bottomLeft: 0, // y <= 0.5 && x < 0.5
    bottomRight: 0, // y <= 0.5 && x >= 0.5
  };

  entries.forEach((entry) => {
    if (entry.y > 0.5 && entry.x < 0.5) quadrantCounts.topLeft++;
    else if (entry.y > 0.5 && entry.x >= 0.5) quadrantCounts.topRight++;
    else if (entry.y <= 0.5 && entry.x < 0.5) quadrantCounts.bottomLeft++;
    else quadrantCounts.bottomRight++;
  });

  const streak = calculateStreak(entries);

  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const lastEntryDate = sortedEntries[0]?.timestamp;

  return {
    totalEntries: entries.length,
    streak,
    lastEntryDate,
    avgHappiness,
    avgMotivation,
    quadrantCounts,
  };
}

export function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((e) => startOfDay(new Date(e.timestamp)).getTime());

  const uniqueDays = Array.from(new Set(sortedEntries));
  if (uniqueDays.length === 0) return 0;

  // Check if most recent entry is today or yesterday
  const mostRecent = uniqueDays[0];
  const mostRecentDate = new Date(mostRecent);
  
  if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
    return 0; // Streak broken
  }

  let streak = 0;
  let currentDate = startOfDay(new Date()).getTime();

  for (const day of uniqueDays) {
    const dayDate = new Date(day);
    const expectedDate = new Date(currentDate);
    
    if (differenceInDays(expectedDate, dayDate) === streak) {
      streak++;
      currentDate = day;
    } else {
      break;
    }
  }

  return streak;
}

export function getQuadrantLabel(x: number, y: number, clinical: boolean): string {
  if (y > 0.5 && x < 0.5) {
    return clinical ? 'Happy • Unmotivated' : 'coastal grandmother';
  }
  if (y > 0.5 && x >= 0.5) {
    return clinical ? 'Happy • Motivated' : 'main character energy';
  }
  if (y <= 0.5 && x < 0.5) {
    return clinical ? 'Unhappy • Unmotivated' : 'rotting in goblin mode';
  }
  return clinical ? 'Unhappy • Motivated' : 'rage applying';
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}



