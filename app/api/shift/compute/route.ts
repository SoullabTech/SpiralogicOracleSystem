/**
 * POST /api/shift/compute
 * 
 * Triggers profile computation for a user with optional parameters.
 * Used for manual recalculation or batch processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SHIFtComputeRequestZ } from '../../../../backend/src/schemas/shift.z';
import { SHIFtInferenceService } from '../../../../backend/src/services/SHIFtInferenceService';

// Initialize service
const shiftService = new SHIFtInferenceService();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = SHIFtComputeRequestZ.parse(body);
    
    // Compute profile
    const profile = await shiftService.compute(validatedRequest);
    
    // Return computed profile
    const response = {
      status: 'computed',
      userId: validatedRequest.userId,
      timestamp: new Date().toISOString(),
      profile: {
        elements: profile.elements,
        facets: profile.facets.map(f => ({
          code: f.code,
          score: f.score,
          confidence: f.confidence,
          delta7d: f.delta7d,
          source: f.source
        })),
        phase: profile.phase,
        confidence: profile.confidence,
        freshness: profile.freshness,
        narrative: profile.narrative,
        alertCount: profile.alerts?.length || 0
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in /api/shift/compute:', error);
    
    // Return validation error if zod parsing failed
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // Return generic error
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}