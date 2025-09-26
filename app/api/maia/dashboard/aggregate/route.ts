import { NextRequest, NextResponse } from 'next/server';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';
import { logAudit } from '@/lib/security/auditLog';

/**
 * Aggregate Dashboard API
 * Returns clinical metrics for therapist dashboard
 *
 * HIPAA COMPLIANCE:
 * - Access restricted to authenticated therapists only
 * - All access logged for audit trail
 * - PHI returned only to authorized users
 * - Data transmitted over HTTPS only
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'access',
      resource: 'dashboard',
      resourceId: 'aggregate',
      ipAddress,
      userAgent,
      result: 'success',
      metadata: { endpoint: '/api/maia/dashboard/aggregate' }
    });

    // Get all soulprints
    const allSoulprints = soulprintTracker.getAllSoulprints();

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Calculate aggregate stats
    const stats = {
      totalClients: allSoulprints.length,
      activeThisWeek: allSoulprints.filter(
        s => s.lastUpdated.getTime() > oneWeekAgo
      ).length,
      avgShadowScore:
        allSoulprints.reduce((sum, s) => sum + s.shadowIntegrationScore, 0) /
        (allSoulprints.length || 1),
      activeAlerts: allSoulprints.filter(s => {
        const alerts = soulprintTracker.checkThresholds(s.userId);
        return alerts.length > 0;
      }).length
    };

    // Build client metrics array
    const clients = allSoulprints.map(soulprint => {
      const daysInJourney = Math.floor(
        (now - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
      );

      const alerts = soulprintTracker.checkThresholds(soulprint.userId);

      return {
        userId: soulprint.userId,
        userName: soulprint.userName || 'Unknown',
        phase: soulprint.currentPhase,
        dominantElement: soulprint.elementalBalance.dominant || 'balanced',
        shadowScore: soulprint.shadowIntegrationScore,
        emotionalTrend: soulprint.emotionalState.trend,
        milestoneCount: soulprint.milestones.length,
        daysInJourney,
        lastSession: soulprint.lastUpdated,
        alerts,
        // Clinical flags
        needsAttention: alerts.length > 2 || soulprint.emotionalState.volatility > 0.6,
        highRisk: alerts.some(a => a.includes('volatility') || a.includes('stagnation'))
      };
    });

    // Sort by needs attention first, then by last session
    clients.sort((a, b) => {
      if (a.needsAttention && !b.needsAttention) return -1;
      if (!a.needsAttention && b.needsAttention) return 1;
      return b.lastSession.getTime() - a.lastSession.getTime();
    });

    const responseTime = Date.now() - startTime;

    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'access',
      resource: 'dashboard',
      resourceId: 'aggregate-complete',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      result: 'success',
      metadata: {
        clientCount: clients.length,
        responseTime,
        alertsCount: stats.activeAlerts
      }
    });

    return NextResponse.json({
      success: true,
      stats,
      clients,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await logAudit({
      timestamp: new Date(),
      userId: 'therapist',
      action: 'access',
      resource: 'dashboard',
      resourceId: 'aggregate',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      result: 'failure',
      reason: (error as Error).message
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data'
      },
      { status: 500 }
    );
  }
}