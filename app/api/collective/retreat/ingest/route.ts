/**
 * POST /api/collective/retreat/ingest
 * 
 * Ingest retreat/ceremony afferent sample into Neural Reservoir.
 * Called by personalizedOracleAgent during retreat sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RetreatAfferentZ } from '../../../../../backend/src/schemas/retreat.z';
import { ainEventEmitter } from '../../../../../backend/src/core/events/EventEmitter';
import { createTimestamp } from '../../../../../backend/src/core/events/events';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate afferent data
    const afferent = RetreatAfferentZ.parse(body);
    
    // Emit to event system for processing
    ainEventEmitter.emitSystemEvent({
      id: `retreat-ingest-${Date.now()}`,
      type: 'collective.retreat.ingest',
      timestamp: new Date(),
      source: 'api',
      payload: { afferent }
    });
    
    // Return success response
    return NextResponse.json(
      { 
        status: 'accepted',
        timestamp: createTimestamp(),
        groupId: afferent.group.groupId,
        phase: afferent.phase
      },
      { status: 202 }
    );
    
  } catch (error) {
    console.error('Error in /api/collective/retreat/ingest:', error);
    
    // Return validation error if zod parsing failed
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.message,
          timestamp: createTimestamp()
        },
        { status: 400 }
      );
    }
    
    // Return generic error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: createTimestamp()
      },
      { status: 500 }
    );
  }
}