import { NextRequest, NextResponse } from 'next/server';
import { personalOracleAgent } from '@/lib/oracle/PersonalOracleAgent';

/**
 * Personal Oracle Consult API Route
 * Full Maya functionality with zen brevity
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, userId = 'anonymous', sessionId, context } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    console.log('Personal Oracle Consult:', input);

    // Use PersonalOracleAgent from lib with full functionality
    const result = await personalOracleAgent.consult({
      userId,
      input,
      sessionId,
      context
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Oracle consult error:', error);

    return NextResponse.json({
      success: false,
      error: 'Oracle consultation failed',
      data: {
        message: "Tell me your truth.",
        element: 'earth',
        confidence: 0.5,
        metadata: {
          wordCount: 4,
          zenMode: true
        }
      }
    });
  }
}