/**
 * Core Types for Spiralogic Oracle System
 * Shared type definitions across all modules
 */

// Elemental Types
export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

// Spiral Phase Types
export type SpiralPhase = 'initiation' | 'expansion' | 'integration' | 'mastery';

// Archetypal Types
export type Archetype = 
  // Classical Archetypes
  | 'Hero' | 'Sage' | 'Innocent' | 'Explorer' | 'Rebel' | 'Magician'
  | 'Lover' | 'Caregiver' | 'Ruler' | 'Creator' | 'Jester' | 'Orphan'
  // Spiralogic Archetypes
  | 'Phoenix' | 'Serpent' | 'Tree' | 'Mountain' | 'Ocean' | 'Star'
  | 'Veil' | 'Mirror' | 'Bridge' | 'Spiral' | 'Seed' | 'Crystal'
  // Enhanced Mythic Archetypes
  | 'Dragon' | 'Thunderbird' | 'World Tree' | 'Cosmic Egg' | 'Rainbow Bridge'
  | 'Sacred Feminine' | 'Wild Man' | 'Crone' | 'Shaman' | 'Oracle';

// Emotional State Types
export type UserEmotionalState = 
  | 'peaceful' | 'excited' | 'anxious' | 'depressed' | 'joyful' 
  | 'angry' | 'curious' | 'overwhelmed' | 'centered' | 'confused'
  | 'hopeful' | 'fearful' | 'content' | 'restless' | 'inspired'
  | 'frustrated' | 'grateful' | 'lonely' | 'connected' | 'transforming';

// Oracle Response Types
export interface OracleResponse {
  responseId: string;
  elementalAgent: ElementalType;
  archetype: Archetype;
  phase: SpiralPhase;
  content: string;
  symbols: string[];
  guidance: string;
  nextSteps?: string[];
  ritualRecommendations?: string[];
  timestamp: number;
  confidenceLevel: number; // 0-1
  therapeuticValue: number; // 0-1
  transformationalImpact: number; // 0-1
}

// Collective Wisdom Types
export interface CollectiveWisdom {
  wisdomId: string;
  sourceType: 'individual' | 'collective' | 'archetypal' | 'universal';
  content: string;
  symbols: string[];
  archetypes: Archetype[];
  elements: ElementalType[];
  phases: SpiralPhase[];
  resonanceFrequency: number; // 0-1
  universalRelevance: number; // 0-1
  emergencePattern?: string;
  mythicSignificance?: string;
  timestamp: number;
}

// Synchronicity Types
export interface SynchronicityEvent {
  eventId: string;
  userId: string;
  eventType: 'symbol_appearance' | 'number_pattern' | 'meaningful_coincidence' | 'archetypal_activation';
  description: string;
  symbols: string[];
  archetypes: Archetype[];
  intensity: number; // 0-1
  personalSignificance: number; // 0-1
  collectiveRelevance: number; // 0-1
  timestamp: number;
  context: string;
  interpretation?: string;
}

// Transformation Types
export interface TransformationMarker {
  markerId: string;
  markerType: 'breakthrough' | 'integration' | 'initiation' | 'mastery' | 'transcendence';
  description: string;
  element: ElementalType;
  archetype: Archetype;
  phase: SpiralPhase;
  significance: number; // 0-1
  embodimentLevel: number; // 0-1 how well integrated
  supportingEvidence: string[];
  timestamp: number;
  userId: string;
}

// Dream Types
export interface DreamEntry {
  dreamId: string;
  userId: string;
  title?: string;
  content: string;
  symbols: string[];
  archetypes: Archetype[];
  elements: ElementalType[];
  emotionalTone: UserEmotionalState[];
  lucidityLevel: number; // 0-1
  significanceRating: number; // 0-1
  personalMeaning?: string;
  collectiveMeaning?: string;
  synchronicityMarkers?: string[];
  timestamp: number;
  dreamDate: number; // actual dream date if different
}

