/**
 * Admin Soulprint Management API
 * CRUD operations for soulprint data
 */

import { NextRequest, NextResponse } from 'next/server';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const soulprint = soulprintTracker.getSoulprint(userId);
      if (!soulprint) {
        return NextResponse.json(
          { error: 'Soulprint not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: soulprint });
    }

    const all = soulprintTracker.getAllSoulprints();
    return NextResponse.json({ success: true, data: all, count: all.length });
  } catch (error) {
    console.error('Admin soulprint GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'action and userId required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        const soulprint = soulprintTracker.createSoulprint(userId, data?.userName);
        return NextResponse.json({ success: true, data: soulprint });

      case 'update':
        const existing = soulprintTracker.getSoulprint(userId);
        if (!existing) {
          return NextResponse.json({ error: 'Soulprint not found' }, { status: 404 });
        }
        Object.assign(existing, data);
        return NextResponse.json({ success: true, data: existing });

      case 'add-symbol':
        soulprintTracker.trackSymbol(
          userId,
          data.symbol,
          data.context || 'Admin added',
          data.elementalResonance
        );
        return NextResponse.json({ success: true });

      case 'add-archetype':
        soulprintTracker.trackArchetypeShift(userId, data.archetype, {
          trigger: data.trigger,
          shadowWork: data.shadowWork || false,
          integrationLevel: data.integrationLevel || 0.5
        });
        return NextResponse.json({ success: true });

      case 'add-milestone':
        soulprintTracker.addMilestone(
          userId,
          data.type,
          data.description,
          data.significance || 'minor',
          { element: data.element, spiralogicPhase: data.phase }
        );
        return NextResponse.json({ success: true });

      case 'update-elements':
        const sp = soulprintTracker.getSoulprint(userId);
        if (sp && data.elementalBalance) {
          sp.elementalBalance = data.elementalBalance;
        }
        return NextResponse.json({ success: true });

      case 'track-emotion':
        soulprintTracker.trackEmotionalState(
          userId,
          data.current || 0.5,
          data.dominantEmotions || []
        );
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin soulprint POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: false,
      message: 'Delete not implemented - use reset action in POST instead'
    });
  } catch (error) {
    console.error('Admin soulprint DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}