import Sentiment from 'sentiment';
import { SentimentScores, CoachingSuggestion } from '@/types';

const sentimentAnalyzer = new Sentiment();

/**
 * Analyze sentiment of text
 * Returns a score from -5 (very negative) to 5 (very positive)
 */
export function analyzeSentiment(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const result = sentimentAnalyzer.analyze(text);

  // Normalize score to -5 to 5 range
  // The sentiment library returns scores typically between -10 and 10
  const normalizedScore = Math.max(-5, Math.min(5, result.score / 2));

  return parseFloat(normalizedScore.toFixed(2));
}

/**
 * Analyze all text fields from a mood entry
 */
export function analyzeMoodSentiment(
  focus: string,
  selfTalk: string,
  physical: string,
  notes?: string
): SentimentScores {
  const focusSentiment = analyzeSentiment(focus);
  const selfTalkSentiment = analyzeSentiment(selfTalk);
  const physicalSentiment = analyzeSentiment(physical);
  const notesSentiment = notes ? analyzeSentiment(notes) : undefined;

  // Calculate overall sentiment (weighted average)
  // Self-talk has the highest weight as it's most indicative of emotional state
  const weights = {
    focus: 0.2,
    selfTalk: 0.5,
    physical: 0.3,
  };

  let overallSentiment =
    focusSentiment * weights.focus +
    selfTalkSentiment * weights.selfTalk +
    physicalSentiment * weights.physical;

  if (notesSentiment !== undefined) {
    // If notes exist, include them with 10% weight and adjust others
    overallSentiment = overallSentiment * 0.9 + notesSentiment * 0.1;
  }

  return {
    focus_sentiment: focusSentiment,
    self_talk_sentiment: selfTalkSentiment,
    physical_sentiment: physicalSentiment,
    notes_sentiment: notesSentiment,
    overall_sentiment: parseFloat(overallSentiment.toFixed(2)),
  };
}

/**
 * Get sentiment label for display
 */
export function getSentimentLabel(score: number): string {
  if (score >= 3) return 'Very Positive';
  if (score >= 1.5) return 'Positive';
  if (score >= 0.5) return 'Slightly Positive';
  if (score > -0.5) return 'Neutral';
  if (score > -1.5) return 'Slightly Negative';
  if (score > -3) return 'Negative';
  return 'Very Negative';
}

/**
 * Get coaching suggestions based on sentiment analysis
 */
export function getCoachingSuggestions(
  selfTalkSentiment: number,
  selfTalkText: string,
  overallSentiment: number
): CoachingSuggestion[] {
  const suggestions: CoachingSuggestion[] = [];

  // Negative self-talk detection
  if (selfTalkSentiment < -1) {
    const negativePatterns = [
      { pattern: /never|always|impossible|can't|won't/i, type: 'absolute' },
      { pattern: /should|must|ought to/i, type: 'prescriptive' },
      { pattern: /failure|failed|failing|stupid|worthless/i, type: 'harsh' },
    ];

    const detectedPatterns = negativePatterns.filter((p) =>
      p.pattern.test(selfTalkText)
    );

    if (detectedPatterns.length > 0) {
      suggestions.push({
        type: 'reframe',
        title: 'Notice Your Self-Talk',
        message:
          'Your inner voice seems critical right now. Reframing negative thoughts can shift your emotional experience.',
        tips: [
          'Replace "I can\'t" with "I haven\'t yet" or "I\'m learning to"',
          'Change "I should" to "I could" or "I choose to"',
          'Ask yourself: "Would I talk to a friend this way?"',
          'What would a supportive friend say to you right now?',
        ],
        basedOn: 'sentiment',
      });
    }
  }

  // Positive sentiment - celebrate and reinforce
  if (selfTalkSentiment > 2) {
    suggestions.push({
      type: 'celebrate',
      title: 'Your Mindset is Strong',
      message:
        'Your self-talk is constructive and empowering. This positive mindset is a valuable resource.',
      tips: [
        'Remember this feeling - you can return to it later',
        'Notice what led to this positive mindset',
        'Consider journaling to capture these thoughts',
        'Celebrate this moment of self-compassion',
      ],
      basedOn: 'sentiment',
    });
  }

  // Mismatch between mood and sentiment (emotional dissonance)
  if (overallSentiment > 1 && selfTalkSentiment < -1) {
    suggestions.push({
      type: 'explore',
      title: 'Interesting Contrast',
      message:
        'Your thoughts are more negative than your overall situation. This gap might be worth exploring.',
      tips: [
        'What evidence supports your negative thought?',
        'What evidence contradicts it?',
        'Is this thought based on facts or feelings?',
        'What would happen if you let go of this thought?',
      ],
      basedOn: 'combination',
    });
  }

  // Neutral/mixed sentiment - practice mindfulness
  if (Math.abs(overallSentiment) < 1 && Math.abs(selfTalkSentiment) < 1) {
    suggestions.push({
      type: 'practice',
      title: 'Ground Yourself',
      message:
        'You seem to be in a neutral space. This is a great time for grounding practices.',
      tips: [
        'Take 3 deep breaths, focusing on the exhale',
        'Notice 5 things you can see, 4 you can touch, 3 you can hear',
        'Check in with your body - where do you feel tension?',
        'Set an intention for how you want to feel next',
      ],
      basedOn: 'sentiment',
    });
  }

  return suggestions;
}

