// app/api/sesame/ci/shape/route.ts
import { sesameHybridManager } from '../../../../../lib/sesame-hybrid-manager';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, element, archetype } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Missing or invalid text parameter' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Use the hybrid manager for intelligent endpoint selection and failover
    const result = await sesameHybridManager.shapeText(
      text,
      element || 'water',
      archetype || 'oracle'
    );
    
    // Log performance metrics
    console.log(`Sesame CI Performance: ${result.source} (${result.responseTime}ms) - Fallback: ${result.fallbackUsed}`);
    
    return new Response(JSON.stringify({
      ok: true,
      shaped: result.shaped,
      element: element || 'water',
      archetype: archetype || 'oracle',
      source: result.source,
      responseTime: result.responseTime,
      fallbackUsed: result.fallbackUsed,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: { 
        'content-type': 'application/json',
        'x-sesame-source': result.source,
        'x-response-time': result.responseTime.toString()
      },
    });
    
  } catch (error: any) {
    console.error('Sesame CI shape API error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

// Add a GET endpoint to check Sesame health status
export async function GET() {
  try {
    const healthStatus = await sesameHybridManager.getHealthStatus();
    
    return new Response(JSON.stringify({
      timestamp: Date.now(),
      health: healthStatus,
      endpointCount: healthStatus.activeEndpoints,
      status: healthStatus.healthy ? 'operational' : 'degraded',
      message: healthStatus.recommendedAction
    }), {
      status: healthStatus.healthy ? 200 : 503,
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Health check failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}