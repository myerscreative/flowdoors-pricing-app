export interface MoodEntry {
  id: string;
  timestamp: number;
  x: number; // motivation (0-1)
  y: number; // happiness (0-1)
  whatHappened?: string;
  whatFocusing?: string;
  whatSaying?: string;
  physicalSensations?: string;
  title?: string;
}

export interface AppSettings {
  clinicalLabels: boolean;
  darkMode: boolean;
  showCrosshair: boolean;
  firstLaunch: boolean;
}

export interface MoodStats {
  totalEntries: number;
  streak: number;
  lastEntryDate?: number;
  avgHappiness: number;
  avgMotivation: number;
  quadrantCounts: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}



