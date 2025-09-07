// Coherence Analysis API - Maps journal sentiment to elemental activation
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { SPIRALOGIC_FACETS_COMPLETE, getFacetById } from '@/data/spiralogic-facets-complete';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Sentiment analysis prompt
const SENTIMENT_ANALYSIS_PROMPT = `Analyze this journal entry for emotional tone and elemental resonance.

Journal text: [INPUT]

Return JSON only:
{
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "emotionalTone": {
    "primary": "joy/fear/anger/sadness/excitement/calm/etc",
    "intensity": 0.0-1.0
  },
  "suggestedElements": {
    "fire": 0.0-1.0,
    "water": 0.0-1.0,
    "earth": 0.0-1.0,
    "air": 0.0-1.0,
    "aether": 0.0-1.0
  },
  "keywords": ["extracted", "key", "themes"]
}`;

// Alignment analysis prompt
const ALIGNMENT_ANALYSIS_PROMPT = `Compare journal themes with activated facets.

Journal keywords: [KEYWORDS]
User check-in facets: [CHECKINS]
Oracle facet: [ORACLE]

Evaluate alignment (0.0-1.0):
{
  "checkinAlignment": how well journal matches user's intuitive check-ins,
  "oracleAlignment": how well journal matches oracle guidance,
  "elementalResonance": overall elemental harmony
}`;

// Coherence calculation prompt
const COHERENCE_CALCULATION_PROMPT = `Calculate coherence index from these inputs:

Sentiment: [SENTIMENT]
Emotional intensity: [INTENSITY]
Checkin alignment: [CHECKIN_ALIGN]
Oracle alignment: [ORACLE_ALIGN]
Elemental resonance: [ELEM_RESONANCE]

Calculate:
{
  "coherenceIndex": 0.0-1.0 (weighted average),
  "components": {
    "emotional": 0.0-1.0,
    "intuitive": 0.0-1.0,
    "guided": 0.0-1.0
  },
  "reflection": "One-sentence insight about the coherence state",
  "recommendation": "Suggested practice to increase coherence"
}`;

export async function POST(req: NextRequest) {
  try {
    const { 
      journalText,
      checkIns = {},
      oracleFacetId,
      previousCoherence,
      userId
    } = await req.json();

    if (!journalText) {
      return NextResponse.json(
        { error: 'Journal text required' },
        { status: 400 }
      );
    }

    // Step 1: Analyze sentiment and elemental resonance
    const sentimentResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: SENTIMENT_ANALYSIS_PROMPT.replace('[INPUT]', journalText)
      }]
    });

    const sentimentData = parseJSON(sentimentResponse.content[0].text);

    // Step 2: Analyze alignment with check-ins and oracle
    const checkInFacets = Object.entries(checkIns)
      .filter(([_, intensity]) => intensity > 0)
      .map(([facetId, intensity]) => {
        const facet = getFacetById(facetId);
        return facet ? `${facetId}: ${facet.essence} (${intensity})` : null;
      })
      .filter(Boolean);

    const oracleFacet = oracleFacetId ? getFacetById(oracleFacetId) : null;

    const alignmentPrompt = ALIGNMENT_ANALYSIS_PROMPT
      .replace('[KEYWORDS]', JSON.stringify(sentimentData.keywords))
      .replace('[CHECKINS]', JSON.stringify(checkInFacets))
      .replace('[ORACLE]', oracleFacet ? `${oracleFacetId}: ${oracleFacet.essence}` : 'none');

    const alignmentResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 300,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: alignmentPrompt
      }]
    });

    const alignmentData = parseJSON(alignmentResponse.content[0].text);

    // Step 3: Calculate coherence index
    const coherencePrompt = COHERENCE_CALCULATION_PROMPT
      .replace('[SENTIMENT]', sentimentData.sentiment)
      .replace('[INTENSITY]', sentimentData.emotionalTone?.intensity || '0.5')
      .replace('[CHECKIN_ALIGN]', alignmentData.checkinAlignment || '0.5')
      .replace('[ORACLE_ALIGN]', alignmentData.oracleAlignment || '0.5')
      .replace('[ELEM_RESONANCE]', alignmentData.elementalResonance || '0.5');

    const coherenceResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      temperature: 0.6,
      messages: [{
        role: 'user',
        content: coherencePrompt
      }]
    });

    const coherenceData = parseJSON(coherenceResponse.content[0].text);

    // Calculate trend if we have previous coherence
    let trend = 'stable';
    if (previousCoherence) {
      const diff = coherenceData.coherenceIndex - previousCoherence;
      trend = diff > 0.1 ? 'rising' : diff < -0.1 ? 'falling' : 'stable';
    }

    // Build complete response
    const result = {
      timestamp: new Date().toISOString(),
      coherenceIndex: coherenceData.coherenceIndex || 0.5,
      components: coherenceData.components || {
        emotional: 0.5,
        intuitive: 0.5,
        guided: 0.5
      },
      sentiment: sentimentData.sentiment,
      emotionalTone: sentimentData.emotionalTone,
      suggestedElements: sentimentData.suggestedElements,
      alignment: {
        checkin: alignmentData.checkinAlignment || 0.5,
        oracle: alignmentData.oracleAlignment || 0.5,
        elemental: alignmentData.elementalResonance || 0.5
      },
      reflection: coherenceData.reflection || 'Finding balance between inner and outer wisdom.',
      recommendation: coherenceData.recommendation || 'Continue journaling to deepen self-awareness.',
      trend,
      keywords: sentimentData.keywords || []
    };

    // Persist to database if userId provided
    if (userId && process.env.SUPABASE_URL) {
      await persistCoherenceData(userId, journalText, result);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Coherence analysis error:', error);
    
    // Fallback coherence calculation
    return NextResponse.json({
      coherenceIndex: 0.5,
      components: {
        emotional: 0.5,
        intuitive: 0.5,
        guided: 0.5
      },
      sentiment: 'neutral',
      reflection: 'Unable to fully analyze coherence. Continue exploring.',
      recommendation: 'Try journaling about what feels most alive right now.',
      error: true
    });
  }
}