/**
 * Analyze sentiment trends over time
 */
export function analyzeSentimentTrends(sentimentScores: number[]): {
  trend: 'improving' | 'declining' | 'stable';
  average: number;
  volatility: number;
} {
  if (sentimentScores.length < 3) {
    return { trend: 'stable', average: 0, volatility: 0 };
  }

  const average =
    sentimentScores.reduce((sum, score) => sum + score, 0) /
    sentimentScores.length;

  // Calculate trend using linear regression slope
  const n = sentimentScores.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = sentimentScores.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * sentimentScores[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Calculate volatility (standard deviation)
  const variance =
    sentimentScores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) /
    n;
  const volatility = Math.sqrt(variance);

  let trend: 'improving' | 'declining' | 'stable';
  if (slope > 0.1) trend = 'improving';
  else if (slope < -0.1) trend = 'declining';
  else trend = 'stable';

  return {
    trend,
    average: parseFloat(average.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
  };
}

/**
 * Detect cognitive distortions in self-talk
 */
export function detectCognitiveDistortions(selfTalkText: string): {
  distortion: string;
  description: string;
  reframe: string;
}[] {
  const distortions: {
    distortion: string;
    description: string;
    reframe: string;
  }[] = [];

  const patterns = [
    {
      pattern: /always|never|everyone|no one|everything|nothing/i,
      distortion: 'All-or-Nothing Thinking',
      description: 'Seeing things in black and white categories',
      reframe: 'Try using "sometimes" or "often" instead of absolute terms',
    },
    {
      pattern: /should|must|ought to|have to/i,
      distortion: 'Should Statements',
      description: 'Trying to motivate yourself with rigid rules',
      reframe: 'Replace "should" with "could" or "want to" for more flexibility',
    },
    {
      pattern: /terrible|awful|horrible|worst|disaster/i,
      distortion: 'Catastrophizing',
      description: 'Expecting the worst possible outcome',
      reframe:
        'Ask: "What\'s the most likely outcome?" or "How bad would it really be?"',
    },
    {
      pattern: /I am|I'm.*(stupid|worthless|failure|loser|incompetent)/i,
      distortion: 'Labeling',
      description: 'Assigning global negative traits to yourself',
      reframe: 'Describe the specific behavior, not yourself as a person',
    },
  ];

  patterns.forEach((p) => {
    if (p.pattern.test(selfTalkText)) {
      distortions.push({
        distortion: p.distortion,
        description: p.description,
        reframe: p.reframe,
      });
    }
  });

  return distortions;
}
