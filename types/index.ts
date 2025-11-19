// Mood entry types
export interface MoodCoordinate {
  x: number; // 0-100: left (unmotivated) to right (motivated)
  y: number; // 0-100: top (happy) to bottom (unhappy)
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
}

export interface MoodEntryInput {
  mood_x: number;
  mood_y: number;
  focus: string;
  self_talk: string;
  physical: string;
  notes?: string;
}

// Pattern analysis types
export interface FocusPattern {
  focus: string;
  count: number;
  avgHappiness: number;
  avgMotivation: number;
}

export interface Insight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  relatedEntries?: string[];
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
