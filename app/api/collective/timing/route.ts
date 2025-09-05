/**
 * GET /api/collective/timing
 * 
 * Returns near-term guidance windows with Maya-style timing hints.
 * Provides "what's favored soon?" insights based on collective field patterns
 * and consciousness coherence levels.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence } from '../../../../backend/src/ain/collective/CollectiveIntelligence';
import { CollectiveDashboardService } from '../../../../backend/src/services/CollectiveDashboardService';
import { DashboardQueryParams } from '../../../../backend/src/types/collectiveDashboard';

// Initialize services
const collectiveIntelligence = new CollectiveIntelligence();
const dashboardService = CollectiveDashboardService.getInstance(collectiveIntelligence);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: DashboardQueryParams = {
      horizon: (searchParams.get('horizon') as any) || '7d',
      expert: searchParams.get('expert') === 'true'
    };

    // Validate parameters
    const validHorizons = ['24h', '7d', '30d'];
    if (!validHorizons.includes(params.horizon!)) {
      return NextResponse.json(
        { error: 'Invalid horizon parameter. Must be 24h, 7d, or 30d' },
        { status: 400 }
      );
    }

    // Get timing from dashboard service
    const timing = await dashboardService.getTiming(params);

    // Return with cache headers
    const response = NextResponse.json(timing);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5min cache
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Error in /api/collective/timing:', error);
    
    // Return empty timing response
    const fallback = {
      generatedAt: new Date().toISOString(),
      horizon: (new URL(request.url).searchParams.get('horizon') as any) || '7d',
      windows: []
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}