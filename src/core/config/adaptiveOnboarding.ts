/**
 * Adaptive Onboarding Integration
 * 
 * Maps onboarding conditions directly into Oracle State Machine behaviors.
 * No separate onboarding flow - just enhanced early-stage Oracle responses
 * that naturally scaffold users through trust → exploration → depth.
 */

export interface OnboardingCondition {
  name: string;
  detect: (context: any) => boolean;
  weight: number; // Higher weight = higher priority
  stageOverride?: number; // Force specific stage behavior
  responseModifiers: {
    warmth: number;     // 0-1: How warm/welcoming
    simplicity: number; // 0-1: How simple the language
    grounding: number;  // 0-1: How grounded/practical
    space: number;      // 0-1: How much pause/silence
    curiosity: number;  // 0-1: How much exploration invitation
  };
}

/**
 * Adaptive Onboarding Conditions
 * These detect user signals and modify Oracle responses accordingly
 */
export const ONBOARDING_CONDITIONS: OnboardingCondition[] = [
  
  // FIRST CONTACT - Brand new users
  {
    name: &quot;firstContact&quot;,
    detect: (context) => {
      return context.sessionCount === 0 || 
             (context.sessionCount <= 2 && context.trustLevel < 0.3);
    },
    weight: 100, // Highest priority
    stageOverride: 1, // Force Stage 1 behavior
    responseModifiers: {
      warmth: 0.9,      // Very welcoming
      simplicity: 0.8,  // Keep it simple
      grounding: 0.7,   // Stay practical
      space: 0.4,       // Some pauses
      curiosity: 0.3    // Light exploration
    }
  },

  // TENTATIVE EXPLORATION - User is hesitant but present
  {
    name: "tentativeExploration", 
    detect: (context) => {
      const hasShortResponses = context.recentResponses?.some(r => r.length < 50);
      const hasHesitationWords = context.recentContent?.includes('maybe') || 
                                 context.recentContent?.includes('not sure') ||
                                 context.recentContent?.includes('I guess');
      return (context.sessionCount <= 5) && 
             (hasShortResponses || hasHesitationWords) &&
             context.trustLevel < 0.5;
    },
    weight: 80,
    stageOverride: 1, // Keep in Stage 1
    responseModifiers: {
      warmth: 0.8,
      simplicity: 0.9,  // Extra simple
      grounding: 0.9,   // Very grounded
      space: 0.6,       // More pauses
      curiosity: 0.2    // Minimal exploration
    }
  },

  // OPENING CURIOSITY - User showing interest and questions
  {
    name: "openingCuriosity",
    detect: (context) => {
      const hasQuestions = context.recentContent?.includes('?');
      const hasExpressiveLanguage = context.recentContent?.match(/\b(feel|sense|notice|wonder)\b/i);
      return context.sessionCount <= 8 && 
             context.trustLevel >= 0.4 && 
             (hasQuestions || hasExpressiveLanguage) &&
             context.overwhelm < 0.4;
    },
    weight: 70,
    stageOverride: 2, // Move to Stage 2
    responseModifiers: {
      warmth: 0.7,
      simplicity: 0.6,  // Can be slightly more complex
      grounding: 0.6,
      space: 0.5,
      curiosity: 0.7    // Invite exploration
    }
  },

  // STABLE ENGAGEMENT - User ready for deeper work
  {
    name: "stableEngagement",
    detect: (context) => {
      return context.sessionCount >= 5 &&
             context.trustLevel >= 0.6 &&
             context.overwhelm < 0.3 &&
             context.resistance < 0.4;
    },
    weight: 60,
    stageOverride: 3, // Allow Stage 3
    responseModifiers: {
      warmth: 0.6,
      simplicity: 0.5,  // Normal complexity
      grounding: 0.5,
      space: 0.5,
      curiosity: 0.8    // Full exploration
    }
  },

  // INTEGRATION READINESS - User ready for mastery voice
  {
    name: "integrationReadiness",
    detect: (context) => {
      return context.sessionCount >= 8 &&
             context.trustLevel >= 0.75 &&
             context.integrationSignals >= 0.7 &&
             context.overwhelm < 0.2;
    },
    weight: 50,
    stageOverride: 4, // Allow Stage 4 / Mastery Voice
    responseModifiers: {
      warmth: 0.5,      // More spacious warmth
      simplicity: 0.7,  // Distilled simplicity
      grounding: 0.4,   // Less grounding needed
      space: 0.8,       // Lots of space
      curiosity: 0.6    // Gentle invitation
    }
  },

  // OVERWHELM DETECTED - User needs grounding
  {
    name: "overwhelmDetected",
    detect: (context) => {
      return context.overwhelm >= 0.6 || 
             context.crisisLevel >= 0.3 ||
             context.recentContent?.match(/\b(too much|overwhelming|can't handle)\b/i);
    },
    weight: 90, // High priority override
    stageOverride: 1, // Force back to Stage 1
    responseModifiers: {
      warmth: 0.9,
      simplicity: 0.9,
      grounding: 1.0,   // Maximum grounding
      space: 0.7,       // Breathing room
      curiosity: 0.1    // Minimal exploration
    }
  }

];

/**
 * Adaptive Response Templates
 * These get selected based on active conditions
 */
export const ADAPTIVE_RESPONSE_TEMPLATES = {
  
  firstContact: [
    "Welcome. This is a space for you. What feels present right now?",
    "I'm glad you're here. Where shall we begin?", 
    "I'm listening. What's moving in you today?"
  ],

  tentativeExploration: [
    "That sounds important. Can you tell me more about what you mean?",
    "I hear some hesitation. Want to take this slowly?",
    "Let's stay simple — what matters most in this moment?"
  ],

  openingCuriosity: [
    "One part of you wants safety. Another part wants freedom. Do you feel both?",
    "You're sensing movement — like a river under the surface. Want to follow it?",
    "Some might call this intuition. What do you prefer to call it?"
  ],

  stableEngagement: [
    "Want to explore this together?",
    "If we look at this from another angle, what do you see?", 
    "You hold part of the map. What path calls to you?"
  ],

  integrationReadiness: [
    "Sometimes old patterns return like waves. The tide always shifts… What feels true now?",
    "Something in you already knows. Let's sit with that…",
    "The path you're on is yours. What feels most authentic right now?"
  ],

  overwhelmDetected: [
    "Let's pause here together. Take a moment… breathe. You're not alone in this.",
    "This feels important. What you're feeling matters. Breathe with me.",
    "Let's stay simple and grounded. What's one small thing that feels solid right now?"
  ]

};

/**
 * Condition Evaluator
 * Determines which onboarding condition is currently active
 */
export class OnboardingConditionEvaluator {
  
  static evaluateActiveCondition(context: any): OnboardingCondition | null {
    // Crisis override always wins
    const crisisCondition = ONBOARDING_CONDITIONS.find(c => c.name === 'overwhelmDetected');
    if (crisisCondition?.detect(context)) {
      return crisisCondition;
    }

    // Find highest weight condition that matches
    const activeConditions = ONBOARDING_CONDITIONS
      .filter(condition => condition.detect(context))
      .sort((a, b) => b.weight - a.weight);

    return activeConditions[0] || null;
  }

  static getResponseTemplate(conditionName: string): string[] {
    return ADAPTIVE_RESPONSE_TEMPLATES[conditionName] || [];
  }

  static shouldOverrideStage(condition: OnboardingCondition): number | null {
    return condition.stageOverride || null;
  }

  static getResponseModifiers(condition: OnboardingCondition) {
    return condition.responseModifiers;
  }
}