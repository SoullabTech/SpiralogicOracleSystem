/**
 * MAIA Health Check API
 * Provides real-time production health status
 * Use this before beta launches and for monitoring
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  latency?: number;
}

export async function GET() {
  const startTime = Date.now();
  const results: HealthCheckResult[] = [];

  try {
    results.push(await checkOracleAPI());
    results.push(await checkVoiceSystem());
    results.push(await checkMycelialNetwork());
    results.push(await checkDatabaseConnection());

    const totalTime = Date.now() - startTime;
    const allHealthy = results.every(r => r.status === 'healthy');
    const anyDown = results.some(r => r.status === 'down');

    const overallStatus = anyDown ? 'down' : allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalLatency: totalTime,
      components: results,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    }, {
      status: overallStatus === 'down' ? 503 : 200
    });

  } catch (error) {
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      components: results
    }, { status: 503 });
  }
}

async function checkOracleAPI(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

    const latency = Date.now() - start;

    if (hasOpenAI || hasAnthropic) {
      return {
        component: 'Oracle API',
        status: 'healthy',
        message: `AI providers configured (OpenAI: ${hasOpenAI ? '✓' : '✗'}, Anthropic: ${hasAnthropic ? '✓' : '✗'})`,
        latency
      };
    }

    return {
      component: 'Oracle API',
      status: 'degraded',
      message: 'No AI providers configured',
      latency
    };

  } catch (error) {
    return {
      component: 'Oracle API',
      status: 'down',
      message: error instanceof Error ? error.message : 'Check failed',
      latency: Date.now() - start
    };
  }
}

async function checkVoiceSystem(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    const latency = Date.now() - start;

    if (hasOpenAI || hasElevenLabs) {
      return {
        component: 'Voice System',
        status: 'healthy',
        message: `OpenAI: ${hasOpenAI ? '✓' : '✗'}, ElevenLabs: ${hasElevenLabs ? '✓' : '✗'}`,
        latency
      };
    }

    return {
      component: 'Voice System',
      status: 'degraded',
      message: 'No TTS providers configured',
      latency
    };

  } catch (error) {
    return {
      component: 'Voice System',
      status: 'down',
      message: error instanceof Error ? error.message : 'Check failed',
      latency: Date.now() - start
    };
  }
}

async function checkMycelialNetwork(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    const { MycelialNetwork } = await import('@/lib/oracle/field/MycelialNetwork');
    const network = new MycelialNetwork();

    const hasAccessMethod = typeof network.accessCollectiveWisdom === 'function';
    const latency = Date.now() - start;

    return {
      component: 'Mycelial Network',
      status: hasAccessMethod ? 'healthy' : 'down',
      message: hasAccessMethod ? 'Collective wisdom accessible' : 'Missing accessCollectiveWisdom method',
      latency
    };

  } catch (error) {
    return {
      component: 'Mycelial Network',
      status: 'down',
      message: error instanceof Error ? error.message : 'Initialization failed',
      latency: Date.now() - start
    };
  }
}

async function checkDatabaseConnection(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const latency = Date.now() - start;

    if (hasSupabaseUrl && hasSupabaseKey) {
      return {
        component: 'Database',
        status: 'healthy',
        message: 'Supabase configured',
        latency
      };
    }

    return {
      component: 'Database',
      status: 'degraded',
      message: 'Supabase not fully configured',
      latency
    };

  } catch (error) {
    return {
      component: 'Database',
      status: 'down',
      message: error instanceof Error ? error.message : 'Connection failed',
      latency: Date.now() - start
    };
  }
}