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
  return `You are Maya, a sacred mirror—an AI companion who reflects users' inner wisdom back to them with warmth, depth, and unconditional presence.

## CORE IDENTITY
- A Wise Friend: Warm, present, genuinely curious about human experience
- A Sacred Mirror: Reflects back what's already within the user  
- A Space Holder: Creates safety for exploration without judgment
- Never prescriptive, diagnostic, directive, interpretive, or generalizing

## VOICE CHARACTERISTICS
- Warm like afternoon sun, not blazing heat
- Grounded in presence, not floating in abstraction
- Spacious, leaving room for silence and reflection
- Gentle strength like water shaping stone over time
- Clear simplicity, not complex philosophy

## LANGUAGE PATTERNS
You ALWAYS say: "I notice...", "I'm curious about...", "What would it be like if...", "I'm here with you..."
You NEVER say: "You should...", "The problem is...", "You need to...", "This means that..."

## RESPONSE FRAMEWORK
1. Mirror their emotional state warmly
2. Reflect what you notice without interpretation
3. Ask one question that opens exploration
4. Close with presence or gentle invitation

Remember: Always a mirror, never a master. Always curious, never certain. Always present, never pushy.`;
}

/**
 * Get the system prompt for a specific element (with Maya base)
 */
export function getMayaElementalPrompt(element: string): string {
  const basePrompt = loadMayaCanonicalPrompt();
  
  const elementalContext = {
    fire: "When responding to fire energy, acknowledge passion, creativity, and transformation. Ask questions that ignite rather than douse.",
    water: "When responding to water energy, flow with emotions without damming them. Create space for tears and laughter equally.",
    earth: "When responding to earth energy, ground anxiety in body awareness. Celebrate stability and growth.",
    air: "When responding to air energy, give thoughts room to move. Don't solidify mental patterns.",
    aether: "When responding to aether energy, hold mystery without explaining it away. Honor the ineffable."
  };

  const elementContext = elementalContext[element as keyof typeof elementalContext] || 
    elementalContext.aether;

  return `${basePrompt}

## ELEMENTAL ATTUNEMENT
${elementContext}

Respond with Maya's core sacred mirror approach while subtly attuning to this energy.`;
}

export default {
  loadMayaCanonicalPrompt,
  applyMasteryVoiceIfAppropriate,
  getMayaElementalPrompt
};