// Ritual Types
export interface RitualTemplate {
  ritualId: string;
  name: string;
  purpose: string;
  element: ElementalType;
  archetype: Archetype;
  phase: SpiralPhase;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  materials: string[];
  steps: RitualStep[];
  variations?: RitualVariation[];
  precautions?: string[];
  integration?: string[];
}

export interface RitualStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // minutes
  focusPoint?: string;
  visualization?: string;
  affirmation?: string;
  breathingPattern?: string;
}

export interface RitualVariation {
  variationName: string;
  modifications: string[];
  suitableFor: string[];
}

// Wisdom Keeper Types
export interface WisdomEntry {
  wisdomId: string;
  category: 'teaching' | 'insight' | 'prophecy' | 'guidance' | 'warning';
  title: string;
  content: string;
  source: 'ancient' | 'channeled' | 'collective' | 'emergent' | 'synthesized';
  archetypes: Archetype[];
  elements: ElementalType[];
  phases: SpiralPhase[];
  applicability: 'personal' | 'collective' | 'universal';
  timelessness: number; // 0-1 how universally applicable across time
  practicalRelevance: number; // 0-1 how actionable
  transformationalPower: number; // 0-1 potential for change
  prerequisiteLevel: 'initiate' | 'seeker' | 'practitioner' | 'adept' | 'master';
  timestamp: number;
  tags: string[];
}

// Integration Types
export interface IntegrationPractice {
  practiceId: string;
  name: string;
  type: 'meditation' | 'journaling' | 'movement' | 'creative' | 'service' | 'study';
  element: ElementalType;
  archetype: Archetype;
  phase: SpiralPhase;
  timeRequirement: number; // minutes
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  instructions: string[];
  benefits: string[];
  progressIndicators: string[];
  variations?: string[];
  contraindications?: string[];
}

// Memory Types
export interface MemoryFragment {
  fragmentId: string;
  type: 'experience' | 'insight' | 'symbol' | 'feeling' | 'vision' | 'teaching';
  content: string;
  emotionalResonance: number; // -1 to 1
  clarity: number; // 0-1
  significance: number; // 0-1
  archetypes: Archetype[];
  elements: ElementalType[];
  symbols: string[];
  connections: string[]; // IDs of related fragments
  lastAccessed: number;
  accessCount: number;
  integrationLevel: number; // 0-1
  timestamp: number;
}

// Voice and Communication Types
export interface VoicePersonality {
  personalityId: string;
  name: string;
  element: ElementalType;
  archetype: Archetype;
  characteristics: {
    tone: 'gentle' | 'direct' | 'mystical' | 'practical' | 'inspiring';
    pace: 'slow' | 'moderate' | 'quick' | 'variable';
    formality: 'casual' | 'formal' | 'ceremonial' | 'intimate';
    depth: 'surface' | 'moderate' | 'deep' | 'profound';
  };
  voicePatterns: {
    greeting: string[];
    encouragement: string[];
    challenge: string[];
    closure: string[];
    transition: string[];
  };
  metaphorStyle: 'nature' | 'mythology' | 'psychology' | 'spiritual' | 'practical';
  questioningStyle: 'socratic' | 'direct' | 'reflective' | 'exploratory';
}

// Analytics and Metrics Types
export interface UserJourneyMetrics {
  userId: string;
  totalEngagementTime: number;
  sessionCount: number;
  averageSessionLength: number;
  breakthroughCount: number;
  integrationScore: number; // 0-1
  growthVelocity: number; // rate of progression
  challengeResolutionRate: number; // 0-1
  synchronicityFrequency: number; // events per week
  collectiveContributions: number;
  wisdomSharedCount: number;
  lastActivity: number;
  progressMilestones: string[];
}

// Collective Intelligence Types
export interface CollectiveIntelligenceSnapshot {
  snapshotId: string;
  timestamp: number;
  participantCount: number;
  activeArchetypes: Record<Archetype, number>;
  elementalDistribution: Record<ElementalType, number>;
  phaseDistribution: Record<SpiralPhase, number>;
  emergentPatterns: string[];
  collectiveWisdom: CollectiveWisdom[];
  synchronicityEvents: SynchronicityEvent[];
  transformationMarkers: TransformationMarker[];
  fieldCoherence: number; // 0-1
  evolutionaryPotential: number; // 0-1
}

