import { OnboardingData } from '../../types/onboarding';
import { MemoryPayloadInterface, UserMetadata } from '../../core/MemoryPayloadInterface';
import { ElementalType, SpiralPhase } from '../../types';

// In-memory store for onboarding data (before DB persistence)
const onboardingDB: Record<string, OnboardingData> = {};

export function saveOnboardingData(userId: string, data: Omit<OnboardingData, 'userId' | 'createdAt' | 'updatedAt'>): OnboardingData {
  const timestamp = new Date().toISOString();
  const onboardingData: OnboardingData = {
    ...data,
    userId,
    createdAt: onboardingDB[userId]?.createdAt || timestamp,
    updatedAt: timestamp,
  };
  
  onboardingDB[userId] = onboardingData;
  return onboardingData;
}

export function getOnboardingData(userId: string): OnboardingData | null {
  return onboardingDB[userId] || null;
}

export function deleteOnboardingData(userId: string): void {
  delete onboardingDB[userId];
}

export function convertToMemoryPayload(onboardingData: OnboardingData, memoryInterface: MemoryPayloadInterface): UserMetadata {
  // Convert onboarding data to UserMetadata for memory system
  const initialMetadata: Partial<UserMetadata> = {
    userId: onboardingData.userId,
    currentElement: onboardingData.elementalAffinity,
    currentPhase: onboardingData.spiralPhase,
    preferences: {
      preferredElements: [onboardingData.elementalAffinity],
      voicePersonality: onboardingData.voicePersonality || 'adaptive',
      communicationStyle: onboardingData.communicationStyle || 'conversational',
      depthLevel: onboardingData.tonePreference === 'symbolic' ? 'deep' : 'moderate',
      ritualFrequency: onboardingData.experienceLevel === 'beginner' ? 'minimal' : 'regular',
      collectiveParticipation: true,
      dreamSharing: false,
      synchronicityTracking: true,
      privacyLevel: 'pseudonymous'
    },
    psychProfile: {
      dominantArchetypes: ['Innocent'], // Will be refined through usage
      shadowArchetypes: [],
      emergingArchetypes: [],
      cognitiveType: 'balanced',
      learningStyle: 'multimodal',
      transformationReadiness: getTransformationReadiness(onboardingData.experienceLevel),
      integrationCapacity: getIntegrationCapacity(onboardingData.experienceLevel),
      resilience: 0.5,
      openness: getOpenness(onboardingData.spiritualBackgrounds.length),
      lastAssessmentDate: Date.now()
    },
    contextualState: {
      currentEmotionalState: 'curious',
      recentEmotionalJourney: [],
      energyLevel: 0.5,
      clarityLevel: 0.5,
      motivationLevel: 0.7, // High initial motivation
      readinessForChallenge: getReadinessForChallenge(onboardingData.experienceLevel),
      activeThemes: onboardingData.currentChallenges || [],
      recentSymbols: [],
      currentChallenges: onboardingData.currentChallenges.map(challenge => ({
        challengeId: `initial_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: categorizeChallenge(challenge),
        description: challenge,
        element: onboardingData.elementalAffinity,
        archetype: 'Innocent',
        intensity: 0.5,
        duration: 0,
        progressLevel: 0,
        supportNeeded: onboardingData.guidancePreferences || [],
        lastAddressed: Date.now()
      })),
      activeIntentions: [{
        intentionId: `intention_${Date.now()}`,
        description: onboardingData.intentions,
        element: onboardingData.elementalAffinity,
        archetype: 'Innocent',
        priority: 'high',
        timeframe: 'medium-term',
        progressLevel: 0,
        alignmentWithPath: 1.0,
        energyInvestment: 0.8,
        lastReviewed: Date.now()
      }],
      contextTags: ['onboarding-complete', ...onboardingData.spiritualBackgrounds],
      sessionContext: {
        sessionStart: Date.now(),
        sessionDuration: 0,
        interactionCount: 0,
        currentMood: 'excited',
        sessionGoals: ['complete-onboarding'],
        completedGoals: [],
        emergentThemes: [],
        significantMoments: [],
        adaptiveAdjustments: []
      }
    }
  };

  // Initialize the user in the memory system
  const memoryPayload = memoryInterface.initializeUser(onboardingData.userId, initialMetadata);
  return memoryPayload.metadata;
}

// Helper functions
function getTransformationReadiness(experienceLevel: string): number {
  switch (experienceLevel) {
    case 'beginner': return 0.3;
    case 'intermediate': return 0.5;
    case 'advanced': return 0.7;
    case 'expert': return 0.8;
    default: return 0.3;
  }
}

function getIntegrationCapacity(experienceLevel: string): number {
  switch (experienceLevel) {
    case 'beginner': return 0.4;
    case 'intermediate': return 0.6;
    case 'advanced': return 0.8;
    case 'expert': return 0.9;
    default: return 0.4;
  }
}

function getOpenness(backgroundsCount: number): number {
  // More spiritual backgrounds suggest higher openness
  return Math.min(1.0, 0.3 + (backgroundsCount * 0.1));
}

function getReadinessForChallenge(experienceLevel: string): number {
  switch (experienceLevel) {
    case 'beginner': return 0.2;
    case 'intermediate': return 0.4;
    case 'advanced': return 0.7;
    case 'expert': return 0.8;
    default: return 0.2;
  }
}

function categorizeChallenge(challenge: string): 'emotional' | 'mental' | 'spiritual' | 'practical' | 'relational' {
  const lowerChallenge = challenge.toLowerCase();
  
  if (lowerChallenge.includes('emotion') || lowerChallenge.includes('feeling') || 
      lowerChallenge.includes('anxiety') || lowerChallenge.includes('depression')) {
    return 'emotional';
  }
  
  if (lowerChallenge.includes('decision') || lowerChallenge.includes('clarity') || 
      lowerChallenge.includes('focus') || lowerChallenge.includes('mental')) {
    return 'mental';
  }
  
  if (lowerChallenge.includes('purpose') || lowerChallenge.includes('spiritual') || 
      lowerChallenge.includes('meaning') || lowerChallenge.includes('awakening')) {
    return 'spiritual';
  }
  
  if (lowerChallenge.includes('career') || lowerChallenge.includes('work') || 
      lowerChallenge.includes('financial') || lowerChallenge.includes('practical')) {
    return 'practical';
  }
  
  if (lowerChallenge.includes('relationship') || lowerChallenge.includes('communication') || 
      lowerChallenge.includes('family') || lowerChallenge.includes('social')) {
    return 'relational';
  }
  
  return 'emotional'; // Default
}