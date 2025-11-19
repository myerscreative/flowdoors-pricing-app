// Mood entry types
export interface MoodCoordinate {
  x: number; // 0-100: left (unmotivated) to right (motivated)
  y: number; // 0-100: top (happy) to bottom (unhappy)
}

export interface SentimentScores {
  focus_sentiment: number;
  self_talk_sentiment: number;
  physical_sentiment: number;
  notes_sentiment?: number;
  overall_sentiment: number;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  created_at: string;
  mood_x: number;
  mood_y: number;
  focus: string;
  self_talk: string;
  physical: string;
  notes?: string;
  focus_sentiment?: number;
  self_talk_sentiment?: number;
  physical_sentiment?: number;
  notes_sentiment?: number;
  overall_sentiment?: number;
}

export interface MoodEntryInput {
  mood_x: number;
  mood_y: number;
  focus: string;
  self_talk: string;
  physical: string;
  notes?: string;
  focus_sentiment?: number;
  self_talk_sentiment?: number;
  physical_sentiment?: number;
  notes_sentiment?: number;
  overall_sentiment?: number;
}

// Pattern analysis types
export interface FocusPattern {
  focus: string;
  count: number;
  avgHappiness: number;
  avgMotivation: number;
}

export interface Insight {
  type: 'positive' | 'warning' | 'neutral' | 'coaching';
  title: string;
  description: string;
  relatedEntries?: string[];
  suggestion?: string;
  actionItems?: string[];
}

export interface CoachingSuggestion {
  type: 'reframe' | 'celebrate' | 'explore' | 'practice';
  title: string;
  message: string;
  tips: string[];
  basedOn: 'sentiment' | 'pattern' | 'combination';
}

export interface UserStats {
  totalEntries: number;
  entriesThisWeek: number;
  mostCommonZone: string;
  topFocusAreas: FocusPattern[];
  insights: Insight[];
}

// UI state types
export interface OnboardingState {
  currentSlide: number;
  completed: boolean;
}

export interface GradientSelection {
  coordinate: MoodCoordinate;
  confirmed: boolean;
}

export interface QuestionProgress {
  currentQuestion: number;
  totalQuestions: number;
  answers: {
    focus?: string;
    selfTalk?: string;
    physical?: string;
  };
}