// GET endpoint for coherence history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const days = parseInt(searchParams.get('days') || '30');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const coherenceHistory = await getCoherenceHistory(userId, days);
    
    // Calculate statistics
    const stats = calculateCoherenceStats(coherenceHistory);

    return NextResponse.json({
      history: coherenceHistory,
      stats,
      trend: detectCoherenceTrend(coherenceHistory)
    });

  } catch (error) {
    console.error('Failed to fetch coherence history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// Helper functions

function parseJSON(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('JSON parse error:', e);
  }
  return {};
}

async function persistCoherenceData(userId: string, journalText: string, data: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from('coherence_tracking').insert({
      user_id: userId,
      journal_text: journalText,
      coherence_index: data.coherenceIndex,
      components: data.components,
      sentiment: data.sentiment,
      emotional_tone: data.emotionalTone,
      suggested_elements: data.suggestedElements,
      alignment: data.alignment,
      reflection: data.reflection,
      recommendation: data.recommendation,
      keywords: data.keywords,
      created_at: data.timestamp
    });
  } catch (error) {
    console.error('Failed to persist coherence data:', error);
  }
}

async function getCoherenceHistory(userId: string, days: number) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('coherence_tracking')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

function calculateCoherenceStats(history: any[]) {
  if (history.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      current: 0,
      volatility: 0
    };
  }

  const indices = history.map(h => h.coherence_index);
  const average = indices.reduce((sum, val) => sum + val, 0) / indices.length;
  const min = Math.min(...indices);
  const max = Math.max(...indices);
  const current = indices[indices.length - 1];

  // Calculate volatility (standard deviation)
  const variance = indices.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / indices.length;
  const volatility = Math.sqrt(variance);

  return { average, min, max, current, volatility };
}

function detectCoherenceTrend(history: any[]) {
  if (history.length < 3) return 'insufficient_data';

  // Compare first third vs last third
  const thirdSize = Math.floor(history.length / 3);
  const firstThird = history.slice(0, thirdSize);
  const lastThird = history.slice(-thirdSize);

  const firstAvg = firstThird.reduce((sum, h) => sum + h.coherence_index, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, h) => sum + h.coherence_index, 0) / lastThird.length;

  const diff = lastAvg - firstAvg;

  if (diff > 0.1) return 'improving';
  if (diff < -0.1) return 'declining';
  return 'stable';
}