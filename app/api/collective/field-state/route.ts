import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence } from '@/backend/src/ain/collective/CollectiveIntelligence';
import { Logger } from '@/backend/src/types/core';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Request validation schema
const FieldStateQuerySchema = z.object({
  includePatterns: z.boolean().optional().default(true),
  includeEvolution: z.boolean().optional().default(true),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional().default('24h'),
});

// GET /api/collective/field-state
export async function GET(req: NextRequest) {
  const logger: Logger = {
    error: (msg, error, meta) => console.error(`[FieldState] ${msg}`, error, meta),
    warn: (msg, meta) => console.warn(`[FieldState] ${msg}`, meta),
    debug: (msg, meta) => console.debug(`[FieldState] ${msg}`, meta),
  };

  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const query = FieldStateQuerySchema.parse({
      includePatterns: searchParams.get('includePatterns') === 'true',
      includeEvolution: searchParams.get('includeEvolution') === 'true',
      timeRange: searchParams.get('timeRange') || '24h',
    });

    // Get current user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize collective intelligence
    const collective = new CollectiveIntelligence(
      logger,
      {} as any, // Analytics service would be injected here
      {} as any  // Cache service would be injected here
    );

    // Get current field state
    const fieldState = await collective.getCurrentFieldState();

    // Build response based on query parameters
    const response: any = {
      timestamp: new Date().toISOString(),
      field: {
        totalParticipants: fieldState.totalParticipants,
        activeUsers: fieldState.activeUsers,
        collectiveElementalBalance: fieldState.collectiveElementalBalance,
        fieldMetrics: {
          coherence: fieldState.fieldCoherence,
          awareness: fieldState.averageAwareness,
          complexity: fieldState.emergentComplexity,
          healingCapacity: fieldState.healingCapacity,
        },
        evolution: {
          growthRate: fieldState.collectiveGrowthRate,
          breakthroughPotential: fieldState.breakthroughPotential,
          integrationNeed: fieldState.integrationNeed,
        },
      },
    };

    // Include patterns if requested
    if (query.includePatterns) {
      const patterns = await collective.getEmergentPatterns(query.timeRange);
      response.patterns = patterns.map(pattern => ({
        id: pattern.id,
        type: pattern.type,
        strength: pattern.strength,
        participantCount: pattern.participants.length,
        timeframe: pattern.timeframe,
        elementalSignature: pattern.elementalSignature,
        likelyProgression: pattern.likelyProgression,
      }));
    }

    // Include dominant archetypes
    response.archetypes = {
      dominant: Object.entries(fieldState.dominantArchetypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([archetype, strength]) => ({ archetype, strength })),
      emerging: Object.entries(fieldState.emergingArchetypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([archetype, strength]) => ({ archetype, strength })),
      shadow: Object.entries(fieldState.shadowArchetypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([archetype, strength]) => ({ archetype, strength })),
    };

    // Include user's position in the field if requested
    if (query.includeEvolution) {
      const userFieldPosition = await collective.getUserFieldPosition(user.id);
      response.userPosition = {
        spiralPhase: userFieldPosition.currentPhase,
        elementalBalance: userFieldPosition.elementalBalance,
        collectiveRole: userFieldPosition.collectiveRole,
        evolutionReadiness: userFieldPosition.evolutionReadiness,
        fieldContribution: userFieldPosition.fieldContribution,
      };
    }

    // Cache for 30 seconds
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    logger.error('Failed to get field state', error as Error);
    return NextResponse.json(
      { error: 'Failed to retrieve consciousness field state' },
      { status: 500 }
    );
  }
}

// POST /api/collective/field-state/pulse
// Allows real-time field state updates via WebSocket-like experience
export async function POST(req: NextRequest) {
  const logger: Logger = {
    error: (msg, error, meta) => console.error(`[FieldPulse] ${msg}`, error, meta),
    warn: (msg, meta) => console.warn(`[FieldPulse] ${msg}`, meta),
    debug: (msg, meta) => console.debug(`[FieldPulse] ${msg}`, meta),
  };

  try {
    // Get current user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Initialize collective intelligence
    const collective = new CollectiveIntelligence(
      logger,
      {} as any,
      {} as any
    );

    // Submit user pulse to the field
    await collective.submitUserPulse({
      userId: user.id,
      timestamp: new Date(),
      elementalState: body.elementalState,
      consciousnessLevel: body.consciousnessLevel,
      intentionVector: body.intention,
    });

    // Get immediate field response
    const fieldResponse = await collective.getFieldResponse(user.id);

    return NextResponse.json({
      acknowledged: true,
      fieldResponse: {
        resonance: fieldResponse.resonance,
        synchronicities: fieldResponse.synchronicities,
        collectiveSupport: fieldResponse.collectiveSupport,
        timingGuidance: fieldResponse.timingGuidance,
      },
    });

  } catch (error) {
    logger.error('Failed to process field pulse', error as Error);
    return NextResponse.json(
      { error: 'Failed to process field pulse' },
      { status: 500 }
    );
  }
}