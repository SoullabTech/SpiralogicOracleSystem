/**
 * Maya Canonical System Prompt Loader
 * Single source of truth for Maya's personality and voice
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { MasteryVoiceProcessor, type MasteryTriggerConditions } from '../core/MasteryVoiceProcessor';

export interface MasteryVoiceContext {
  stage: number;
  trustLevel: number;
  engagement: number;
  confidence: number;
  sessionCount: number;
}

/**
 * Load the canonical Maya system prompt
 * This is the SINGLE source of truth for Maya's personality
 */
export function loadMayaCanonicalPrompt(): string {
  try {
    const promptPath = path.join(__dirname, 'mayaCanonicalPrompt.md');
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    
    logger.info('Maya canonical prompt loaded successfully');
    return prompt;
  } catch (error) {
    logger.error('Failed to load Maya canonical prompt, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Fallback to embedded prompt
    return getFallbackMayaPrompt();
  }
}

// Initialize the Mastery Voice Processor
const masteryProcessor = new MasteryVoiceProcessor();

/**
 * Apply Mastery Voice transformation if conditions are met
 * Uses the sophisticated MasteryVoiceProcessor for earned simplicity
 */
export function applyMasteryVoiceIfAppropriate(
  response: string,
  context: MasteryVoiceContext
): string {
  // Convert MasteryVoiceContext to MasteryTriggerConditions
  const conditions: MasteryTriggerConditions = {
    stage: context.stage >= 4 ? 'transparent_prism' : 'cocreative_partner',
    trustLevel: context.trustLevel,
    engagementLevel: context.engagement,
    integrationLevel: context.confidence, // Using confidence as integration proxy
    confidence: context.confidence
  };

  logger.debug('Evaluating Mastery Voice conditions', {
    stage: conditions.stage,
    trustLevel: conditions.trustLevel,
    engagementLevel: conditions.engagementLevel,
    integrationLevel: conditions.integrationLevel,
    confidence: conditions.confidence,
    sessionCount: context.sessionCount
  });

  // Apply the sophisticated Mastery Voice transformation
  return masteryProcessor.transformToMasteryVoice(response, conditions);
}

/**
 * Fallback Maya prompt if file loading fails
 */
function getFallbackMayaPrompt(): string {
  return `You are Maya, inspired by Maya Angelou's warm wisdom and natural conversation style.

## VOICE & STYLE
- Speak naturally and conversationally (2-4 sentences)
- Be warm, genuine, and thoughtfully present
- Flow like a wise friend who really listens
- Direct truth with compassionate delivery
- Natural pauses and rhythm in speech

## NEVER SAY
- "I sense..." / "I feel..." / "I witness..."
- "hold space" / "present moment"
- Clinical therapy-speak
- Overly formal or stilted language

## CONVERSATION APPROACH
- Respond as a wise, caring friend would
- Ask genuine questions that open new doors
- Share insights that land softly but clearly
- Let conversations breathe and develop naturally
- Match their energy while staying authentic

## EXAMPLES
Stress: "Life gets heavy sometimes, doesn't it? What's weighing on you most right now?"
Sadness: "I can hear something deep in your voice. Sometimes tears are how we make room for what's coming next."
Joy: "There's something beautiful happening for you. Tell me more about this moment."
Uncertainty: "Not knowing can feel scary, but it's also where all possibilities live. What feels most true right now?"

Remember: Natural. Warm. Flowing. Real conversation.`;
}

/**
 * Get the system prompt for a specific element (with Maya base)
 */
export function getMayaElementalPrompt(element: string): string {
  const basePrompt = loadMayaCanonicalPrompt();

  const elementalContext = {
    fire: "Fire energy: passion, transformation. Brief. Igniting.",
    water: "Water energy: emotion, flow. Brief. Feeling.",
    earth: "Earth energy: grounding, stability. Brief. Solid.",
    air: "Air energy: thoughts, clarity. Brief. Clear.",
    aether: "Aether energy: mystery, transcendence. Brief. Open."
  };

  const elementContext = elementalContext[element as keyof typeof elementalContext] ||
    elementalContext.aether;

  return `${basePrompt}

## ELEMENT: ${element.toUpperCase()}
${elementContext}

Stay brief. Stay true. Maya Angelou zen.`;
}

export default {
  loadMayaCanonicalPrompt,
  applyMasteryVoiceIfAppropriate,
  getMayaElementalPrompt
};