// Oracle Cascade API - Full Pipeline with Visualization Data
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Types
interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface SpiralStage {
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: 1 | 2 | 3;
}

interface SessionPayload {
  sessionId: string;
  timestamp: string;
  elementalBalance: ElementalBalance;
  spiralStage: SpiralStage;
  reflection: string;
  practice: string;
  archetype: string;
  fullResponse?: string;
  stages?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      userId, 
      mode = 'full' // 'full' | 'quick' | 'balance-only'
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const sessionId = generateSessionId();
    const timestamp = new Date().toISOString();

    // Step 1: Run the 5-stage cascade
    const cascadeResult = await runCascade(query);

    // Step 2: Extract elemental balance
    const elementalBalance = await extractElementalBalance(cascadeResult.ontological);

    // Step 3: Map to spiral stage
    const spiralStage = await mapToSpiralStage(cascadeResult.spiralogic, elementalBalance);

    // Step 4: Extract final wisdom components
    const wisdomComponents = parseWisdomOutput(cascadeResult.output);

    // Step 5: Build session payload
    const payload: SessionPayload = {
      sessionId,
      timestamp,
      elementalBalance,
      spiralStage,
      reflection: wisdomComponents.reflection,
      practice: wisdomComponents.practice,
      archetype: wisdomComponents.archetype,
      ...(mode === 'full' && { 
        fullResponse: cascadeResult.output,
        stages: cascadeResult 
      })
    };

    // Step 6: Persist to database
    if (userId) {
      await persistSession(userId, query, payload);
    }

    // Step 7: Return payload for frontend
    return NextResponse.json(payload);

  } catch (error) {
    console.error('Oracle cascade error:', error);
    return NextResponse.json(
      { error: 'Oracle cascade failed' },
      { status: 500 }
    );
  }
}

// GET: Retrieve user's oracle journey
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { data: sessions, error } = await supabase
    .from('oracle_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate journey metrics
  const journey = calculateJourneyMetrics(sessions);

  return NextResponse.json({
    sessions,
    journey
  });
}

// Core cascade function
async function runCascade(query: string) {
  const stages = {
    ontological: '',
    temporal: '',
    implicit: '',
    spiralogic: '',
    output: ''
  };

  // Stage 1: Ontological
  const ontologicalPrompt = `
Analyze this input using elemental reasoning:
- Fire = teleological (purpose, goals, direction)
- Water = phenomenological (experience, emotion, flow)
- Earth = empirical (facts, structure, evidence)
- Air = analytical (patterns, models, concepts)
- Aether = metacognitive (synthesis, emergence, transcendence)

Input: ${query}

Generate one clear insight for each element.`;

  const response1 = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 500,
    messages: [{ role: 'user', content: ontologicalPrompt }]
  });
  const content1 = response1.content[0];
  stages.ontological = content1.type === 'text' ? content1.text : '';

  // Stage 2: Temporal
  const temporalPrompt = `
Previous analysis: ${stages.ontological}

Expand temporally:
- Past echoes: what patterns or influences are visible?
- Present clarity: what is happening now?
- Future trajectory: where could this evolve?`;

  const response2 = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 500,
    messages: [{ role: 'user', content: temporalPrompt }]
  });
  const content2 = response2.content[0];
  stages.temporal = content2.type === 'text' ? content2.text : '';

  // Stage 3: Implicit
  const implicitPrompt = `
Previous analysis: ${stages.temporal}

Identify dimensions:
- Explicit: clearly stated
- Implied: suggested but unsaid
- Emergent: patterns across time
- Shadow: avoided or denied
- Resonant: mythic/archetypal parallels`;

  const response3 = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 500,
    messages: [{ role: 'user', content: implicitPrompt }]
  });
  const content3 = response3.content[0];
  stages.implicit = content3.type === 'text' ? content3.text : '';

  // Stage 4: Spiralogic
  const spiralogicPrompt = `
Previous analysis: ${stages.implicit}

Map into Spiralogic cycle:
- Recognition (Air): identify the pattern
- Feeling (Water): explore emotional depth
- Grounding (Earth): validate against reality
- Activation (Fire): what action is invited
- Integration (Aether): contribution to wholeness

Create a narrative through these stages.`;

  const response4 = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 500,
    messages: [{ role: 'user', content: spiralogicPrompt }]
  });
  const content4 = response4.content[0];
  stages.spiralogic = content4.type === 'text' ? content4.text : '';

  // Stage 5: Output
  const outputPrompt = `
Previous analysis: ${stages.spiralogic}

Distill into:
1. Reflection: One clear question for contemplation
2. Practice: One simple, doable micro-practice
3. Archetype: One mythic/archetypal image

Format each clearly labeled.`;

  const response5 = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 300,
    messages: [{ role: 'user', content: outputPrompt }]
  });
  const content5 = response5.content[0];
  stages.output = content5.type === 'text' ? content5.text : '';

  return stages;
}

