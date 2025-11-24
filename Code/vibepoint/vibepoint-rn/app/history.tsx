import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import Pin from '@/components/Pin';
import { useMoodStore } from '@/store/useMoodStore';
import { formatDate, getQuadrantLabel } from '@/lib/utils';
import { MoodEntry } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRADIENT_SIZE = Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.6);

export default function HistoryScreen() {
  const router = useRouter();
  const { entries, settings, deleteEntry } = useMoodStore();
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  // Calculate pin sizes based on recency (newer = larger)
  const getPinSize = (entry: MoodEntry, index: number) => {
    const daysSince = (Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) return 12;
    if (daysSince < 7) return 10;
    if (daysSince < 30) return 8;
    return 6;
  };

  // Calculate opacity based on age
  const getOpacity = (entry: MoodEntry) => {
    const daysSince = (Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) return 1;
    if (daysSince < 7) return 0.8;
    if (daysSince < 30) return 0.6;
    return 0.4;
  };

  const handlePinPress = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>{sortedEntries.length} entries</Text>
        </View>

        {/* Gradient with pins */}
        <View style={styles.gradientContainer}>
          <View
            style={[styles.gradient, { width: GRADIENT_SIZE, height: GRADIENT_SIZE }]}
          >
            <GradientBackground style={StyleSheet.absoluteFill} />
            
            {sortedEntries.map((entry, index) => (
              <Pressable
                key={entry.id}
                onPress={() => handlePinPress(entry)}
                style={[
                  {
                    position: 'absolute',
                    left: entry.x * GRADIENT_SIZE - getPinSize(entry, index) / 2,
                    top: (1 - entry.y) * GRADIENT_SIZE - getPinSize(entry, index) / 2,
                    opacity: getOpacity(entry),
                  },
                ]}
              >
                <View
                  style={[
                    styles.historyPin,
                    {
                      width: getPinSize(entry, index),
                      height: getPinSize(entry, index),
                      borderRadius: getPinSize(entry, index) / 2,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Entry list */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {sortedEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => handlePinPress(entry)}
            >
              <View style={styles.entryHeader}>
                <Text style={styles.entryLabel}>
                  {getQuadrantLabel(entry.x, entry.y, settings.clinicalLabels)}
                </Text>
                <Text style={styles.entryDate}>{formatDate(entry.timestamp)}</Text>
              </View>
              {entry.title && (
                <Text style={styles.entryTitle}>{entry.title}</Text>
              )}
              {(entry.whatHappened || entry.whatFocusing || entry.whatSaying) && (
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {entry.whatHappened || entry.whatFocusing || entry.whatSaying}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Entry details modal */}
      {showDetails && selectedEntry && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {getQuadrantLabel(selectedEntry.x, selectedEntry.y, settings.clinicalLabels)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDetails(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDate}>{formatDate(selectedEntry.timestamp)}</Text>

              {selectedEntry.title && (
                <Text style={styles.modalSectionTitle}>Title</Text>
              )}
              {selectedEntry.title && (
                <Text style={styles.modalText}>{selectedEntry.title}</Text>
              )}

              {selectedEntry.whatHappened && (
                <>
                  <Text style={styles.modalSectionTitle}>What just happened?</Text>
                  <Text style={styles.modalText}>{selectedEntry.whatHappened}</Text>
                </>
              )}

              {selectedEntry.whatFocusing && (
                <>
                  <Text style={styles.modalSectionTitle}>What am I focusing on?</Text>
                  <Text style={styles.modalText}>{selectedEntry.whatFocusing}</Text>
                </>
              )}

              {selectedEntry.whatSaying && (
                <>
                  <Text style={styles.modalSectionTitle}>What am I saying to myself?</Text>
                  <Text style={styles.modalText}>{selectedEntry.whatSaying}</Text>
                </>
              )}

              {selectedEntry.physicalSensations && (
                <>
                  <Text style={styles.modalSectionTitle}>Physical sensations</Text>
                  <Text style={styles.modalText}>{selectedEntry.physicalSensations}</Text>
                </>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  deleteEntry(selectedEntry.id);
                  setShowDetails(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 8,
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
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  gradientContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
  historyPin: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  entryDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  entryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  entryPreview: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
  },
  modalDate: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});



