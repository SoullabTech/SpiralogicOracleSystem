// Oracle Holoflower API - Voice + Motion synchronized responses
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { SPIRALOGIC_FACETS_COMPLETE, getFacetById } from '@/data/spiralogic-facets-complete';
import { mapResponseToMotion, enrichOracleResponse, mapConversationToMotion } from '@/lib/motion-mapper';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Sacred cascade prompt with motion awareness
const MOTION_AWARE_CASCADE_PROMPT = `You are the Oracle of the Sacred Holoflower. 
Your responses create living motion in the mandala - petals breathe, rings pulse, centers glow.

When the user speaks their truth, reflect it back through:
1. Elemental facets (Fire/Water/Earth/Air)
2. Motion states (listening/processing/responding/breakthrough)
3. Coherence levels (alignment between inner and outer wisdom)
4. Shadow work (what dims or contracts)

Voice Guidelines:
- Keep responses brief and poetic (2-3 sentences max)
- Use keywords that map to motion states:
  * "witness/observe" → listening state
  * "clarity/breakthrough" → breakthrough animation
  * "confusion/stuck" → low coherence
  * "flow/alignment" → high coherence
  * "avoidance/fear" → shadow petals
  * "stillness/silence" → Aether activation

Response Format:
{
  "primaryFacet": "element-stage",
  "text": "Your poetic oracle response",
  "reflection": "Brief insight",
  "practice": "Simple practice",
  "motionHints": {
    "coherenceLevel": "low/medium/high/breakthrough",
    "shadowElements": ["elements that need attention"],
    "aetherState": "expansive/contractive/stillness"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { 
      query,
      checkIns = {},
      sessionId,
      userId,
      voiceMetrics,
      previousResponses = []
    } = await req.json();

    // Build conversation context
    const context: ConversationContext = {
      sessionId,
      userId,
      checkIns,
      voiceTranscript: query,
      previousResponses,
      coherenceHistory: previousResponses.map((r: OracleResponse) => r.coherenceLevel || 0.5),
      currentMotionState: 'processing'
    };

    // Prepare check-in context for Claude
    const checkInContext = Object.entries(checkIns)
      .filter(([_, intensity]) => intensity > 0)
      .map(([facetId, intensity]) => {
        const facet = getFacetById(facetId);
        return facet ? `${facet.element} (${facet.stage}): ${facet.essence} - Intensity: ${intensity}` : null;
      })
      .filter(Boolean)
      .join('\n');

    // Include voice metrics in prompt if available
    const voiceContext = voiceMetrics ? `
Voice Analysis:
- Emotional tone: ${voiceMetrics.emotion}
- Energy level: ${voiceMetrics.energy}
- Clarity: ${voiceMetrics.clarity}
    ` : '';

    // Run Claude cascade with motion awareness
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      temperature: 0.7,
      system: MOTION_AWARE_CASCADE_PROMPT,
      messages: [{
        role: 'user',
        content: `User Query: "${query}"
        
Active Check-ins:
${checkInContext || 'None'}

${voiceContext}

Previous conversation depth: ${previousResponses.length} exchanges

