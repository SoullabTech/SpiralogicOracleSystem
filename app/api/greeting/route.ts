import { NextRequest, NextResponse } from 'next/server';
import { DynamicGreetingService } from '@/backend/src/services/DynamicGreetingService';
import { logger } from '@/backend/src/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, sessionCount } = await request.json();
    
    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const greetingService = new DynamicGreetingService();
    
    // Detect if mobile from user agent
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    
    const greetingResult = await greetingService.generateGreeting({
      userId,
      userName,
      sessionCount: sessionCount || 1,
      isMobile
    });
    
    logger.info('[API] Generated greeting', {
      userId,
      templateUsed: greetingResult.templateUsed,
      confidence: greetingResult.confidence
    });
    
    return NextResponse.json({
      greeting: greetingResult.greeting,
      memorySnippet: greetingResult.memorySnippet,
      memoryType: greetingResult.memoryType,
      confidence: greetingResult.confidence
    });
    
  } catch (error) {
    logger.error('[API] Greeting generation failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate greeting' },
      { status: 500 }
    );
  }
}