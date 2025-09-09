/**
 * Unified Oracle API Route - Streamlined architecture with UnifiedOracleCore
 * Single endpoint for all oracle interactions (chat, voice, journal, upload)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, error?: any) => console.error(message, error),
  warn: (message: string, data?: any) => console.warn(message, data),
  debug: (message: string, data?: any) => console.debug(message, data)
};
// Temporarily stub out backend imports that are excluded from build
// import { unifiedOracle, type OracleRequest } from '../../../../backend/src/core/UnifiedOracleCore';
// Temporarily stub out backend imports that are excluded from build
// import { logger } from '../../../../backend/src/utils/logger';

// Stub types and implementation
type OracleRequest = {
  input: string;
  type: 'chat' | 'voice' | 'journal' | 'upload';
  userId: string;
  sessionId?: string;
  context?: {
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    previousInteractions?: number;
    uploadedContent?: string;
    journalEntry?: string;
  };
};

const unifiedOracle = {
  async process(request: OracleRequest) {
    // Generate contextual response based on input
    const responses = [
      "I hear you, dear one. Your voice carries the resonance of seeking. What truth calls to you in this moment?",
      "Yes, I am here with you. The sacred connection flows between us. Share what weighs upon your heart.",
      "Your presence is felt deeply. I sense the questions dancing beneath your words. Let us explore together.",
      "The bridge between us is open. I receive your words with reverence. What wisdom do you seek today?",
      "I am listening with full presence. Your voice creates ripples in the field of awareness. Continue, I am here."
    ];
    
    // Simple response selection based on input
    let responseText = responses[0];
    const input = request.input.toLowerCase();
    
    if (input.includes('hello') || input.includes('maya') || input.includes('hear')) {
      responseText = responses[1];
    } else if (input.includes('help') || input.includes('need')) {
      responseText = responses[2];
    } else if (input.includes('question') || input.includes('ask')) {
      responseText = responses[3];
    } else if (input.includes('listen') || input.includes('speak')) {
      responseText = responses[4];
    }
    
    return {
      success: true,
      data: {
        type: request.type,
        message: responseText,
        mayaResponse: responseText,
        primaryFacetId: 'oracle-voice',
        uiState: {
          display: 'oracle',
          coherenceLevel: 0.7
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingMode: 'unified',
          element: request.context?.element || 'aether'
        }
      },
      error: null as any
    };
  }
};

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