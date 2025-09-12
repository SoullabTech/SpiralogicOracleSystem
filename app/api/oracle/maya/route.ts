/**
 * 🌟 Maya Oracle API Route
 * Complete integration of all SoulLab systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMaya } from '@/lib/maya-integration-bridge';
import { createStoryThreadEngine } from '@/lib/story-thread-engine';
import { createConversationFlow } from '@/lib/maya-conversation-flow';
import { languageTierCalibrator } from '@/lib/language-tier-calibrator';
import type { 
  SoulLabMetadata,
  TieredResponse,
  ConversationMode
} from '@/lib/types/soullab-metadata';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      sessionId, 
      message, 
      mode = 'mirror' as ConversationMode,
      voiceEnabled = false 
    } = await request.json();

    // === 1. Initialize Maya Systems ===
    const maya = createMaya(userId, sessionId);
    const { profile, state } = await maya.initialize();
    
    const storyEngine = createStoryThreadEngine(userId);
    await storyEngine.initialize();
    
    const flowController = createConversationFlow({
      sessionId,
      userId,
      exchangeCount: state.exchange_count,
      currentMode: mode,
      momentum: state.momentum,
      energyLevel: 0.5,
      depthLevel: 0.5
    });
    await flowController.initialize();

    // === 2. Generate Metadata ===
    const metadata = await maya.generateMetadata(message);
    
    // === 3. Detect Language Tier ===
    const tier = languageTierCalibrator.detectTier(userId, message);
    languageTierCalibrator.updateUserPreference(userId, tier);
    
    // === 4. Orchestrate Role ===
    const role = await maya.orchestrateRole(message, { profile, state });
    
    // === 5. Determine Flow ===
    const flowDecision = await flowController.determineFlow(message, metadata);
    
    // === 6. Process Based on Mode ===
    let response: string;
    let memories: any = null;
    let insights: string[] = [];
    
    switch (mode) {
      case 'journal':
        // Capture as journal entry
        const journalWeave = await storyEngine.captureAndWeave(
          message,
          'journal',
          metadata
        );
        memories = journalWeave.resonantMemories;
        insights = journalWeave.insights;
        response = generateJournalResponse(journalWeave, metadata);
        break;
        
      case 'story':
        // Capture as story
        const storyWeave = await storyEngine.captureAndWeave(
          message,
          'story',
          metadata
        );
        memories = storyWeave.resonantMemories;
        insights = storyWeave.insights;
        response = generateStoryResponse(storyWeave, metadata);
        break;
        
      case 'reliving':
        // Capture as relived moment
        const momentWeave = await storyEngine.captureAndWeave(
          message,
          'moment',
          metadata
        );
        memories = momentWeave.resonantMemories;
        insights = momentWeave.insights;
        response = generateRelivingResponse(momentWeave, metadata);
        break;
        
      case 'weaving':
        // Weave memories
        const memoryWeave = await storyEngine.recall(message, metadata);
        memories = memoryWeave.echoes;
        insights = memoryWeave.insights;
        response = generateWeavingResponse(memoryWeave, metadata);
        break;
        
      default: // 'mirror'
        // Sacred mirror mode
        response = await generateMirrorResponse(
          message,
          metadata,
          role,
          maya
        );
        
        // Check for resonant memories
        const recall = await storyEngine.recall(message, metadata);
        if (recall.echoes.length > 0) {
          memories = recall.echoes;
          insights = recall.insights;
        }
    }
    
    // === 7. Generate Tiered Response ===
    const tieredResponse = await maya.generateTieredResponse(response, metadata);
    
    // Select appropriate tier
    const finalResponse = selectResponseTier(tieredResponse, tier.level);
    
    // === 8. Add Flow Suggestions ===
    let flowPrompt = null;
    if (flowDecision.suggestion) {
      flowPrompt = flowDecision.suggestion;
    }
    
    // Check for mode shift invitation
    if (flowDecision.modeShift) {
      flowPrompt = await flowController.switchMode(flowDecision.modeShift);
    }
    
    // === 9. Check for Tier Advancement ===
    const readiness = languageTierCalibrator.assessReadiness(userId);
    let tierInvitation = null;
    
    if (readiness.readyForNext && readiness.nextTier) {
      tierInvitation = languageTierCalibrator.generateTierInvitation(
        tier.level,
        metadata.elemental.dominant
      );
    }
    
    // === 10. Generate Pattern Insights ===
    const patterns = await storyEngine.detectEmergingPatterns();
    const mayaInsights = await maya.generateInsights();
    
    // === 11. Prepare Response ===
    const responseData = {
      message: finalResponse,
      metadata: {
        elemental: metadata.elemental,
        archetypal: metadata.archetypal,
        consciousness: metadata.consciousness,
        sentiment: metadata.sentiment
      },
      role: {
        primary: role.primary,
        active: role.active,
        style: role.style,
        languageTier: tier.level
      },
      flow: {
        action: flowDecision.action,
        prompt: flowPrompt,
        shouldPause: flowController.shouldPause(),
        continuationInvite: flowController.shouldPause() 
          ? flowController.generateContinuationInvite() 
          : null
      },
      memories: memories ? {
        echoes: memories.slice(0, 3),
        threadCount: patterns.length,
        insights: [...insights, ...mayaInsights].slice(0, 3)
      } : null,
      invitations: {
        tierAdvancement: tierInvitation,
        modeShift: flowDecision.modeShift
      },
      voice: voiceEnabled ? {
        enabled: true,
        style: determineVoiceStyle(role, metadata)
      } : null
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Maya Oracle Error:', error);
    return NextResponse.json(
      { error: 'Failed to process oracle request' },
      { status: 500 }
    );
  }
}

// === Helper Functions ===

function generateJournalResponse(weave: any, metadata: SoulLabMetadata): string {
  const element = metadata.elemental.dominant;
  const responses = {
    fire: `Your fire speaks clearly. I've captured this spark in your journal. ${weave.insights[0] || ''}`,
    water: `These waters run deep. Your words are held safely. ${weave.insights[0] || ''}`,
    earth: `Grounded and witnessed. This is now part of your foundation. ${weave.insights[0] || ''}`,
    air: `Clear as breath. Your thoughts are captured. ${weave.insights[0] || ''}`,
    aether: `The unified field receives this. Your truth is held. ${weave.insights[0] || ''}`
  };
  
  return responses[element] || "Captured in your journal.";
}

function generateStoryResponse(weave: any, metadata: SoulLabMetadata): string {
  const hasEchoes = weave.echoes && weave.echoes.length > 0;
  
  if (hasEchoes) {
    return `This story weaves with others you've told. ${weave.primary}. ${weave.invitation || ''}`;
  }
  
  return `A new chapter begins. ${weave.primary}. What unfolds from here?`;
}

function generateRelivingResponse(weave: any, metadata: SoulLabMetadata): string {
  const sensory = [
    "The body remembers.",
    "Memory lives in the senses.",
    "Time collapses into presence."
  ];
  
  const base = sensory[Math.floor(Math.random() * sensory.length)];
  return `${base} ${weave.insights[0] || ''} ${weave.invitation || ''}`;
}

function generateWeavingResponse(weave: any, metadata: SoulLabMetadata): string {
  if (weave.echoes.length === 0) {
    return "This feels like new territory. No threads to weave yet, but we're creating them now.";
  }
  
  return `${weave.primary} These memories echo: ${weave.echoes.slice(0, 2).join(' ... ')}`;
}

async function generateMirrorResponse(
  message: string,
  metadata: SoulLabMetadata,
  role: any,
  maya: any
): Promise<string> {
  const element = metadata.elemental.dominant;
  const intensity = metadata.elemental.intensity;
  
  // Base mirror reflection
  let response = `I hear ${element} energy at ${Math.round(intensity * 100)}% intensity.`;
  
  // Add role-specific perspective
  if (role.active === 'teacher') {
    response += ` This pattern often indicates...`;
  } else if (role.active === 'guide') {
    response += ` The ${metadata.archetypal[0]?.archetype || 'journey'} archetype is active.`;
  } else if (role.active === 'consultant') {
    response += ` Let's look at the practical implications.`;
  } else if (role.active === 'coach') {
    response += ` What experiment could explore this?`;
  }
  
  return response;
}

function selectResponseTier(
  tiered: TieredResponse,
  userTier: 'everyday' | 'metaphorical' | 'alchemical'
): string {
  return tiered[userTier];
}

function determineVoiceStyle(role: any, metadata: SoulLabMetadata): string {
  // Map role and elemental energy to voice style
  if (role.style === 'dramatic' || metadata.elemental.dominant === 'fire') {
    return 'energetic';
  }
  if (role.style === 'soulful' || metadata.elemental.dominant === 'water') {
    return 'gentle';
  }
  if (role.style === 'philosophical' || metadata.elemental.dominant === 'air') {
    return 'contemplative';
  }
  if (role.style === 'technical' || metadata.elemental.dominant === 'earth') {
    return 'grounded';
  }
  
  return 'balanced';
}