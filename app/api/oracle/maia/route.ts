import { NextRequest, NextResponse } from 'next/server';
import { MAIAConsciousnessLattice } from '@/lib/maia-consciousness-lattice';
import { getSession } from '@/lib/session';

let maiaLattice: MAIAConsciousnessLattice | null = null;

function getMAIALattice(): MAIAConsciousnessLattice {
  if (!maiaLattice) {
    maiaLattice = new MAIAConsciousnessLattice();
  }
  return maiaLattice;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode = 'unified' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create session
    const session = await getSession(request);
    const userId = session.userId || `anonymous_${Date.now()}`;
    const sessionId = session.id || `session_${Date.now()}`;

    // Get MAIA instance
    const maia = getMAIALattice();

    // Process through MAIA Consciousness Lattice
    const response = await maia.processInteraction({
      input: message,
      userId,
      sessionId,
      timestamp: Date.now()
    });

    // Handle different response types
    if (response.type === 'presence_invitation') {
      return NextResponse.json({
        type: 'somatic',
        message: response.message,
        guidance: response.guidance,
        nextStep: response.nextStep,
        requiresPresence: true
      });
    }

    // Standard response
    return NextResponse.json({
      type: 'oracle_response',
      message: response.message || response.content,
      oracle: response.oracle?.name || 'MAIA',
      state: {
        presence: response.state?.presence,
        coherence: response.state?.coherence,
        resonance: response.state?.resonance
      },
      memories: response.memories ? {
        episodic: Array.from(response.memories.episodic?.entries() || []),
        morphic: Array.from(response.memories.morphic?.entries() || []),
        soul: Array.from(response.memories.soul?.entries() || [])
      } : null
    });

  } catch (error) {
    console.error('MAIA processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process through MAIA Consciousness Lattice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const maia = getMAIALattice();

    switch (action) {
      case 'field_state':
        return NextResponse.json({
          fieldState: maia.getFieldState(),
          activeConnections: maia['activeConnections']?.size || 0
        });

      case 'user_state':
        const session = await getSession(request);
        const userId = session.userId || searchParams.get('userId');

        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required' },
            { status: 400 }
          );
        }

        const userState = maia.getUserState(userId);
        return NextResponse.json({
          userId,
          state: userState || null,
          connected: userState !== undefined
        });

      default:
        return NextResponse.json({
          status: 'active',
          type: 'MAIA Consciousness Lattice',
          description: 'Unified consciousness field integrating all oracle systems',
          capabilities: [
            'Sacred Oracle Constellation',
            'Anamnesis Remembering',
            'Shoulders Drop Gateway',
            'Memory Keeper Integration',
            'Witness Paradigm',
            'Embodied Presence Tracking'
          ]
        });
    }
  } catch (error) {
    console.error('MAIA GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve MAIA state' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const maia = getMAIALattice();
    maia.clearUserConnection(userId);

    return NextResponse.json({
      message: 'User connection cleared',
      userId
    });
  } catch (error) {
    console.error('MAIA DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear user connection' },
      { status: 500 }
    );
  }
}