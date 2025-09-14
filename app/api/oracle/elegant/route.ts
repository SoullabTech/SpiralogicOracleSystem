// Elegant Sacred Oracle API - Optimized for Sub-1s Response
// Core focus: Pleasant companion, witness paradigm, minimal latency

import { NextRequest, NextResponse } from 'next/server';
import { elegantSacredOracle } from '@/lib/elegant-sacred-oracle';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { input, userId, sessionId, agentName = 'maya' } = await request.json();

    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    console.log(`⚡ Elegant Oracle request: ${agentName} | ${input.slice(0, 50)}...`);

    // Get conversation history from request (simplified - no complex memory system)
    const history = request.headers.get('x-conversation-history')
      ? JSON.parse(request.headers.get('x-conversation-history') || '[]')
      : [];

    // Generate elegant response
    const result = await elegantSacredOracle.generateElegantResponse({
      input,
      userId: userId || 'anonymous',
      sessionId: sessionId || 'default',
      agentName,
      history: history.slice(-6) // Only last 6 messages for speed
    });

    // Check for cached audio
    const cachedAudio = elegantSacredOracle.getCachedAudio(result.text, userId || 'anonymous');

    const totalTime = Date.now() - startTime;
    console.log(`✨ Elegant Oracle complete: ${totalTime}ms total, ${result.processingTime}ms processing`);

    // Clean response
    return NextResponse.json({
      response: result.text,
      audioUrl: cachedAudio || null,
      metadata: {
        agent: result.personality,
        element: result.element,
        processingTime: result.processingTime,
        totalTime,
        cached: !!cachedAudio,
        witness_mode: true // Always in witness mode for elegance
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Elegant Oracle error:', error);

    // Graceful fallback
    return NextResponse.json({
      response: "I'm having a moment here... could you say that again?",
      audioUrl: null,
      metadata: {
        agent: 'maya',
        element: 'earth',
        processingTime: totalTime,
        totalTime,
        error: true,
        witness_mode: true
      }
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'elegant-sacred-oracle',
    performance_target: '<800ms',
    features: [
      'witness_paradigm',
      'response_caching',
      'background_audio',
      'crisis_detection',
      'maya_anthony_personalities'
    ]
  });
}