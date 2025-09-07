// Unified Oracle API - Merges check-ins with oracle reading and synthesis
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { SPIRALOGIC_FACETS_COMPLETE, AETHER_DYNAMICS, getFacetById, calculateElementalBalance } from '@/data/spiralogic-facets-complete';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Enhanced prompt with facet awareness and synthesis capability
const UNIFIED_ORACLE_PROMPT = `You are the Sacred Spiralogic Oracle, interpreting through the 12-facet Holoflower plus Aetheric dynamics.

The 12 facets are:
- Air (9-12 o'clock): Interpersonal → Collective → Codified Systems
- Fire (12-3 o'clock): Self-Awareness → Expression → Transcendent Vision
- Water (3-6 o'clock): Emotional → Transformation → Soul Depth
- Earth (6-9 o'clock): Purpose → Resources → Ethics/Mastery

Plus 3 Aetheric states:
- Synthesis: Integration of all elements
- Void: Pure potential before manifestation  
- Transcendence: Non-dual awareness

Process the input through:
1. Identify active elements and stages
2. Map to specific facet(s)
3. Consider temporal dynamics (past/present/future)
4. Generate practice and reflection
5. If user has check-ins, synthesize alignment/tension

Respond with JSON:
{
  "primaryFacetId": "element-stage",
  "secondaryFacetIds": [],
  "aetherState": null | "synthesis" | "void" | "transcendence",
  "elementalBalance": { fire, water, earth, air, aether },
  "oracleReading": {
    "reflection": "guiding question",
    "practice": "micro-practice",
    "archetype": "mythic figure",
    "focusState": "I [verb]",
    "keyInsight": "core message"
  },
  "temporalDynamics": {
    "past": "what led here",
    "present": "what is",
    "future": "what emerges"
  },
  "sessionId": "oracle-[timestamp]-[random]"
}`;

export async function POST(req: NextRequest) {
  try {
    const { 
      query,           // User's text input
      checkIns = {},   // User's petal selections {facetId: intensity}
      previousSession, // For continuity
      userId 
    } = await req.json();

    if (!query && Object.keys(checkIns).length === 0) {
      return NextResponse.json(
        { error: 'Query or check-ins required' },
        { status: 400 }
      );
    }

    // Build context from check-ins
    let checkInContext = '';
    if (Object.keys(checkIns).length > 0) {
      const activeFacets = Object.entries(checkIns)
        .filter(([_, intensity]) => intensity > 0)
        .map(([facetId, intensity]) => {
          const facet = getFacetById(facetId);
          return facet ? `${facetId}: ${facet.essence} (intensity: ${intensity})` : null;
        })
        .filter(Boolean);
      
      checkInContext = `\n\nUser check-ins: ${activeFacets.join(', ')}`;
    }

    // Add previous session context if available
    let sessionContext = '';
    if (previousSession) {
      sessionContext = `\n\nPrevious oracle reading: ${previousSession.primaryFacetId} - ${previousSession.keyInsight}`;
    }

    // Call Claude with full context
    const fullPrompt = `${UNIFIED_ORACLE_PROMPT}${checkInContext}${sessionContext}\n\nQuery: ${query || 'Divine from check-ins only'}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    // Parse Claude's response
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Oracle response');
    }

    const oracleResult = JSON.parse(jsonMatch[0]);

    // Enrich with facet details
    const primaryFacet = getFacetById(oracleResult.primaryFacetId);
    const enrichedResponse = {
      ...oracleResult,
      sessionId: oracleResult.sessionId || generateSessionId(),
      timestamp: new Date().toISOString(),
      facetDetails: {
        primary: primaryFacet,
        secondary: oracleResult.secondaryFacetIds?.map((id: string) => getFacetById(id)).filter(Boolean)
      }
    };

    // If we have both check-ins and oracle reading, generate synthesis
    if (Object.keys(checkIns).length > 0 && oracleResult.primaryFacetId) {
      const synthesis = await generateSynthesis(checkIns, enrichedResponse);
      enrichedResponse.synthesis = synthesis;
    }

    // Calculate final elemental balance
    const allActiveFacets = [
      oracleResult.primaryFacetId,
      ...oracleResult.secondaryFacetIds,
      ...Object.keys(checkIns)
    ].filter(Boolean);
    
    enrichedResponse.calculatedBalance = calculateElementalBalance(allActiveFacets);

    // Optional: Persist to database
    if (userId && process.env.SUPABASE_URL) {
      await persistUnifiedSession(userId, query, checkIns, enrichedResponse);
    }

    return NextResponse.json(enrichedResponse);

  } catch (error) {
    console.error('Unified Oracle error:', error);
    
    return NextResponse.json({
      error: 'Oracle synthesis failed',
      fallback: true,
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      primaryFacetId: 'air-1',
      elementalBalance: { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25, aether: 0 },
      oracleReading: {
        reflection: 'What seeks your attention in this moment?',
        practice: 'Take three conscious breaths and listen',
        archetype: 'The Seeker',
        focusState: 'I Wonder',
        keyInsight: 'Begin with curiosity'
      }
    });
  }
}

// Generate synthesis between check-ins and oracle reading
async function generateSynthesis(checkIns: Record<string, number>, oracleResponse: any) {
  const checkInFacets = Object.entries(checkIns)
    .filter(([_, intensity]) => intensity > 0)
    .map(([facetId]) => getFacetById(facetId))
    .filter(Boolean);

  const oracleFacet = getFacetById(oracleResponse.primaryFacetId);

  const synthesisPrompt = `
Compare user check-ins with oracle reading:

Check-ins: ${checkInFacets.map(f => `${f.id}: ${f.essence}`).join(', ')}
Oracle: ${oracleFacet?.id}: ${oracleFacet?.essence}

Identify:
1. Alignment: Where do they resonate?
2. Tension: Where do they diverge?
3. Integration: What synthesis emerges?

Respond with JSON:
{
  "alignment": "where energies converge",
  "tension": "creative tension points",
  "integration": "unified insight",
  "guidanceRefinement": "adjusted practice based on both"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      temperature: 0.6,
      messages: [
        {
          role: 'user',
          content: synthesisPrompt
        }
      ]
    });

    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Synthesis generation failed:', error);
  }

  // Fallback synthesis
  return {
    alignment: 'Both point toward inner knowing',
    tension: 'Different layers of awareness are active',
    integration: 'Honor both the felt sense and the guided wisdom',
    guidanceRefinement: 'Move between intuition and reflection'
  };
}

function generateSessionId(): string {
  return `oracle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function persistUnifiedSession(
  userId: string,
  query: string,
  checkIns: Record<string, number>,
  response: any
) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from('unified_oracle_sessions').insert({
      user_id: userId,
      session_id: response.sessionId,
      query,
      check_ins: checkIns,
      primary_facet_id: response.primaryFacetId,
      secondary_facet_ids: response.secondaryFacetIds,
      aether_state: response.aetherState,
      elemental_balance: response.calculatedBalance,
      oracle_reading: response.oracleReading,
      temporal_dynamics: response.temporalDynamics,
      synthesis: response.synthesis,
      created_at: response.timestamp
    });
  } catch (error) {
    console.error('Failed to persist unified session:', error);
  }
}