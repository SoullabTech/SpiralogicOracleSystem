import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';

export interface JournalEntry {
  id: string;
  userId: string;
  mode: JournalingMode;
  content: string;
  reflection?: JournalingResponse;
  timestamp: Date;
  wordCount: number;
  duration?: number;
  isVoice: boolean;
}

export interface MaiaState {
  currentView: 'mode-select' | 'journal-entry' | 'reflection' | 'timeline' | 'search';
  selectedMode: JournalingMode | null;
  currentEntry: string;
  entries: JournalEntry[];
  isProcessing: boolean;
  searchQuery: string;

  setView: (view: MaiaState['currentView']) => void;
  setMode: (mode: JournalingMode) => void;
  setEntry: (content: string) => void;
  addEntry: (entry: JournalEntry) => void;
  setProcessing: (processing: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetEntry: () => void;
}

export const useMaiaStore = create<MaiaState>()(
  persist(
    (set) => ({
      currentView: 'mode-select',
      selectedMode: null,
      currentEntry: '',
      entries: [],
      isProcessing: false,
      searchQuery: '',

      setView: (view) => set({ currentView: view }),
      setMode: (mode) => set({ selectedMode: mode, currentView: 'journal-entry' }),
      setEntry: (content) => set({ currentEntry: content }),
      addEntry: (entry) => set((state) => ({
        entries: [entry, ...state.entries],
        currentEntry: '',
        currentView: 'reflection'
      })),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      resetEntry: () => set({ currentEntry: '', selectedMode: null, currentView: 'mode-select' })
    }),
    {
      name: 'maia-storage',
      partialize: (state) => ({ entries: state.entries })
    }
  )
);