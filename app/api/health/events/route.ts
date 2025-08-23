import { NextResponse } from 'next/server';
import { EventBus } from '@/backend/src/core/events/EventBus';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const eventBus = new EventBus();

export async function GET() {
  try {
    const checks = {
      eventBus: 'unknown',
      redis: 'unknown',
      dlqDepth: 0,
      idempotencyKeys: 0,
      lastEventProcessed: null,
    };

    // Check Redis connection
    try {
      await redis.ping();
      checks.redis = 'healthy';
      
      // Count idempotency keys
      const keys = await redis.keys('idem:*');
      checks.idempotencyKeys = keys.length;
    } catch (error) {
      checks.redis = 'unhealthy';
    }

    // Check EventBus (you'd implement a health check method)
    try {
      // This is a simple check - in production you'd have a proper health method
      checks.eventBus = 'healthy';
    } catch (error) {
      checks.eventBus = 'unhealthy';
    }

    // Check DLQ depth (simplified - in production this would query actual DLQ)
    try {
      const dlqCount = await redis.get('dlq:count') || '0';
      checks.dlqDepth = parseInt(dlqCount);
    } catch (error) {
      // Ignore DLQ errors
    }

    const isHealthy = checks.eventBus === 'healthy' && checks.redis === 'healthy';
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    }, {
      status: isHealthy ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}