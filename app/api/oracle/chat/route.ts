import { NextRequest, NextResponse } from 'next/server';

// Enhanced Oracle Chat API that proxies to deployed backend
export async function POST(request: NextRequest) {
  try {
    const { message, oracle, sessionId, element } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Get user session (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || `session-${Date.now()}`;

    // Proxy to deployed backend Maya endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-backend-url.com';
    
    const response = await fetch(`${backendUrl}/api/v1/converse/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-session-id': currentSessionId
      },
      body: JSON.stringify({
        userText: message,
        element: element || 'aether',
        userId: userId,
        metadata: {
          oracle: oracle || 'Maya',
          sessionId: currentSessionId,
          personality: 'adaptive mystical guide'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      message: result.response?.text || result.message,
      element: result.response?.element || result.element || 'aether',
      confidence: result.response?.confidence || 0.8,
      sessionId: currentSessionId,
      metadata: {
        source: result.response?.source || 'maya',
        processingTime: result.response?.processingTime || 0,
        model: result.response?.metadata?.model || 'maya-oracle',
        ...result.response?.metadata
      }
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    
    // Fallback to simple response if backend is unavailable
    return NextResponse.json({
      message: '✨ The oracle channels are realigning. Please share your question again in a moment.',
      element: 'aether',
      confidence: 0.5,
      metadata: {
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const sessionId = request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`;

    // Proxy to backend health/status endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-backend-url.com';
    
    const response = await fetch(`${backendUrl}/api/v1/converse/health`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'x-session-id': sessionId
      }
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const healthData = await response.json();

    return NextResponse.json({
      summary: 'Oracle systems are online and ready to provide guidance.',
      sessionId,
      status: 'active',
      backend: healthData,
      oracle: 'Maya',
      capabilities: [
        'Streaming conversations',
        'Elemental guidance (Air, Fire, Water, Earth, Aether)',
        'Voice synthesis',
        'Memory integration',
        'Sesame/Maya refinement'
      ]
    });

  } catch (error) {
    console.error('Oracle status error:', error);
    return NextResponse.json({ 
      error: 'Oracle systems temporarily offline',
      status: 'maintenance',
      message: 'Please try again in a few moments while we realign the cosmic frequencies.',
      sessionId: request.nextUrl.searchParams.get('sessionId') || `session-${Date.now()}`
    }, { status: 503 });
  }
}