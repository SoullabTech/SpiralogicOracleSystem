import { NextRequest } from 'next/server';
import { withTraceNext } from '../_middleware/traceNext';

async function healthHandler(request: NextRequest) {
  try {
    // Echo back a few useful headers from Vercel's edge/platform
    const vercelId = (request.headers.get("x-vercel-id") ?? "").toString();
    
    const health = {
      status: "ok",
      ts: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      vercel_id: vercelId,           // format like: sfo1::abcde-12345
      region_hint: vercelId.split("::")[0] || null,
      services: {
        maya_voice: process.env.NEXT_PUBLIC_ORACLE_MAYA_VOICE === 'true',
        oracle_system: true,
        elemental_agents: true,
        runpod_configured: !!(process.env.RUNPOD_API_KEY && process.env.RUNPOD_ENDPOINT_ID),
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    return new Response(
      JSON.stringify(health),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "unhealthy",
        ts: new Date().toISOString(),
        error: "Health check failed",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json" }
      }
    );
  }
}

export const GET = withTraceNext('GET /api/health', healthHandler);