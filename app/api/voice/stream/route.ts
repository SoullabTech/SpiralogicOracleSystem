import { NextRequest } from 'next/server';
import { get } from '../../../../backend/src/core/di/container';
import { TOKENS } from '../../../../backend/src/core/di/tokens';
import { wireDI } from '../../../../backend/src/bootstrap/di';
import { VoiceEventBus } from '../../../../backend/src/core/events/VoiceEventBus';

let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    wireDI();
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  ensureInitialized();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Get event bus
        const eventBus = get<VoiceEventBus>(TOKENS.VOICE_EVENTS);
        
        const listener = (event: any) => {
          // Only send events for this user
          if (event.userId === userId) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
        };

        // Subscribe to voice events
        eventBus.subscribe(listener);
        
        // Send initial connection message
        const welcome = `data: ${JSON.stringify({
          type: 'connection',
          message: 'Voice events stream connected',
          userId,
          timestamp: new Date()
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(welcome));
        
        // Keep connection alive with periodic heartbeat
        const heartbeat = setInterval(() => {
          const ping = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date()
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(ping));
        }, 30000); // 30 seconds

        // Cleanup on close
        const cleanup = () => {
          clearInterval(heartbeat);
          eventBus.unsubscribe(listener);
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);
        
        return {
          cancel: cleanup
        };
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error: any) {
    return Response.json(
      { error: 'stream_failed', message: error?.message },
      { status: 500 }
    );
  }
}