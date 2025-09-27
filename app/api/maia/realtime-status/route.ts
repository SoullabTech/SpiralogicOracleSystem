import { NextRequest, NextResponse } from 'next/server';
import { maiaRealtimeMonitor } from '@/lib/monitoring/MaiaRealtimeMonitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const realtimeState = await maiaRealtimeMonitor.generateRealtimeState();

    return NextResponse.json({
      success: true,
      data: realtimeState
    });
  } catch (error) {
    console.error('Failed to generate realtime state:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate realtime monitoring state',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'trackVoice':
        maiaRealtimeMonitor.trackVoiceInteraction(data);
        return NextResponse.json({ success: true, message: 'Voice metrics tracked' });

      case 'trackSymbolic':
        maiaRealtimeMonitor.trackSymbolicAnalysis(data);
        return NextResponse.json({ success: true, message: 'Symbolic metrics tracked' });

      case 'startSession':
        maiaRealtimeMonitor.startSession(data.sessionId);
        return NextResponse.json({ success: true, message: 'Session started' });

      case 'endSession':
        maiaRealtimeMonitor.endSession(data.sessionId);
        return NextResponse.json({ success: true, message: 'Session ended' });

      case 'getAlerts':
        const alerts = maiaRealtimeMonitor.getAlerts(data?.severity);
        return NextResponse.json({ success: true, alerts });

      case 'resolveAlert':
        maiaRealtimeMonitor.resolveAlert(data.alertId);
        return NextResponse.json({ success: true, message: 'Alert resolved' });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to process realtime monitoring request:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}