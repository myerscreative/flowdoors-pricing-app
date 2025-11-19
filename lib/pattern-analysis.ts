import { MoodEntry, FocusPattern, Insight, UserStats } from '@/types';
import { getMoodZone } from './mood-utils';
import { startOfWeek } from 'date-fns';

export function analyzePatterns(entries: MoodEntry[]): UserStats {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      entriesThisWeek: 0,
      mostCommonZone: 'No data yet',
      topFocusAreas: [],
      insights: [],
    };
  }

  // Count entries this week
  const weekStart = startOfWeek(new Date());
  const entriesThisWeek = entries.filter(
    (entry) => new Date(entry.created_at) >= weekStart
  ).length;

  // Find most common mood zone
  const zones: Record<string, number> = {};
  entries.forEach((entry) => {
    const zone = getMoodZone({ x: entry.mood_x, y: entry.mood_y });
    zones[zone] = (zones[zone] || 0) + 1;
  });

  const mostCommonZone =
    Object.entries(zones).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

  // Analyze focus areas
  const focusMap: Record<
    string,
    { count: number; totalHappiness: number; totalMotivation: number }
  > = {};

  entries.forEach((entry) => {
    const focus = entry.focus.toLowerCase().trim();
    if (!focus) return;

    if (!focusMap[focus]) {
      focusMap[focus] = { count: 0, totalHappiness: 0, totalMotivation: 0 };
    }

    focusMap[focus].count++;
    focusMap[focus].totalHappiness += 100 - entry.mood_y; // Invert Y (higher = happier)
    focusMap[focus].totalMotivation += entry.mood_x;
  });

  const topFocusAreas: FocusPattern[] = Object.entries(focusMap)
    .map(([focus, data]) => ({
      focus,
      count: data.count,
      avgHappiness: Math.round(data.totalHappiness / data.count),
      avgMotivation: Math.round(data.totalMotivation / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate insights
  const insights = generateInsights(entries, topFocusAreas);

  return {
    totalEntries: entries.length,
    entriesThisWeek,
    mostCommonZone,
    topFocusAreas,
    insights,
  };
}

function generateInsights(
  entries: MoodEntry[],
  focusAreas: FocusPattern[]
): Insight[] {
  const insights: Insight[] = [];

  // Not enough data for insights
  if (entries.length < 10) {
    return insights;
  }

  // Calculate average happiness and motivation
  const avgHappiness =
    entries.reduce((sum, e) => sum + (100 - e.mood_y), 0) / entries.length;
  const avgMotivation =
    entries.reduce((sum, e) => sum + e.mood_x, 0) / entries.length;

  // Insight 1: Best focus area
  if (focusAreas.length > 0) {
    const bestFocus = focusAreas.reduce((best, current) =>
      current.avgHappiness > best.avgHappiness ? current : best
    );

    if (bestFocus.avgHappiness > avgHappiness * 1.2) {
      insights.push({
        type: 'positive',
        title: 'Happiness Booster Found',
        description: `When you focus on "${bestFocus.focus}" your happiness is typically ${Math.round(
          ((bestFocus.avgHappiness - avgHappiness) / avgHappiness) * 100
        )}% higher than average.`,
        relatedEntries: entries
          .filter((e) => e.focus.toLowerCase() === bestFocus.focus.toLowerCase())
          .map((e) => e.id),
      });
    }
  }

  // Insight 2: Self-talk patterns
  if (entries.length >= 20) {
    const negativePatterns = ['should be', 'never', 'always fails', 'can\'t', 'impossible'];
    const patternCounts: Record<string, { count: number; avgHappiness: number }> = {};

    negativePatterns.forEach((pattern) => {
      const matchingEntries = entries.filter((e) =>
        e.self_talk.toLowerCase().includes(pattern)
      );

      if (matchingEntries.length >= 3) {
        const avgH =
          matchingEntries.reduce((sum, e) => sum + (100 - e.mood_y), 0) /
          matchingEntries.length;

        if (avgH < avgHappiness * 0.8) {
          patternCounts[pattern] = {
            count: matchingEntries.length,
            avgHappiness: avgH,
          };
        }
      }
    });

    const mostCommonNegative = Object.entries(patternCounts).sort(
      (a, b) => b[1].count - a[1].count
    )[0];

    if (mostCommonNegative) {
      insights.push({
        type: 'warning',
        title: 'Self-Talk Pattern Detected',
        description: `The phrase "${mostCommonNegative[0]}" appears in ${mostCommonNegative[1].count} entries with below-average happiness. Consider reframing this thought pattern.`,
      });
    }
  }

  // Insight 3: Physical sensations
  const physicalPatterns: Record<string, number[]> = {};

  entries.forEach((entry) => {
    const physical = entry.physical.toLowerCase();
    const happiness = 100 - entry.mood_y;

    Object.keys(physicalPatterns).forEach((key) => {
      if (physical.includes(key)) {
        physicalPatterns[key].push(happiness);
      }
    });

    // Check for common physical sensations
    const sensations = ['tense', 'relaxed', 'energized', 'tired', 'calm', 'restless'];
    sensations.forEach((sensation) => {
      if (physical.includes(sensation)) {
        if (!physicalPatterns[sensation]) {
          physicalPatterns[sensation] = [];
        }
        physicalPatterns[sensation].push(happiness);
      }
    });
  });

  // Find strong correlations
  Object.entries(physicalPatterns).forEach(([sensation, happinessScores]) => {
    if (happinessScores.length >= 5) {
      const avg =
        happinessScores.reduce((sum, h) => sum + h, 0) / happinessScores.length;

      if (avg > avgHappiness * 1.25) {
        insights.push({
          type: 'positive',
          title: 'Body Wisdom',
          description: `Feeling "${sensation}" appears in ${happinessScores.length} entries with above-average happiness. Your body knows what feels good!`,
        });
      } else if (avg < avgHappiness * 0.75) {
        insights.push({
          type: 'neutral',
          title: 'Body Signal',
          description: `"${sensation}" appears in ${happinessScores.length} entries with below-average happiness. This might be a signal worth noticing.`,
        });
      }
    }
  });

  // Limit to top 3 insights
  return insights.slice(0, 3);
}
