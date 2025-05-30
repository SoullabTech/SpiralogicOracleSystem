// Real data connections to your deployed backend
import { api, endpoints } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  elementalBalance?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  sacredPhase?: string;
  lastActive: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  mood?: string;
  insights?: string[];
  elementalTags?: string[];
  symbols?: string[];
}

export interface HoloflowerState {
  userId: string;
  petals: {
    id: number;
    name: string;
    element: string;
    value: number;
    lastUpdated: string;
  }[];
  overallBalance: number;
  recentShifts: string[];
  timestamp: string;
}

export interface SacredInsight {
  id: string;
  content: string;
  type: 'pattern' | 'growth' | 'wisdom' | 'timing';
  confidence: number;
  timestamp: string;
  source: 'ai-analysis' | 'user-reflection' | 'collective-field';
}

class SacredDataService {
  // User Profile & Authentication
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const response = await api.get(endpoints.getProfile);
      return response.data.user;
    } catch (error) {
      console.log('Demo mode: using simulated user data');
      return {
        id: 'demo-user',
        name: 'Consciousness Demo',
        email: 'demo@soullab.com',
        elementalBalance: {
          fire: 0.8,
          water: 0.6,
          earth: 0.7,
          air: 0.9
        },
        sacredPhase: 'Integration',
        lastActive: new Date().toISOString()
      };
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      await api.put(endpoints.updateProfile, updates);
    } catch (error) {
      console.log('Demo mode: profile update simulated');
    }
  }

  // Journal & Reflections
  async getJournalEntries(limit = 10): Promise<JournalEntry[]> {
    try {
      const response = await api.get(`${endpoints.getJournals}?limit=${limit}`);
      return response.data.entries;
    } catch (error) {
      console.log('Demo mode: using simulated journal entries');
      return [
        {
          id: '1',
          content: 'Been reflecting on that conversation about leadership patterns. Something is shifting in how I approach decision-making.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          mood: 'thoughtful',
          insights: ['Leadership style evolution', 'Decision-making patterns'],
          elementalTags: ['fire', 'air']
        },
        {
          id: '2',
          content: 'Morning routine is becoming more consistent. Noticing how it affects my energy throughout the day.',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          mood: 'grounded',
          insights: ['Routine consistency', 'Energy management'],
          elementalTags: ['earth']
        }
      ];
    }
  }

  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'>): Promise<JournalEntry> {
    try {
      const response = await api.post(endpoints.createJournal, entry);
      return response.data.entry;
    } catch (error) {
      console.log('Demo mode: journal entry creation simulated');
      return {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...entry
      };
    }
  }

  // Holoflower States
  async getHoloflowerState(userId: string): Promise<HoloflowerState | null> {
    try {
      const response = await api.get(`${endpoints.personalOracle}/holoflower/${userId}`);
      return response.data.state;
    } catch (error) {
      console.log('Demo mode: using simulated holoflower state');
      return {
        userId,
        petals: [
          { id: 1, name: "Vitality", element: "Fire", value: 0.8, lastUpdated: new Date().toISOString() },
          { id: 2, name: "Emotions", element: "Water", value: 0.6, lastUpdated: new Date().toISOString() },
          { id: 3, name: "Creativity", element: "Fire", value: 0.9, lastUpdated: new Date().toISOString() },
          { id: 4, name: "Relationships", element: "Water", value: 0.7, lastUpdated: new Date().toISOString() },
          { id: 5, name: "Growth", element: "Air", value: 0.8, lastUpdated: new Date().toISOString() },
          { id: 6, name: "Purpose", element: "Earth", value: 0.5, lastUpdated: new Date().toISOString() },
          { id: 7, name: "Communication", element: "Air", value: 0.9, lastUpdated: new Date().toISOString() },
          { id: 8, name: "Grounding", element: "Earth", value: 0.6, lastUpdated: new Date().toISOString() }
        ],
        overallBalance: 0.72,
        recentShifts: ['Communication strengthening', 'Purpose seeking clarity'],
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateHoloflowerPetal(userId: string, petalId: number, value: number): Promise<void> {
    try {
      await api.post(`${endpoints.personalOracle}/holoflower/${userId}/petal/${petalId}`, { value });
    } catch (error) {
      console.log('Demo mode: holoflower update simulated');
    }
  }

  // Sacred Insights & AI Analysis
  async getRecentInsights(limit = 5): Promise<SacredInsight[]> {
    try {
      const response = await api.get(`${endpoints.personalOracle}/insights?limit=${limit}`);
      return response.data.insights;
    } catch (error) {
      console.log('Demo mode: using simulated insights');
      return [
        {
          id: '1',
          content: 'Your morning routine is becoming more consistent. Nice work.',
          type: 'pattern',
          confidence: 0.85,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          source: 'ai-analysis'
        },
        {
          id: '2',
          content: 'That decision-making pattern we discussed is shifting.',
          type: 'growth',
          confidence: 0.78,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          source: 'ai-analysis'
        }
      ];
    }
  }

  // Astrology & Sacred Timing
  async getCurrentTransits(): Promise<any> {
    try {
      const response = await api.get(endpoints.currentTransits);
      return response.data.transits;
    } catch (error) {
      console.log('Demo mode: using simulated transits');
      return {
        todaysFocus: 'Creative expression and authentic communication',
        activeTransits: ['Mercury conjunction natal Venus', 'Mars trine natal Jupiter'],
        energy: 87,
        phase: 'Waxing Moon in Gemini'
      };
    }
  }

  // Voice & Audio Processing
  async processVoiceMessage(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await api.post('/api/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data.transcript;
    } catch (error) {
      console.log('Demo mode: voice processing not available');
      return 'Voice processing requires backend connection';
    }
  }

  // Onboarding & Assessment
  async completeOnboarding(data: any): Promise<UserProfile> {
    try {
      const response = await api.post(endpoints.createProfile, data);
      return response.data.user;
    } catch (error) {
      console.log('Demo mode: onboarding completion simulated');
      return {
        id: 'demo-user',
        name: data.name || 'Demo User',
        email: data.email || 'demo@soullab.com',
        lastActive: new Date().toISOString()
      };
    }
  }

  // Memory & Learning
  async getMemoryItems(query?: string): Promise<any[]> {
    try {
      const endpoint = query ? `${endpoints.searchMemory}?q=${encodeURIComponent(query)}` : endpoints.memoryItems;
      const response = await api.get(endpoint);
      return response.data.memories;
    } catch (error) {
      console.log('Demo mode: using simulated memory items');
      return [
        {
          id: '1',
          content: 'Leadership conversation insights',
          type: 'reflection',
          timestamp: new Date().toISOString(),
          connections: ['decision-making', 'team-dynamics']
        }
      ];
    }
  }
}

// Export singleton instance
export const sacredData = new SacredDataService();