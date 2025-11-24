import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import GradientBackground from '@/components/GradientBackground';
import Crosshair from '@/components/Crosshair';
import LogModal from '@/components/LogModal';
import Pin from '@/components/Pin';
import { useMoodStore } from '@/store/useMoodStore';
import { getQuadrantLabel } from '@/lib/utils';
// Confetti will be added later - using a simpler celebration for now

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRADIENT_SIZE = Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.6);

export default function HomeScreen() {
  const router = useRouter();
  const { settings, stats, updateSettings, entries } = useMoodStore();
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const gradientRef = useRef<View>(null);

  const handleGradientPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const x = Math.max(0, Math.min(1, locationX / GRADIENT_SIZE));
    const y = Math.max(0, Math.min(1, 1 - locationY / GRADIENT_SIZE)); // Invert Y so top = happy

    setSelectedPosition({ x, y });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (settings.firstLaunch) {
      updateSettings({ firstLaunch: false });
    }
    
    // Check for yellow quadrant streak (3 consecutive entries in top-right)
    const recentEntries = [...entries]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 2);
    
    if (selectedPosition && selectedPosition.y > 0.5 && selectedPosition.x >= 0.5) {
      const allYellow = recentEntries.every(e => e.y > 0.5 && e.x >= 0.5);
      if (allYellow && recentEntries.length >= 2) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  const handleNudge = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedPosition) return;
    
    const step = 0.02;
    const newPos = { ...selectedPosition };
    
    if (direction === 'up') newPos.y = Math.min(1, newPos.y + step);
    if (direction === 'down') newPos.y = Math.max(0, newPos.y - step);
    if (direction === 'left') newPos.x = Math.max(0, newPos.x - step);
    if (direction === 'right') newPos.x = Math.min(1, newPos.x + step);
    
    setSelectedPosition(newPos);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vibepoint</Text>
          {stats.streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{stats.streak}-day vibe streak 🔥</Text>
            </View>
          )}
        </View>

        {/* Main Gradient */}
        <View style={styles.gradientContainer}>
          <Pressable
            style={[styles.gradient, { width: GRADIENT_SIZE, height: GRADIENT_SIZE }]}
            onPress={handleGradientPress}
            ref={gradientRef}
          >
            <GradientBackground style={StyleSheet.absoluteFill} />
            
            {settings.showCrosshair && (
              <Crosshair width={GRADIENT_SIZE} height={GRADIENT_SIZE} />
            )}

            {selectedPosition && (
              <Pin
                x={selectedPosition.x * GRADIENT_SIZE}
                y={(1 - selectedPosition.y) * GRADIENT_SIZE}
                size={28}
                color="#FFFFFF"
                draggable={false}
              />
            )}
          </Pressable>

          {/* Nudge buttons */}
          {selectedPosition && (
            <View style={styles.nudgeContainer}>
              <View style={styles.nudgeRow}>
                <TouchableOpacity
                  style={styles.nudgeButton}
                  onPress={() => handleNudge('up')}
                >
                  <Text style={styles.nudgeText}>↑</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.nudgeRow}>
                <TouchableOpacity
                  style={styles.nudgeButton}
                  onPress={() => handleNudge('left')}
                >
                  <Text style={styles.nudgeText}>←</Text>
                </TouchableOpacity>
                <View style={{ width: 40 }} />
                <TouchableOpacity
                  style={styles.nudgeButton}
                  onPress={() => handleNudge('right')}
                >
                  <Text style={styles.nudgeText}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.nudgeRow}>
                <TouchableOpacity
                  style={styles.nudgeButton}
                  onPress={() => handleNudge('down')}
                >
                  <Text style={styles.nudgeText}>↓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Current selection label */}
          {selectedPosition && (
            <View style={styles.selectionLabel}>
              <Text style={styles.selectionText}>
                {getQuadrantLabel(selectedPosition.x, selectedPosition.y, settings.clinicalLabels)}
              </Text>
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.navButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/insights')}
            disabled={stats.totalEntries < 10}
          >
            <Text
              style={[
                styles.navButtonText,
                stats.totalEntries < 10 && styles.navButtonTextDisabled,
              ]}
            >
              Insights {stats.totalEntries < 10 && `(${10 - stats.totalEntries} more)`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.navButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LogModal
        visible={showModal}
        x={selectedPosition?.x || 0}
        y={selectedPosition?.y || 0}
        onClose={() => {
          setShowModal(false);
          setSelectedPosition(null);
        }}
        onSave={handleSave}
      />

      {showConfetti && (
        <View style={styles.confettiContainer}>
          <Text style={styles.confettiText}>🎉</Text>
        </View>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gradientContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradient: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  nudgeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  nudgeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nudgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  selectionLabel: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    opacity: 0.5,
  },
  confettiContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  confettiText: {
    fontSize: 100,
  },
});

