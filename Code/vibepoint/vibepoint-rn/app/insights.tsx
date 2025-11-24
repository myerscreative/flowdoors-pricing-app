import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import { useMoodStore } from '@/store/useMoodStore';
import { formatDate } from '@/lib/utils';
import { MoodEntry } from '@/types';

export default function InsightsScreen() {
  const router = useRouter();
  const { entries, stats } = useMoodStore();

  const insights = useMemo(() => {
    if (entries.length < 10) return null;

    // Analyze patterns
    const focusPatterns: Record<string, { count: number; avgHappiness: number; avgMotivation: number }> = {};
    const selfTalkPatterns: Record<string, { count: number; avgHappiness: number; avgMotivation: number }> = {};
    const physicalPatterns: Record<string, { count: number; avgHappiness: number; avgMotivation: number }> = {};

    entries.forEach((entry) => {
      // Analyze focus
      if (entry.whatFocusing) {
        const keywords = entry.whatFocusing.toLowerCase().split(/\s+/);
        keywords.forEach((keyword) => {
          if (keyword.length > 3) {
            if (!focusPatterns[keyword]) {
              focusPatterns[keyword] = { count: 0, avgHappiness: 0, avgMotivation: 0 };
            }
            focusPatterns[keyword].count++;
            focusPatterns[keyword].avgHappiness += entry.y;
            focusPatterns[keyword].avgMotivation += entry.x;
          }
        });
      }

      // Analyze self-talk
      if (entry.whatSaying) {
        const keywords = entry.whatSaying.toLowerCase().split(/\s+/);
        keywords.forEach((keyword) => {
          if (keyword.length > 3) {
            if (!selfTalkPatterns[keyword]) {
              selfTalkPatterns[keyword] = { count: 0, avgHappiness: 0, avgMotivation: 0 };
            }
            selfTalkPatterns[keyword].count++;
            selfTalkPatterns[keyword].avgHappiness += entry.y;
            selfTalkPatterns[keyword].avgMotivation += entry.x;
          }
        });
      }

      // Analyze physical sensations
      if (entry.physicalSensations) {
        const sensations = entry.physicalSensations.toLowerCase().split(/[,\s]+/);
        sensations.forEach((sensation) => {
          if (sensation.length > 2) {
            if (!physicalPatterns[sensation]) {
              physicalPatterns[sensation] = { count: 0, avgHappiness: 0, avgMotivation: 0 };
            }
            physicalPatterns[sensation].count++;
            physicalPatterns[sensation].avgHappiness += entry.y;
            physicalPatterns[sensation].avgMotivation += entry.x;
          }
        });
      }
    });

    // Calculate averages and find top patterns
    Object.keys(focusPatterns).forEach((key) => {
      const pattern = focusPatterns[key];
      pattern.avgHappiness /= pattern.count;
      pattern.avgMotivation /= pattern.count;
    });

    Object.keys(selfTalkPatterns).forEach((key) => {
      const pattern = selfTalkPatterns[key];
      pattern.avgHappiness /= pattern.count;
      pattern.avgMotivation /= pattern.count;
    });

    Object.keys(physicalPatterns).forEach((key) => {
      const pattern = physicalPatterns[key];
      pattern.avgHappiness /= pattern.count;
      pattern.avgMotivation /= pattern.count;
    });

    // Find most common patterns
    const topFocus = Object.entries(focusPatterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const topSelfTalk = Object.entries(selfTalkPatterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const topPhysical = Object.entries(physicalPatterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    // Time-based patterns
    const hourEntries: Record<number, number[]> = {};
    const dayEntries: Record<number, number[]> = {};

    entries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const day = date.getDay();

      if (!hourEntries[hour]) hourEntries[hour] = [];
      if (!dayEntries[day]) dayEntries[day] = [];

      hourEntries[hour].push(entry.y);
      dayEntries[day].push(entry.y);
    });

    const bestHour = Object.entries(hourEntries)
      .map(([hour, values]) => ({
        hour: parseInt(hour),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .sort((a, b) => b.avg - a.avg)[0];

    const bestDay = Object.entries(dayEntries)
      .map(([day, values]) => ({
        day: parseInt(day),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .sort((a, b) => b.avg - a.avg)[0];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      topFocus,
      topSelfTalk,
      topPhysical,
      bestHour,
      bestDay: { name: dayNames[bestDay.day], avg: bestDay.avg },
    };
  }, [entries]);

  if (entries.length < 10) {
    return (
      <GradientBackground style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedTitle}>Insights Unlocked at 10 Entries</Text>
            <Text style={styles.lockedText}>
              You need {10 - entries.length} more entries to see your patterns
            </Text>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Your Insights</Text>
        <Text style={styles.subtitle}>{stats.totalEntries} entries analyzed</Text>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(stats.avgHappiness * 100)}%</Text>
              <Text style={styles.statLabel}>Avg Happiness</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(stats.avgMotivation * 100)}%</Text>
              <Text style={styles.statLabel}>Avg Motivation</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Time Patterns */}
        {insights && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Patterns</Text>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  You're happiest around {insights.bestHour.hour}:00 ({Math.round(insights.bestHour.avg * 100)}% avg)
                </Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  {insights.bestDay.name}s are your best days ({Math.round(insights.bestDay.avg * 100)}% avg happiness)
                </Text>
              </View>
            </View>

            {/* Focus Patterns */}
            {insights.topFocus.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Focus Patterns</Text>
                {insights.topFocus.slice(0, 3).map(([keyword, data]) => (
                  <View key={keyword} style={styles.insightCard}>
                    <Text style={styles.insightText}>
                      When focusing on "{keyword}" → {Math.round(data.avgHappiness * 100)}% happiness,{' '}
                      {Math.round(data.avgMotivation * 100)}% motivation ({data.count}x)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Physical Sensations */}
            {insights.topPhysical.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Patterns</Text>
                {insights.topPhysical.slice(0, 3).map(([sensation, data]) => (
                  <View key={sensation} style={styles.insightCard}>
                    <Text style={styles.insightText}>
                      "{sensation}" appears with {Math.round(data.avgHappiness * 100)}% avg happiness ({data.count}x)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quadrant Distribution */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quadrant Distribution</Text>
              <View style={styles.quadrantGrid}>
                <View style={styles.quadrantCard}>
                  <Text style={styles.quadrantLabel}>Happy • Motivated</Text>
                  <Text style={styles.quadrantValue}>{stats.quadrantCounts.topRight}</Text>
                </View>
                <View style={styles.quadrantCard}>
                  <Text style={styles.quadrantLabel}>Happy • Unmotivated</Text>
                  <Text style={styles.quadrantValue}>{stats.quadrantCounts.topLeft}</Text>
                </View>
                <View style={styles.quadrantCard}>
                  <Text style={styles.quadrantLabel}>Unhappy • Motivated</Text>
                  <Text style={styles.quadrantValue}>{stats.quadrantCounts.bottomRight}</Text>
                </View>
                <View style={styles.quadrantCard}>
                  <Text style={styles.quadrantLabel}>Unhappy • Unmotivated</Text>
                  <Text style={styles.quadrantValue}>{stats.quadrantCounts.bottomLeft}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  insightText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  quadrantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quadrantCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quadrantLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  quadrantValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});



