import { NextRequest, NextResponse } from 'next/server';
import { betaMonitoring } from '@/lib/beta/BetaMonitoring';

/**
 * Beta Reporting API
 * Generates automated daily reports for beta monitoring
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const period = searchParams.get('period') || 'daily';

    switch (period) {
      case 'daily':
        const metrics = betaMonitoring.generateDailyReport();

        if (format === 'markdown') {
          const report = betaMonitoring.exportDailyReport();
          return new Response(report, {
            headers: {
              'Content-Type': 'text/markdown',
              'Content-Disposition': `attachment; filename="beta-report-${new Date().toISOString().split('T')[0]}.md"`
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: metrics,
          generatedAt: new Date().toISOString()
        });

      case 'weekly':
        // TODO: Implement weekly aggregation
        return NextResponse.json({
          success: false,
          error: 'Weekly reports not yet implemented'
        }, { status: 501 });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid period. Use: daily, weekly'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Beta reporting error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate report'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'register_tester':
        const testerId = betaMonitoring.registerTester(data);
        return NextResponse.json({
          success: true,
          testerId,
          message: 'Beta tester registered successfully'
        });

      case 'update_engagement':
        betaMonitoring.updateEngagement(data.userId, data.updates);
        return NextResponse.json({
          success: true,
          message: 'Engagement updated'
        });

      case 'record_feedback':
        betaMonitoring.recordFeedback(data.userId, data.feedback);
        return NextResponse.json({
          success: true,
          message: 'Feedback recorded'
        });

      case 'flag_risk':
        betaMonitoring.flagRisk(data.userId, data.flag, data.severity);
        return NextResponse.json({
          success: true,
          message: 'Risk flag recorded'
        });

      case 'get_dashboard':
        const dashboard = betaMonitoring.getTesterDashboard(data.userId);
        return NextResponse.json({
          success: true,
          data: dashboard
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Beta API error:', error);
    return NextResponse.json({
      success: false,
      error: 'API request failed'
    }, { status: 500 });
  }
}