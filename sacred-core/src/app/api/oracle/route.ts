import { NextRequest, NextResponse } from 'next/server';
import { analyzeShadow } from '@/sacred-apis/shadow';
import { detectAether } from '@/sacred-apis/aether';
import { processDocs } from '@/sacred-apis/docs';
import { senseCollective } from '@/sacred-apis/collective';
import { findResonance } from '@/sacred-apis/resonance';

// Sacred Core Pipeline
async function runSacredPipeline(input: string, mode: string = 'oracle') {
  // Core oracle processing
  const pipeline = {
    // 1. Intent Recognition
    intent: await recognizeIntent(input),
    
    // 2. Motion State
    motion: await calculateMotionState(input),
    
    // 3. Coherence Level
    coherence: await measureCoherence(input),
    
    // 4. Oracle Response
    response: await generateOracleResponse(input, mode),
    
    // 5. Audio/Voice (if enabled)
    audio: mode === 'voice' ? await generateVoiceResponse(input) : null,
  };

  return pipeline;
}

// Filter active results (hide dormant APIs unless activated)
function filterActive(baseResponse: any, latentResponses: any) {
  const result = {
    ...baseResponse,
    metadata: {
      timestamp: new Date().toISOString(),
      mode: baseResponse.mode || 'oracle',
    }
  };

  // Only include latent APIs if explicitly enabled
  const activeLatent: any = {};
  
  if (process.env.ENABLE_SHADOW === 'true' && latentResponses.shadow) {
    activeLatent.shadow = latentResponses.shadow;
  }
  
  if (process.env.ENABLE_AETHER === 'true' && latentResponses.aether) {
    activeLatent.aether = latentResponses.aether;
  }
  
  if (process.env.ENABLE_DOCS === 'true' && latentResponses.docs) {
    activeLatent.docs = latentResponses.docs;
  }
  
  if (process.env.ENABLE_COLLECTIVE === 'true' && latentResponses.collective) {
    activeLatent.collective = latentResponses.collective;
  }
  
  if (process.env.ENABLE_RESONANCE === 'true' && latentResponses.resonance) {
    activeLatent.resonance = latentResponses.resonance;
  }

  if (Object.keys(activeLatent).length > 0) {
    result.latent = activeLatent;
  }

  return result;
}

// Intent recognition
async function recognizeIntent(input: string) {
  // Simple intent recognition
  const intents = {
    guidance: /guide|help|advice|wisdom/i.test(input),
    reflection: /reflect|think|consider|ponder/i.test(input),
    transformation: /change|transform|evolve|grow/i.test(input),
    oracle: /oracle|divine|sacred|spiritual/i.test(input),
  };

  return Object.entries(intents)
    .filter(([_, matches]) => matches)
    .map(([intent]) => intent);
}

// Motion state calculation
async function calculateMotionState(input: string) {
  return {
    coherence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
    flow: Math.random() * 0.4 + 0.6,      // 0.6-1.0 range
    resonance: Math.random() * 0.5 + 0.5, // 0.5-1.0 range
    pattern: 'spiral',
    speed: 'moderate'
  };
}

// Coherence measurement
async function measureCoherence(input: string) {
  return {
    level: Math.random() * 0.3 + 0.7,
    trend: 'ascending',
    stability: 'high'
  };
}

// Oracle response generation
async function generateOracleResponse(input: string, mode: string) {
  // Reflective, non-prescriptive responses
  const responses = [
    "The patterns you're noticing reveal deeper currents of meaning.",
    "Your question touches on something fundamental about your journey.",
    "There's wisdom in sitting with this uncertainty for a moment.",
    "What you're sensing has layers worth exploring.",
    "The answer you seek is already emerging within you."
  ];

  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    mode,
    reflective: true,
    prescriptive: false
  };
}

// Voice response generation (Maya)
async function generateVoiceResponse(input: string) {
  return {
    enabled: true,
    voice: 'maya',
    tempo: 'calm',
    tone: 'warm'
  };
}

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const { input, mode = 'oracle' } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Run core pipeline
    const baseResponse = await runSacredPipeline(input, mode);

    // Run latent APIs (dormant by default)
    const latent = {
      shadow: await analyzeShadow(input),
      aether: await detectAether(input),
      docs: await processDocs(input),
      collective: await senseCollective(input),
      resonance: await findResonance(input),
    };

    // Filter and return active components only
    const result = filterActive(baseResponse, latent);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Oracle API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    sacred: true,
    latentAPIs: {
      shadow: process.env.ENABLE_SHADOW === 'true',
      aether: process.env.ENABLE_AETHER === 'true',
      docs: process.env.ENABLE_DOCS === 'true',
      collective: process.env.ENABLE_COLLECTIVE === 'true',
      resonance: process.env.ENABLE_RESONANCE === 'true',
    },
    timestamp: new Date().toISOString()
  });
}