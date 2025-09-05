/**
 * GET /api/shift/survey
 * 
 * Returns the structured 24-item SHIFt research survey
 * for explicit facet assessment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  SHIFT_EXPLICIT_SURVEY, 
  SURVEY_INSTRUCTIONS, 
  SURVEY_SCALE_LABELS, 
  SURVEY_METADATA 
} from '../../../../backend/src/content/SHIFtExplicitSurvey';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMetadata = searchParams.get('metadata') === 'true';
    
    const response = {
      instructions: SURVEY_INSTRUCTIONS,
      scale: SURVEY_SCALE_LABELS,
      items: SHIFT_EXPLICIT_SURVEY,
      ...(includeMetadata && { metadata: SURVEY_METADATA })
    };
    
    // Return with cache headers
    const res = NextResponse.json(response);
    res.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.headers.set('Content-Type', 'application/json');
    
    return res;
    
  } catch (error) {
    console.error('Error in /api/shift/survey:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}