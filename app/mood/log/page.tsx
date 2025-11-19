'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GradientSelector from '@/components/GradientSelector';
import CoachingCard from '@/components/CoachingCard';
import { MoodCoordinate, CoachingSuggestion } from '@/types';
import { createMoodEntry } from '@/lib/db';
import { analyzeMoodSentiment, getCoachingSuggestions, detectCognitiveDistortions } from '@/lib/sentiment-analysis';

type Step = 'gradient' | 'question1' | 'question2' | 'question3' | 'notes' | 'success';

const suggestionChips = {
  focus: ['Work', 'Relationships', 'Health', 'Future', 'Past', 'Money', 'Exercise', 'Family'],
  physical: ['Tense', 'Relaxed', 'Energized', 'Tired', 'Restless', 'Calm', 'Comfortable', 'Uncomfortable'],
};

export default function LogMoodPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('gradient');
  const [moodCoord, setMoodCoord] = useState<MoodCoordinate | null>(null);
  const [focus, setFocus] = useState('');
  const [selfTalk, setSelfTalk] = useState('');
  const [physical, setPhysical] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [coachingSuggestions, setCoachingSuggestions] = useState<CoachingSuggestion[]>([]);
  const [showCoaching, setShowCoaching] = useState(false);
  const [cognitiveDistortions, setCognitiveDistortions] = useState<any[]>([]);

  const handleGradientSelect = (coord: MoodCoordinate) => {
    setMoodCoord(coord);
    setStep('question1');
  };

  const handleCancel = () => {
    router.push('/home');
  };

  const handleNext = () => {
    if (step === 'question1') {
      if (!focus.trim()) {
        setError('Please answer this question');
        return;
      }
      setError('');
      setStep('question2');
    } else if (step === 'question2') {
      if (!selfTalk.trim()) {
        setError('Please answer this question');
        return;
      }
      setError('');
      setStep('question3');
    } else if (step === 'question3') {
      if (!physical.trim()) {
        setError('Please answer this question');
        return;
      }
      setError('');
      setStep('notes');
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'question2') setStep('question1');
    else if (step === 'question3') setStep('question2');
    else if (step === 'notes') setStep('question3');
  };

  const handleSkipNotes = () => {
    handleSave();
  };

  // Analyze sentiment when self-talk changes
  useEffect(() => {
    if (selfTalk.trim().length > 10 && step === 'question2') {
      // Detect cognitive distortions in self-talk
      const distortions = detectCognitiveDistortions(selfTalk);
      setCognitiveDistortions(distortions);
    }
  }, [selfTalk, step]);

  // Generate coaching suggestions after question 3
  useEffect(() => {
    if (step === 'notes' && focus && selfTalk && physical) {
      const sentiments = analyzeMoodSentiment(focus, selfTalk, physical);
      const suggestions = getCoachingSuggestions(
        sentiments.self_talk_sentiment,
        selfTalk,
        sentiments.overall_sentiment
      );
      setCoachingSuggestions(suggestions);
      if (suggestions.length > 0) {
        setShowCoaching(true);
      }
    }
  }, [step, focus, selfTalk, physical]);

  const handleSave = async () => {
    if (!moodCoord) return;

    setSaving(true);
    setError('');

    // Analyze sentiment
    const sentiments = analyzeMoodSentiment(
      focus.trim(),
      selfTalk.trim(),
      physical.trim(),
      notes.trim() || undefined
    );

    const { error: saveError } = await createMoodEntry({
      mood_x: moodCoord.x,
      mood_y: moodCoord.y,
      focus: focus.trim(),
      self_talk: selfTalk.trim(),
      physical: physical.trim(),
      notes: notes.trim() || undefined,
      focus_sentiment: sentiments.focus_sentiment,
      self_talk_sentiment: sentiments.self_talk_sentiment,
      physical_sentiment: sentiments.physical_sentiment,
      notes_sentiment: sentiments.notes_sentiment,
      overall_sentiment: sentiments.overall_sentiment,
    });

    if (saveError) {
      setError(saveError.message || 'Failed to save mood entry');
      setSaving(false);
      return;
    }

    setStep('success');

    // Auto redirect after 2 seconds
    setTimeout(() => {
      router.push('/home');
    }, 2000);
  };

  const addChip = (value: string, field: 'focus' | 'physical') => {
    if (field === 'focus') {
      setFocus(value);
    } else {
      setPhysical(value);
    }
  };

  // Gradient selector
  if (step === 'gradient') {
    return (
      <GradientSelector
        onSelect={handleGradientSelect}
        onCancel={handleCancel}
        initialCoord={moodCoord || undefined}
      />
    );
  }

  // Success screen
  if (step === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mood logged!</h2>

            {/* Show small gradient preview */}
            {moodCoord && (
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden mood-gradient">
                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg"
                  style={{
                    left: `${moodCoord.x}%`,
                    top: `${moodCoord.y}%`,
                  }}
                />
              </div>
            )}

            <p className="text-gray-600 mb-6">Redirecting you back...</p>

            <button
              onClick={() => router.push('/home')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Home →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Question screens
  const questions = {
    question1: {
      number: 1,
      total: 3,
      question: 'What are you focusing on?',
      value: focus,
      setValue: setFocus,
      placeholder: 'e.g., Work deadline, morning routine, family time...',
      chips: suggestionChips.focus,
      chipField: 'focus' as const,
    },
    question2: {
      number: 2,
      total: 3,
      question: 'What are you telling yourself?',
      value: selfTalk,
      setValue: setSelfTalk,
      placeholder: 'e.g., "I can handle this" or "Nothing ever works out"...',
      chips: null,
      chipField: null,
    },
    question3: {
      number: 3,
      total: 3,
      question: 'What do you notice in your body?',
      value: physical,
      setValue: setPhysical,
      placeholder: 'e.g., Tension in shoulders, feeling energized...',
      chips: suggestionChips.physical,
      chipField: 'physical' as const,
    },
  };

  const currentQuestion = step in questions ? questions[step as keyof typeof questions] : null;

  if (currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion.number} of {currentQuestion.total}
                </span>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-smooth"
                  aria-label="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="mb-6">
              <textarea
                value={currentQuestion.value}
                onChange={(e) => currentQuestion.setValue(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-smooth resize-none"
                rows={4}
                autoFocus
              />
            </div>

            {/* Cognitive distortion detection (question 2 only) */}
            {step === 'question2' && cognitiveDistortions.length > 0 && (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-medium text-amber-900 flex items-center">
                  <span className="mr-2">💭</span>
                  Thought Pattern Detected
                </p>
                {cognitiveDistortions.map((distortion, index) => (
                  <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                    <p className="font-medium text-amber-900 mb-1">{distortion.distortion}</p>
                    <p className="text-amber-800 text-xs mb-2">{distortion.description}</p>
                    <p className="text-amber-700 text-xs">
                      <strong>Try:</strong> {distortion.reframe}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestion chips */}
            {currentQuestion.chips && currentQuestion.chipField && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => addChip(chip, currentQuestion.chipField!)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-smooth ${
                    i <= currentQuestion.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-3">
              {currentQuestion.number > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-smooth focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Notes screen
  if (step === 'notes') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Optional</span>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-smooth"
                  aria-label="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Anything else to remember?
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="mb-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or context..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-smooth resize-none"
                rows={6}
                autoFocus
              />
            </div>

            {/* Coaching Suggestions */}
            {showCoaching && coachingSuggestions.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <span className="mr-2">🧠</span>
                    Emotion Coach
                  </p>
                  <button
                    onClick={() => setShowCoaching(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Hide
                  </button>
                </div>
                {coachingSuggestions.map((suggestion, index) => (
                  <CoachingCard
                    key={index}
                    suggestion={suggestion}
                    onDismiss={() => {
                      const newSuggestions = coachingSuggestions.filter((_, i) => i !== index);
                      setCoachingSuggestions(newSuggestions);
                      if (newSuggestions.length === 0) {
                        setShowCoaching(false);
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {!showCoaching && coachingSuggestions.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCoaching(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <span className="mr-2">💡</span>
                  Show coaching suggestions ({coachingSuggestions.length})
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-smooth focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleSkipNotes}
                disabled={saving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Skip'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