// Extract elemental balance from ontological analysis
async function extractElementalBalance(ontologicalText: string): Promise<ElementalBalance> {
  const prompt = `
From this elemental analysis, assign relative strengths (0-1 scale) based on:
- Length and depth of insight
- Emotional resonance
- Which element seems most activated

Analysis: ${ontologicalText}

Respond ONLY with JSON:
{
  "fire": 0.x,
  "water": 0.x,
  "earth": 0.x,
  "air": 0.x,
  "aether": 0.x
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const content = response.content[0];
    const responseText = content.type === 'text' ? content.text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse elemental balance:', e);
  }

  // Fallback: equal distribution
  return { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
}

// Map to spiral stage based on Spiralogic analysis
async function mapToSpiralStage(
  spiralogicText: string,
  balance: ElementalBalance
): Promise<SpiralStage> {
  const prompt = `
Based on this Spiralogic analysis and elemental balance, identify:
1. Which element is currently dominant (fire/water/earth/air)
2. Which stage within that element (1=beginning, 2=deepening, 3=completion)

Spiralogic: ${spiralogicText}
Balance: ${JSON.stringify(balance)}

Respond ONLY with JSON:
{
  "element": "fire|water|earth|air",
  "stage": 1|2|3
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const content = response.content[0];
    const responseText = content.type === 'text' ? content.text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse spiral stage:', e);
  }

  // Fallback: use highest balance element
  const dominant = Object.entries(balance)
    .filter(([k]) => k !== 'aether')
    .sort(([,a], [,b]) => b - a)[0][0] as any;

  return { element: dominant, stage: 2 };
}

// Parse wisdom components from final output
function parseWisdomOutput(outputText: string): {
  reflection: string;
  practice: string;
  archetype: string;
} {
  const reflection = outputText.match(/Reflection:?\s*(.+?)(?=Practice:|Archetype:|$)/si)?.[1]?.trim() 
    || 'What is seeking to emerge through you?';
  
  const practice = outputText.match(/Practice:?\s*(.+?)(?=Reflection:|Archetype:|$)/si)?.[1]?.trim()
    || 'Take three conscious breaths and listen.';
  
  const archetype = outputText.match(/Archetype:?\s*(.+?)(?=Reflection:|Practice:|$)/si)?.[1]?.trim()
    || 'The Seeker at the threshold.';

  return { reflection, practice, archetype };
}

// Persist session to database
async function persistSession(
  userId: string,
  query: string,
  payload: SessionPayload
) {
  const { error } = await supabase
    .from('oracle_sessions')
    .insert({
      user_id: userId,
      session_id: payload.sessionId,
      query,
      response: payload.fullResponse || '',
      stages: payload.stages || {},
      elements: payload.elementalBalance,
      spiral_stage: payload.spiralStage,
      reflection: payload.reflection,
      practice: payload.practice,
      archetype: payload.archetype,
      created_at: payload.timestamp
    });

  if (error) {
    console.error('Failed to persist session:', error);
  }
}

// Calculate journey metrics
function calculateJourneyMetrics(sessions: any[]) {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      dominantElement: 'balanced',
      currentStage: { element: 'air', stage: 1 },
      evolutionPath: [],
      nextGuidance: 'Begin with a question that matters.'
    };
  }

  // Calculate average elemental balance
  const avgBalance: ElementalBalance = {
    fire: 0, water: 0, earth: 0, air: 0, aether: 0
  };

  for (const session of sessions) {
    if (session.elements) {
      Object.keys(avgBalance).forEach(key => {
        avgBalance[key as keyof ElementalBalance] += 
          (session.elements[key] || 0) / sessions.length;
      });
    }
  }

  // Find dominant element
  const dominant = Object.entries(avgBalance)
    .sort(([,a], [,b]) => b - a)[0][0];

  // Track evolution path
  const evolutionPath = sessions
    .slice(0, 5)
    .map(s => s.spiral_stage)
    .filter(Boolean);

  // Generate guidance
  const nextGuidance = generateNextGuidance(dominant, sessions[0]?.spiral_stage);

  return {
    totalSessions: sessions.length,
    dominantElement: dominant,
    currentStage: sessions[0]?.spiral_stage || { element: 'air', stage: 1 },
    evolutionPath,
    averageBalance: avgBalance,
    nextGuidance
  };
}

function generateNextGuidance(dominant: string, currentStage?: SpiralStage): string {
  const guidanceMap: Record<string, string> = {
    fire: 'Your fire burns bright. What action awaits your courage?',
    water: 'Deep waters call. What feelings need witnessing?',
    earth: 'Ground yourself. What practical step creates stability?',
    air: 'Rise to see the pattern. What connects your questions?',
    aether: 'Integration beckons. What synthesis is emerging?'
  };

  return guidanceMap[dominant] || 'Trust your next intuitive step.';
}

function generateSessionId(): string {
  return `oracle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}