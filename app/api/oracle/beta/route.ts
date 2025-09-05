import type { NextRequest } from 'next/server';
import { PersonalOracleAgent } from '../../../../backend/src/agents/PersonalOracleAgent';
import type { PersonalOracleQuery } from '../../../../backend/src/agents/PersonalOracleAgent';

let agent: PersonalOracleAgent | null = null;

function getAgent() {
  if (!agent) {
    agent = new PersonalOracleAgent();
  }
  return agent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, text, sessionId, targetElement } = body ?? {};
    
    if (!userId || !text) {
      return Response.json(
        { error: 'userId and text are required' },
        { status: 400 }
      );
    }

    const oracleAgent = getAgent();
    
    const query: PersonalOracleQuery = {
      input: text,
      userId,
      sessionId: sessionId || `session-${Date.now()}`,
      targetElement,
      context: {
        previousInteractions: 0, // This would be tracked in a real implementation
        currentPhase: 'initiation'
      }
    };

    const result = await oracleAgent.consult(query);

    if (result.success && result.data) {
      // Format response to match the expected ConsciousnessAPI format
      return Response.json({
        id: `beta-${Date.now()}`,
        text: result.data.message,
        tokens: { prompt: 0, completion: result.data.message.length },
        meta: {
          element: result.data.element,
          archetype: result.data.archetype,
          confidence: result.data.confidence,
          oracleStage: result.data.metadata.oracleStage,
          stageProgress: result.data.metadata.stageProgress,
          relationshipMetrics: result.data.metadata.relationshipMetrics,
          betaSystem: true,
          voiceQueued: true
        }
      }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      });
    } else {
      return Response.json(
        { error: 'consultation_failed', message: result.errors?.join(', ') || 'Unknown error' },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error('Beta Oracle consultation failed:', err);
    return Response.json(
      { error: 'beta_oracle_failed', message: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return Response.json({
    status: 'online',
    message: 'Beta Oracle API - PersonalOracleAgent with all tuning improvements',
    version: 'beta-1.0',
    features: [
      'Tone bias adjustment (±0.15)',
      'Enhanced crisis detection',
      'Expanded narrative templates (Stage 2-3)',
      'Mastery voice anti-terseness',
      'Stage progression tracking',
      'Relationship depth modeling',
      'Bias decay over 10 sessions'
    ],
    betaStatus: 'ready for testing'
  });
}