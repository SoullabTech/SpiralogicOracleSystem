import { NextRequest, NextResponse } from 'next/server';

const MAX_EVENTS = 100;
const events: Array<{ timestamp: string; event: string; data: any }> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const timestamp = new Date().toISOString();

    const eventRecord = {
      timestamp,
      event: body.event || 'unknown',
      data: body,
    };

    events.unshift(eventRecord);
    if (events.length > MAX_EVENTS) {
      events.pop();
    }

    console.log('[PWA Analytics]', eventRecord);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[PWA Analytics Error]', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    count: events.length,
    events: events.slice(0, 50),
  });
}