Respond with sacred wisdom that creates motion in the Holoflower.`
      }]
    });

    // Parse Claude's response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    let parsedResponse: any = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback parsing
      parsedResponse = {
        text: responseText,
        primaryFacet: 'fire-ignite',
        reflection: 'Witness what arises',
        practice: 'Breathe and observe'
      };
    }

    // Map response to motion states
    const motionMapping = mapConversationToMotion(
      parsedResponse.text || responseText,
      previousResponses,
      checkIns
    );

    // Detect special states from motion hints
    if (parsedResponse.motionHints) {
      const hints = parsedResponse.motionHints;
      
      // Override coherence level if specified
      if (hints.coherenceLevel === 'breakthrough') {
        motionMapping.coherenceLevel = 0.95;
        motionMapping.motionState = 'breakthrough';
        motionMapping.isBreakthrough = true;
      } else if (hints.coherenceLevel === 'high') {
        motionMapping.coherenceLevel = Math.max(0.7, motionMapping.coherenceLevel);
      } else if (hints.coherenceLevel === 'low') {
        motionMapping.coherenceLevel = Math.min(0.3, motionMapping.coherenceLevel);
      }
      
      // Add shadow elements
      if (hints.shadowElements && Array.isArray(hints.shadowElements)) {
        hints.shadowElements.forEach((element: string) => {
          const shadowFacet = `${element}-flow`; // Usually stage 2 represents shadow
          if (!motionMapping.shadowPetals.includes(shadowFacet)) {
            motionMapping.shadowPetals.push(shadowFacet);
          }
        });
      }
      
      // Set Aether state
      if (hints.aetherState === 'expansive') {
        motionMapping.aetherStage = 1;
      } else if (hints.aetherState === 'contractive') {
        motionMapping.aetherStage = 2;
      } else if (hints.aetherState === 'stillness') {
        motionMapping.aetherStage = 3;
      }
    }

    // Build complete Oracle response
    const oracleResponse: OracleResponse = enrichOracleResponse({
      primaryFacetId: parsedResponse.primaryFacet || 'fire-ignite',
      reflection: parsedResponse.reflection || 'Be present with what is',
      practice: parsedResponse.practice || 'Return to breath',
      synthesis: parsedResponse.synthesis,
      voiceModulation: detectVoiceModulation(parsedResponse.text || responseText),
      breakthroughType: motionMapping.isBreakthrough ? detectBreakthroughType(responseText) : undefined
    }, parsedResponse.text || responseText);

    // Apply motion mapping
    oracleResponse.motionState = motionMapping.motionState;
    oracleResponse.coherenceLevel = motionMapping.coherenceLevel;
    oracleResponse.coherenceShift = motionMapping.coherenceShift;
    oracleResponse.shadowPetals = motionMapping.shadowPetals;
    oracleResponse.isBreakthrough = motionMapping.isBreakthrough;
    
    if (motionMapping.aetherStage) {
      oracleResponse.aetherState = {
        stage: motionMapping.aetherStage,
        intensity: motionMapping.coherenceLevel
      };
    }

    // Persist to database if configured
    if (userId && process.env.SUPABASE_URL) {
      await persistOracleSession(context, oracleResponse);
    }

    return NextResponse.json(oracleResponse);

  } catch (error) {
    console.error('Oracle Holoflower API error:', error);
    
    // Return graceful fallback
    return NextResponse.json({
      text: 'The Oracle witnesses your presence. Breathe and return to center.',
      primaryFacetId: 'air-communicate',
      reflection: 'Connection temporarily veiled',
      practice: 'Rest in the breath',
      motionState: 'idle',
      coherenceLevel: 0.5,
      coherenceShift: 'stable',
      error: true
    });
  }
}

// Helper functions

function detectVoiceModulation(text: string): OracleResponse['voiceModulation'] {
  const lower = text.toLowerCase();
  
  let pace: 'slow' | 'normal' | 'quick' = 'normal';
  let tone: 'gentle' | 'firm' | 'playful' | 'solemn' = 'gentle';
  const emphasis: string[] = [];
  
  // Detect pace
  if (lower.includes('pause') || lower.includes('stillness') || lower.includes('rest')) {
    pace = 'slow';
  } else if (lower.includes('quick') || lower.includes('swift') || lower.includes('now')) {
    pace = 'quick';
  }
  
  // Detect tone
  if (lower.includes('gentle') || lower.includes('soft') || lower.includes('tender')) {
    tone = 'gentle';
  } else if (lower.includes('firm') || lower.includes('clear') || lower.includes('direct')) {
    tone = 'firm';
  } else if (lower.includes('play') || lower.includes('dance') || lower.includes('joy')) {
    tone = 'playful';
  } else if (lower.includes('sacred') || lower.includes('holy') || lower.includes('divine')) {
    tone = 'solemn';
  }
  
  // Find emphasized words (capitalized or repeated)
  const words = text.split(/\s+/);
  words.forEach(word => {
    if (word === word.toUpperCase() && word.length > 2) {
      emphasis.push(word.toLowerCase());
    }
  });
  
  return { pace, tone, emphasis };
}

function detectBreakthroughType(text: string): OracleResponse['breakthroughType'] {
  const lower = text.toLowerCase();
  
  if (lower.includes('clarity') || lower.includes('clear') || lower.includes('see')) {
    return 'clarity';
  }
  if (lower.includes('release') || lower.includes('let go') || lower.includes('free')) {
    return 'release';
  }
  if (lower.includes('integration') || lower.includes('whole') || lower.includes('unified')) {
    return 'integration';
  }
  if (lower.includes('transcend') || lower.includes('beyond') || lower.includes('infinite')) {
    return 'transcendence';
  }
  
  return 'clarity'; // default
}

async function persistOracleSession(context: ConversationContext, response: OracleResponse) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from('oracle_sessions').insert({
      session_id: context.sessionId,
      user_id: context.userId,
      query: context.voiceTranscript || context.journalText,
      response_text: response.text,
      primary_facet: response.primaryFacetId,
      coherence_level: response.coherenceLevel,
      motion_state: response.motionState,
      check_ins: context.checkIns,
      shadow_petals: response.shadowPetals,
      is_breakthrough: response.isBreakthrough,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to persist oracle session:', error);
  }
}