// Shared types for the Oracle Frontend application

// User Profile types
export interface UserProfile {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  crystal_focus: string;
  voice_profile: string;
  guide_voice: string;
  guide_name: string;
}

export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

// Oracle Response types
export interface OracleMetadata {
  archetype?: string;
  element?: string;
  phase?: string;
  [key: string]: unknown;
}

export interface OracleResponse {
  content: string;
  metadata?: OracleMetadata;
}

// Archetype types
export interface Archetype {
  name: string;
  icon: React.ReactNode;
  element: ElementType | 'earth';
  gradient: string;
  shadow: string;
  description: string;
}

// Elemental Snapshot types
export interface ElementalSnapshot {
  timestamp: string;
  userId: string;
  elemental: {
    dominant?: ElementType;
    balance?: Record<ElementType, number>;
    [key: string]: unknown;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Handler types
export type FormSubmitHandler<T = unknown> = (data: T) => void | Promise<void>;

// Voice Service types
export interface VoiceConfig {
  voiceId: string;
  text: string;
  language?: string;
  speed?: number;
}