import { ElementalType, SpiralPhase } from './index';

export interface OnboardingData {
  userId: string;
  elementalAffinity: ElementalType;
  spiralPhase: SpiralPhase;
  tonePreference: 'insight' | 'symbolic';
  name?: string;
  spiritualBackgrounds: string[];
  currentChallenges: string[];
  guidancePreferences: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  intentions: string;
  voicePersonality: 'gentle' | 'direct' | 'mystical' | 'practical' | 'adaptive';
  communicationStyle: 'conversational' | 'ceremonial' | 'therapeutic' | 'educational';
  createdAt: string;
  updatedAt: string;
}

export interface ElementalChoice {
  element: ElementalType;
  name: string;
  emoji: string;
  description: string;
  qualities: string[];
  insightPrompt: string;
  symbolicPrompt: string;
}

export interface SpiralPhaseChoice {
  phase: SpiralPhase;
  name: string;
  description: string;
  characteristics: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  completionCriteria?: (data: Partial<OnboardingData>) => boolean;
}