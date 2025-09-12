import { NextRequest, NextResponse } from 'next/server';
// Simple health endpoint - TTSOrchestrator will be integrated later
// import { ttsOrchestrator } from '../../../../apps/api/backend/src/services/TTSOrchestrator';

export async function GET(request: NextRequest) {
  try {
    // Simplified health check for immediate deployment
    const isElevenLabsConfigured = !!process.env.ELEVENLABS_API_KEY;
    const isSesameConfigured = !!process.env.SESAME_API_KEY;
    const isHealthy = isElevenLabsConfigured || isSesameConfigured;
    const activeProvider = isElevenLabsConfigured ? 'elevenlabs' : 'emergency-mock';
    
    const response = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      activeProvider,
      providers: {
        sesame: {
          available: isSesameConfigured,
          configured: isSesameConfigured,
          status: isSesameConfigured ? 'configured' : 'not-configured'
        },
        elevenLabs: {
          available: isElevenLabsConfigured,
          configured: isElevenLabsConfigured,
          status: isElevenLabsConfigured ? 'configured' : 'not-configured'
        },
        emergencyMock: {
          available: true, // Always available as final fallback
          status: 'standby'
        }
      },
      configuration: {
        fallbackEnabled: true,
        cacheEnabled: false,
        strictMode: false
      },
      capabilities: {
        voiceSynthesis: isHealthy,
        failoverSupport: true,
        emergencyFallback: true,
        caching: false
      }
    };
    
    // Return appropriate HTTP status based on health
    const httpStatus = isHealthy ? 200 : 503;
    
    return NextResponse.json(response, { status: httpStatus });
    
  } catch (error) {
    console.error('[TTS HEALTH] Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      activeProvider: 'emergency-mock',
      providers: {
        sesame: { available: false, status: 'unknown' },
        elevenLabs: { available: false, status: 'unknown' },
        emergencyMock: { available: true, status: 'active' }
      }
    }, { status: 500 });
  }
}

// Also support POST for forced health check refresh
export async function POST(request: NextRequest) {
  try {
    // Simplified forced health check - just return current status
    return GET(request);
    
  } catch (error) {
    console.error('[TTS HEALTH] Forced health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Forced health check failed'
    }, { status: 500 });
  }
}