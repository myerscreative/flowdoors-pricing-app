import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, AppSettings, MoodStats } from '@/types';
import { calculateStreak, calculateStats } from '@/lib/utils';

interface MoodState {
  entries: MoodEntry[];
  settings: AppSettings;
  stats: MoodStats;
  loading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<MoodEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshStats: () => void;
}

const STORAGE_KEYS = {
  ENTRIES: '@vibepoint:entries',
  SETTINGS: '@vibepoint:settings',
};

const defaultSettings: AppSettings = {
  clinicalLabels: true,
  darkMode: false,
  showCrosshair: false,
  firstLaunch: true,
};

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  settings: defaultSettings,
  stats: {
    totalEntries: 0,
    streak: 0,
    avgHappiness: 0,
    avgMotivation: 0,
    quadrantCounts: {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    },
  },
  loading: true,

  loadData: async () => {
    try {
      const [entriesData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      const entries: MoodEntry[] = entriesData ? JSON.parse(entriesData) : [];
      const settings: AppSettings = settingsData ? JSON.parse(settingsData) : defaultSettings;

      const stats = calculateStats(entries);

      set({ entries, settings, stats, loading: false });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ loading: false });
    }
  },

  addEntry: async (entryData) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const entries = [...get().entries, newEntry];
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));

    const stats = calculateStats(entries);
    set({ entries, stats });
  },

  updateEntry: async (id, updates) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));

    const stats = calculateStats(entries);
    set({ entries, stats });
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));

    const stats = calculateStats(entries);
    set({ entries, stats });
  },

  updateSettings: async (updates) => {
    const settings = { ...get().settings, ...updates };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    set({ settings });
  },

  refreshStats: () => {
    const stats = calculateStats(get().entries);
    set({ stats });
  },
}));



