import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useMoodStore } from '@/store/useMoodStore';
import { MoodEntry } from '@/types';

interface LogModalProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onSave: () => void;
}

export default function LogModal({ visible, x, y, onClose, onSave }: LogModalProps) {
  const { addEntry } = useMoodStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    whatHappened: '',
    whatFocusing: '',
    whatSaying: '',
    physicalSensations: '',
    title: '',
  });

  const questions = [
    {
      key: 'whatHappened',
      question: 'What just happened?',
      placeholder: 'Describe the event or situation...',
    },
    {
      key: 'whatFocusing',
      question: 'What am I focusing on right now?',
      placeholder: 'What thoughts or concerns have your attention?',
    },
    {
      key: 'whatSaying',
      question: 'What am I saying to myself?',
      placeholder: 'What internal dialogue is running?',
    },
    {
      key: 'physicalSensations',
      question: 'Physical sensations in my body?',
      placeholder: 'Tight chest, relaxed shoulders, butterflies...',
    },
  ];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    await addEntry({
      x,
      y,
      ...formData,
    });
    onSave();
    // Reset form
    setFormData({
      whatHappened: '',
      whatFocusing: '',
      whatSaying: '',
      physicalSensations: '',
      title: '',
    });
    setCurrentStep(0);
    onClose();
  };

  const handleSkip = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {questions.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <TextInput
              style={styles.input}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={formData[currentQuestion.key as keyof typeof formData]}
              onChangeText={(text) =>
                setFormData({ ...formData, [currentQuestion.key]: text })
              }
              autoFocus
            />

            {currentStep === questions.length - 1 && (
              <>
                <Text style={[styles.questionText, { marginTop: 24, fontSize: 18 }]}>
                  Optional: Add a title
                </Text>
                <TextInput
                  style={[styles.input, { minHeight: 50 }]}
                  placeholder="Quick summary..."
                  placeholderTextColor="#999"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === questions.length - 1 ? 'Save' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#6366F1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});



