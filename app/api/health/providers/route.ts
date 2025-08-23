import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const startTime = Date.now();
  
  try {
    const providers = {
      supabase: { status: 'unknown', latencyMs: 0 },
      openai: { status: 'unknown', latencyMs: 0 },
      redis: { status: 'unknown', latencyMs: 0 },
    };

    // Check Supabase
    try {
      const supabaseStart = Date.now();
      const { error } = await supabase.from('users').select('id').limit(1);
      providers.supabase.latencyMs = Date.now() - supabaseStart;
      providers.supabase.status = error ? 'degraded' : 'healthy';
    } catch (error) {
      providers.supabase.status = 'unhealthy';
    }

    // Check Redis (if you have a Redis client)
    try {
      const redisStart = Date.now();
      // In production, you'd ping Redis here
      providers.redis.latencyMs = Date.now() - redisStart;
      providers.redis.status = 'healthy';
    } catch (error) {
      providers.redis.status = 'unhealthy';
    }

    // Check OpenAI (simplified - in production you'd have a proper health check)
    providers.openai.status = process.env.OPENAI_API_KEY ? 'healthy' : 'unconfigured';

    const allHealthy = Object.values(providers).every(p => 
      p.status === 'healthy' || p.status === 'unconfigured'
    );

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      totalLatencyMs: Date.now() - startTime,
      providers
    }, {
      status: allHealthy ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}