// Error and Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
  requestId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Configuration Types
export interface SystemConfiguration {
  elementalWeights: Record<ElementalType, number>;
  archetypalThresholds: Record<Archetype, number>;
  phaseTransitionCriteria: Record<SpiralPhase, number>;
  collectiveSyncSettings: {
    minParticipants: number;
    syncThreshold: number;
    emergenceThreshold: number;
  };
  privacySettings: {
    anonymizationLevel: 'none' | 'partial' | 'full';
    dataRetention: number; // days
    collectiveParticipation: boolean;
  };
  safetySettings: {
    maxSessionLength: number; // minutes
    cooldownPeriod: number; // minutes
    intensityLimits: Record<string, number>;
  };
}

// Event Types for System Communication
export interface SystemEvent {
  eventId: string;
  eventType: 'user_update' | 'collective_sync' | 'emergence_detected' | 'threshold_crossed' | 'transformation_initiated';
  userId?: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  processed: boolean;
}

// Feature Flag Types
export interface FeatureFlag {
  flagName: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100
  conditions?: FeatureCondition[];
  expirationDate?: number;
}

export interface FeatureCondition {
  type: 'user_attribute' | 'date_range' | 'collective_state';
  attribute: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export utility functions
export const ElementalTypes: ElementalType[] = ['fire', 'water', 'earth', 'air', 'aether'];
export const SpiralPhases: SpiralPhase[] = ['initiation', 'expansion', 'integration', 'mastery'];
export const EmotionalStates: UserEmotionalState[] = [
  'peaceful', 'excited', 'anxious', 'depressed', 'joyful',
  'angry', 'curious', 'overwhelmed', 'centered', 'confused',
  'hopeful', 'fearful', 'content', 'restless', 'inspired',
  'frustrated', 'grateful', 'lonely', 'connected', 'transforming'
];

// Type guards for runtime type checking
export const isElementalType = (value: any): value is ElementalType => {
  return ElementalTypes.includes(value);
};

export const isSpiralPhase = (value: any): value is SpiralPhase => {
  return SpiralPhases.includes(value);
};

export const isEmotionalState = (value: any): value is UserEmotionalState => {
  return EmotionalStates.includes(value);
};

export const isArchetype = (value: any): value is Archetype => {
  const archetypes: Archetype[] = [
    'Hero', 'Sage', 'Innocent', 'Explorer', 'Rebel', 'Magician',
    'Lover', 'Caregiver', 'Ruler', 'Creator', 'Jester', 'Orphan',
    'Phoenix', 'Serpent', 'Tree', 'Mountain', 'Ocean', 'Star',
    'Veil', 'Mirror', 'Bridge', 'Spiral', 'Seed', 'Crystal',
    'Dragon', 'Thunderbird', 'World Tree', 'Cosmic Egg', 'Rainbow Bridge',
    'Sacred Feminine', 'Wild Man', 'Crone', 'Shaman', 'Oracle'
  ];
  return archetypes.includes(value);
};

// Constants for validation and defaults
export const VALIDATION_CONSTANTS = {
  MAX_SYMBOL_LENGTH: 50,
  MAX_CONTENT_LENGTH: 5000,
  MIN_SIGNIFICANCE_SCORE: 0,
  MAX_SIGNIFICANCE_SCORE: 1,
  MAX_SYMBOLS_PER_ENTRY: 20,
  MAX_ARCHETYPES_PER_ENTRY: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  MAX_DAILY_SESSIONS: 10,
  MIN_RITUAL_DURATION: 5, // minutes
  MAX_RITUAL_DURATION: 180 // minutes
} as const;

export const DEFAULT_VALUES = {
  SIGNIFICANCE_SCORE: 0.5,
  EMOTIONAL_RESONANCE: 0,
  CLARITY_LEVEL: 0.7,
  INTEGRATION_LEVEL: 0.3,
  COHERENCE_LEVEL: 0.5,
  ENERGY_LEVEL: 0.6,
  MOTIVATION_LEVEL: 0.6
} as const;