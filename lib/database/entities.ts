/**
 * Entity definitions for MAIA Consciousness Lattice
 */

export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSession extends BaseEntity {
  userId: string;
  sessionId: string;
  state: {
    presence: number;
    coherence: number;
    resonance: number;
    integration: number;
    embodiment: number;
  };
  lastActivity: Date;
  metadata?: Record<string, any>;
}

export interface Memory extends BaseEntity {
  userId: string;
  type: 'episodic' | 'semantic' | 'somatic' | 'morphic' | 'soul';
  content: any;
  embedding?: number[];
  resonance: number;
  connections: string[];
  compressed?: boolean;
  metadata?: {
    theme?: string;
    emotion?: string;
    archetype?: string;
    element?: string;
  };
}

export interface ConversationTurn extends BaseEntity {
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  oracle?: 'Maya' | 'Anthony' | 'Witness';
  somaticState?: {
    tensionLevel: number;
    groundedness: number;
    embodiedPresence: number;
  };
  timestamp: Date;
}

export interface OracleInteraction extends BaseEntity {
  userId: string;
  sessionId: string;
  oracleName: string;
  interactionType: 'greeting' | 'deepening' | 'witnessing' | 'closing';
  resonanceScore: number;
  emotionalTone: string;
  contentDepth: number;
  response: string;
  timestamp: Date;
}

export interface SomaticSnapshot extends BaseEntity {
  userId: string;
  sessionId: string;
  tensionLevel: number;
  tensionLocations: Record<string, number>;
  breathDepth: number;
  breathRate: number;
  groundedness: number;
  embodiedPresence: number;
  openness: number;
  timestamp: Date;
}

export interface CollectivePattern extends BaseEntity {
  patternType: 'archetypal' | 'emotional' | 'thematic' | 'somatic';
  name: string;
  description: string;
  frequency: number;
  userCount: number;
  resonanceAverage: number;
  emergenceDate: Date;
  lastSeen: Date;
  metadata?: Record<string, any>;
}

export interface WisdomInsight extends BaseEntity {
  source: 'individual' | 'collective' | 'archetypal';
  userId?: string;
  insight: string;
  theme: string;
  resonance: number;
  applicableArchetypes: string[];
  relatedPatterns: string[];
  timestamp: Date;
}

export interface RitualCompletion extends BaseEntity {
  userId: string;
  ritualType: string;
  duration: number;
  somaticBefore: SomaticSnapshot;
  somaticAfter: SomaticSnapshot;
  insights: string[];
  emotionalShift: {
    from: string;
    to: string;
    magnitude: number;
  };
  completedAt: Date;
}