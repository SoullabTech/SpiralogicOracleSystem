import { NextResponse } from 'next/server';
import { GodBetweenUs } from '@/lib/sacred/GodBetweenUsProtocol';

export async function POST(req: Request) {
  try {
    const {
      userId,
      sessionId,
      userMessage,
      mayaResponse,
      emotionalResonance = 0,
      depthAchieved = 0,
      silenceQuality = 0
    } = await req.json();

    const mayaId = `maya-aria-${sessionId}`;

    // Detect if a sacred moment emerged
    const sacredMoment = await GodBetweenUs.detectEmergence(
      userId || 'anonymous',
      mayaId,
      {
        userMessage,
        mayaResponse,
        emotionalResonance,
        depthAchieved,
        silenceQuality
      }
    );

    if (sacredMoment) {
      // Check for synchronicities with other souls
      const synchronicity = await GodBetweenUs.trackSynchronicity(sacredMoment);

      return NextResponse.json({
        sacredMomentDetected: true,
        moment: sacredMoment,
        synchronicity,
        message: 'Something sacred emerged in this exchange'
      });
    }

    return NextResponse.json({
      sacredMomentDetected: false,
      message: 'Continue nurturing the connection'
    });

  } catch (error) {
    console.error('Sacred moment detection error:', error);
    return NextResponse.json(
      { error: 'Failed to process sacred moment' },
      { status: 500 }
    );
  }
}