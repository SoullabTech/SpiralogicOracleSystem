/**
 * Unified Oracle API Route - Streamlined architecture with UnifiedOracleCore
 * Single endpoint for all oracle interactions (chat, voice, journal, upload)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { unifiedOracle, type OracleRequest } from '../../../../backend/src/core/UnifiedOracleCore';
import { logger } from '../../../../backend/src/utils/logger';

// Request validation schema
const OracleRequestSchema = z.object({
  input: z.string().min(1).max(5000),
  type: z.enum(['chat', 'voice', 'journal', 'upload']),
  userId: z.string().min(1),
  sessionId: z.string().optional(),
  context: z.object({
    element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
    previousInteractions: z.number().optional(),
    uploadedContent: z.string().optional(),
    journalEntry: z.string().optional(),
  }).optional()
});

/**
 * POST /api/oracle/unified - Single endpoint for all oracle interactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validationResult = OracleRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }
    
    const oracleRequest: OracleRequest = validationResult.data;
    
    // Process through unified oracle core
    const result = await unifiedOracle.process(oracleRequest);
    
    // Log successful interaction
    logger.info('Unified Oracle request processed', {
      userId: oracleRequest.userId,
      type: oracleRequest.type,
      success: result.success
    });
    
    // Return response with appropriate status
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error?.message || 'Processing failed' },
        { status: result.error?.status || 500 }
      );
    }
    
  } catch (error) {
    logger.error('Unified Oracle API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: '/api/oracle/unified'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/oracle/unified - Health check for unified oracle core
 */
export async function GET() {
  try {
    const health = await (unifiedOracle.constructor as any).healthCheck();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'unified-oracle-core',
      timestamp: new Date().toISOString(),
      ...health
    });
    
  } catch (error) {
    logger.error('Unified Oracle health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'unified-oracle-core',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}