// Sacred Oracle API - Maps Claude cascade to specific Holoflower facets
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { SPIRALOGIC_FACETS } from '@/data/spiralogic-facets';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Enhanced prompt that maps to specific facets
const SACRED_ORACLE_PROMPT = `You are the Sacred Spiralogic Oracle, interpreting through the 12-facet Holoflower.

The 12 facets are arranged as:
- Air (9-12 o'clock): Recognition → Deepening → Integration of Vision
- Fire (12-3 o'clock): Spark → Momentum → Mastery of Will  
- Water (3-6 o'clock): Opening → Navigating → Emotional Wisdom
- Earth (6-9 o'clock): Foundation → Cultivating → Rooted Mastery

Process the input through:
1. Elemental resonance - which elements are activated?
2. Stage detection - beginning (1), deepening (2), or integration (3)?
3. Facet mapping - which specific petal best captures the essence?
4. Sacred guidance - what practice emerges from this position?

Map to the EXACT facet IDs:
- air-1, air-2, air-3
- fire-1, fire-2, fire-3
- water-1, water-2, water-3
- earth-1, earth-2, earth-3

Respond with JSON only:
{
  "primaryFacetId": "element-stage",
  "secondaryFacetIds": ["element-stage", ...],
  "elementalBalance": {
    "fire": 0.xx,
    "water": 0.xx,
    "earth": 0.xx,
    "air": 0.xx,
    "aether": 0.xx
  },
  "interpretation": {
    "essence": "core message",
    "practice": "specific action",
    "archetype": "mythic figure",
    "keywords": ["word1", "word2", "word3"]
  },
  "guidance": "personalized oracle message",
  "sessionId": "oracle-timestamp-random"
}`;

export async function POST(req: NextRequest) {
  try {
    const { query, checkIns = {}, userId } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Include user check-ins in context if provided
    const contextualPrompt = checkIns && Object.keys(checkIns).length > 0
      ? `${SACRED_ORACLE_PROMPT}\n\nUser has already marked these facets: ${JSON.stringify(checkIns)}\n\nQuery: ${query}`
      : `${SACRED_ORACLE_PROMPT}\n\nQuery: ${query}`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: contextualPrompt
        }
      ]
    });

    // Parse response
    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and enrich with facet data
    const primaryFacet = SPIRALOGIC_FACETS.find(f => f.id === result.primaryFacetId);
    if (!primaryFacet) {
      result.primaryFacetId = 'air-1'; // Default fallback
    }

    // Enrich response with facet details
    const enrichedResponse = {
      ...result,
      sessionId: result.sessionId || generateSessionId(),
      timestamp: new Date().toISOString(),
      facetDetails: {
        primary: primaryFacet || SPIRALOGIC_FACETS[0],
        secondary: result.secondaryFacetIds?.map((id: string) => 
          SPIRALOGIC_FACETS.find(f => f.id === id)
        ).filter(Boolean) || []
      },
      // Merge Claude's interpretation with facet wisdom
      mergedGuidance: mergeFacetWisdom(
        primaryFacet || SPIRALOGIC_FACETS[0],
        result.interpretation
      )
    };

    // Optional: Persist to database
    if (userId && process.env.SUPABASE_URL) {
      await persistOracleSession(userId, query, enrichedResponse);
    }

    return NextResponse.json(enrichedResponse);

  } catch (error) {
    console.error('Sacred Oracle error:', error);
    
    // Fallback to divination based on query keywords
    const fallbackFacet = selectFallbackFacet(req.body?.query || '');
    
    return NextResponse.json({
      primaryFacetId: fallbackFacet.id,
      secondaryFacetIds: [],
      elementalBalance: {
        fire: 0.25,
        water: 0.25,
        earth: 0.25,
        air: 0.25,
        aether: 0
      },
      interpretation: {
        essence: fallbackFacet.essence,
        practice: fallbackFacet.practice,
        archetype: fallbackFacet.archetype,
        keywords: fallbackFacet.keywords
      },
      guidance: `The ${fallbackFacet.element} element calls to you. ${fallbackFacet.practice}`,
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}

// GET endpoint for facet definitions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const facetId = searchParams.get('facetId');
  
  if (facetId) {
    const facet = SPIRALOGIC_FACETS.find(f => f.id === facetId);
    if (facet) {
      return NextResponse.json(facet);
    }
    return NextResponse.json({ error: 'Facet not found' }, { status: 404 });
  }
  
  // Return all facets
  return NextResponse.json({
    facets: SPIRALOGIC_FACETS,
    structure: {
      air: SPIRALOGIC_FACETS.filter(f => f.element === 'air'),
      fire: SPIRALOGIC_FACETS.filter(f => f.element === 'fire'),
      water: SPIRALOGIC_FACETS.filter(f => f.element === 'water'),
      earth: SPIRALOGIC_FACETS.filter(f => f.element === 'earth')
    }
  });
}

// Helper functions

function generateSessionId(): string {
  return `oracle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function mergeFacetWisdom(facet: typeof SPIRALOGIC_FACETS[0], interpretation: any) {
  return {
    essence: interpretation?.essence || facet.essence,
    practice: interpretation?.practice || facet.practice,
    archetype: interpretation?.archetype || facet.archetype,
    keywords: [...new Set([
      ...(interpretation?.keywords || []),
      ...facet.keywords
    ])].slice(0, 5),
    elementalWisdom: `${facet.element} at stage ${facet.stage}: ${facet.essence}`
  };
}

function selectFallbackFacet(query: string): typeof SPIRALOGIC_FACETS[0] {
  const lowerQuery = query.toLowerCase();
  
  // Keyword mapping to elements
  if (lowerQuery.includes('action') || lowerQuery.includes('energy') || lowerQuery.includes('purpose')) {
    return SPIRALOGIC_FACETS.find(f => f.element === 'fire' && f.stage === 1)!;
  }
  if (lowerQuery.includes('feeling') || lowerQuery.includes('emotion') || lowerQuery.includes('heart')) {
    return SPIRALOGIC_FACETS.find(f => f.element === 'water' && f.stage === 1)!;
  }
  if (lowerQuery.includes('ground') || lowerQuery.includes('practical') || lowerQuery.includes('real')) {
    return SPIRALOGIC_FACETS.find(f => f.element === 'earth' && f.stage === 1)!;
  }
  if (lowerQuery.includes('think') || lowerQuery.includes('understand') || lowerQuery.includes('pattern')) {
    return SPIRALOGIC_FACETS.find(f => f.element === 'air' && f.stage === 1)!;
  }
  
  // Default to Air-1 (Recognition)
  return SPIRALOGIC_FACETS[2];
}

async function persistOracleSession(userId: string, query: string, response: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from('sacred_oracle_sessions').insert({
      user_id: userId,
      session_id: response.sessionId,
      query,
      primary_facet_id: response.primaryFacetId,
      secondary_facet_ids: response.secondaryFacetIds,
      elemental_balance: response.elementalBalance,
      interpretation: response.interpretation,
      guidance: response.guidance,
      created_at: response.timestamp
    });
  } catch (error) {
    console.error('Failed to persist session:', error);
  }
}