import { NextRequest, NextResponse } from 'next/server';
import { getClaudeService } from '@/lib/services/ClaudeService';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    const claudeService = getClaudeService();
    
    const response = await claudeService.generateChatResponse(message, {
      element: 'aether',
      userState: {
        mood: 'curious',
        trustLevel: 50,
        currentPhase: 'discovering'
      }
    });
    
    return NextResponse.json({ 
      success: true,
      response,
      service: 'Claude AI (Maia Intelligence)'
    });
  } catch (error: any) {
    console.error('Claude test error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      service: 'Claude AI'
    }, { status: 500 });
  }
}