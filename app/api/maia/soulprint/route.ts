import { NextRequest, NextResponse } from 'next/server';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId required'
      }, { status: 400 });
    }

    let soulprint = soulprintTracker.getSoulprint(userId);

    // Create if doesn't exist
    if (!soulprint) {
      soulprint = soulprintTracker.createSoulprint(userId);
    }

    const summary = soulprintTracker.getSoulprintSummary(userId);
    const alerts = soulprintTracker.checkThresholds(userId);

    return NextResponse.json({
      success: true,
      soulprint: {
        ...summary,
        alerts,
        elementalBalance: soulprint.elementalBalance
      }
    });
  } catch (error) {
    console.error('Failed to get soulprint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve soulprint'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'userId and action required'
      }, { status: 400 });
    }

    switch (action) {
      case 'trackSymbol':
        soulprintTracker.trackSymbol(
          userId,
          data.symbol,
          data.context,
          data.elementalResonance
        );
        break;

      case 'trackArchetype':
        soulprintTracker.trackArchetypeShift(userId, data.archetype, data.options);
        break;

      case 'updateElemental':
        soulprintTracker.updateElementalBalance(userId, data.element, data.intensity);
        break;

      case 'addMilestone':
        soulprintTracker.addMilestone(
          userId,
          data.type,
          data.description,
          data.significance,
          data.context
        );
        break;

      case 'trackEmotion':
        soulprintTracker.trackEmotionalState(
          userId,
          data.current,
          data.dominantEmotions
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Soulprint updated successfully'
    });
  } catch (error) {
    console.error('Failed to update soulprint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update soulprint'
    }, { status: 500 });
  }
}