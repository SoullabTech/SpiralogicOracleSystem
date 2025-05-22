// 📁 File: src/services/profileService.ts

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  crystal_focus?: string;
  updated_at: string;
}

const mockDatabase: Record<string, UserProfile> = {
  'user-123': {
    id: 'user-123',
    name: 'Kelly Nezat',
    email: 'kelly@example.com',
    bio: 'Author of Elemental Alchemy',
    avatarUrl: 'https://example.com/avatar.png',
    fire: 70,
    water: 60,
    earth: 50,
    air: 65,
    aether: 80,
    crystal_focus: 'Quartz',
    updated_at: '2025-05-17T00:00:00Z',
  },
};

export const profileService = {
  getProfile: (userId: string): UserProfile | null => {
    return mockDatabase[userId] || null;
  },

  updateProfile: (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
    const existing = mockDatabase[userId];
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    mockDatabase[userId] = updated;
    return updated;
  },
};
