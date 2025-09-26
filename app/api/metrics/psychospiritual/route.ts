/**
 * Psychospiritual Metrics API
 * Privacy-conscious endpoint for querying symbolic/archetypal metrics
 * No PII storage, aggregated patterns only
 */

import { NextRequest, NextResponse } from 'next/server';
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'snapshot';

    if (mode === 'snapshot' && userId) {
      const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);

      if (!snapshot) {
        return NextResponse.json(
          { error: 'User not found or no soulprint data' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: snapshot
      });
    }

    if (mode === 'aggregated') {
      const userIdsParam = searchParams.get('userIds');
      const userIds = userIdsParam ? userIdsParam.split(',') : undefined;

      const aggregated = metricsEngine.generateAggregatedMetrics(userIds);

      return NextResponse.json({
        success: true,
        data: aggregated
      });
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use "snapshot" with userId or "aggregated"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Metrics API error:', error);
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

    if (action === 'compute-component') {
      const { component } = data;

      if (!userId || !component) {
        return NextResponse.json(
          { error: 'Missing userId or component type' },
          { status: 400 }
        );
      }

      const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);
      if (!snapshot) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const componentData: Record<string, any> = {
        'archetype-coherence': snapshot.archetypeCoherence,
        'emotional-landscape': snapshot.emotionalLandscape,
        'narrative-progression': snapshot.narrativeProgression,
        'shadow-integration': snapshot.shadowIntegration,
        'ritual-integration': snapshot.ritualIntegration,
        'growth-index': snapshot.growthIndex,
        'symbolic-evolution': snapshot.symbolicEvolution,
        'spiralogic-phase': snapshot.spiralogicPhase
      };

      if (!(component in componentData)) {
        return NextResponse.json(
          { error: 'Invalid component type' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: componentData[component]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}