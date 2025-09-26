import { NextRequest, NextResponse } from 'next/server';
import { maiaMonitoring } from '@/lib/beta/MaiaMonitoring';

export async function GET(request: NextRequest) {
  try {
    const systemMetrics = maiaMonitoring.generateSystemMetrics();

    return NextResponse.json({
      success: true,
      systemMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to generate MAIA metrics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate metrics'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    if (action === 'getUserInsights' && userId) {
      const insights = maiaMonitoring.getUserInsights(userId);
      return NextResponse.json({
        success: true,
        insights
      });
    }

    if (action === 'exportReport') {
      const report = maiaMonitoring.exportMaiaReport();
      return NextResponse.json({
        success: true,
        report
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('Failed to process MAIA monitor request:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}