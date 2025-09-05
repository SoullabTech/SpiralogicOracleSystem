/**
 * GET /api/collective/snapshot
 * 
 * Production endpoint for Collective Dashboard one-card overview.
 * Returns current field coherence, top themes, emerging patterns, shadow signals,
 * and timing hints in phenomenological language (human-friendly by default).
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence } from '../../../../backend/src/ain/collective/CollectiveIntelligence';
import { CollectiveDashboardService } from '../../../../backend/src/services/CollectiveDashboardService';
import { DashboardQueryParams } from '../../../../backend/src/types/collectiveDashboard';

// Initialize services (in production, these would come from DI container)
const collectiveIntelligence = new CollectiveIntelligence();
const dashboardService = CollectiveDashboardService.getInstance(collectiveIntelligence);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: DashboardQueryParams = {
      window: (searchParams.get('window') as any) || '7d',
      expert: searchParams.get('expert') === 'true'
    };

    // Validate parameters
    const validWindows = ['1d', '7d', '30d'];
    if (!validWindows.includes(params.window!)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Must be 1d, 7d, or 30d' },
        { status: 400 }
      );
    }

    // Get snapshot from dashboard service
    const snapshot = await dashboardService.getSnapshot(params);

    // Return with appropriate cache headers
    const response = NextResponse.json(snapshot);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Error in /api/collective/snapshot:', error);
    
    // Return graceful fallback
    const fallback = {
      generatedAt: new Date().toISOString(),
      window: '7d',
      coherence: { value: 50, trend: 'steady', delta: 0 },
      topThemes: [],
      emerging: [],
      shadowSignals: [],
      timingHint: {
        label: 'systems are recalibrating - gentle patience',
        horizon: 'hours',
        confidence: 0.3
      }
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}