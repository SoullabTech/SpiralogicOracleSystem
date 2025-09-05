/**
 * Health Check Endpoint for Maya Backend
 * Provides comprehensive system status for container orchestration and monitoring
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    storage: {
      status: 'available' | 'unavailable' | 'error';
      error?: string;
    };
    ai: {
      status: 'ready' | 'unavailable' | 'error';
      error?: string;
    };
  };
  environment: string;
  vercel?: {
    id: string;
    region: string | null;
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Get Vercel deployment info if available
    const vercelId = (request.headers.get("x-vercel-id") ?? "").toString();
    
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: { status: 'disconnected' },
        storage: { status: 'unavailable' },
        ai: { status: 'unavailable' }
      }
    };

    // Add Vercel info if available
    if (vercelId) {
      health.vercel = {
        id: vercelId,
        region: vercelId.split("::")[0] || null
      };
    }

    // Add memory information in development/staging
    if (process.env.NODE_ENV !== 'production') {
      const memUsage = process.memoryUsage();
      health.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      };
    }

    // Test database connection
    try {
      const supabase = createClientComponentClient();
      const dbStart = Date.now();
      
      const { error } = await supabase
        .from('user_files')
        .select('id')
        .limit(1);
      
      health.services.database = {
        status: error ? 'error' : 'connected',
        responseTime: Date.now() - dbStart,
        error: error?.message
      };
    } catch (error) {
      health.services.database = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }

    // Test storage service
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase.storage
        .from('user-files')
        .list('', { limit: 1 });
      
      health.services.storage = {
        status: error ? 'error' : 'available',
        error: error?.message
      };
    } catch (error) {
      health.services.storage = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown storage error'
      };
    }

    // Test AI service availability (basic check)
    try {
      // Check if required environment variables are present
      const requiredEnvVars = [
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];
      
      const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingVars.length > 0) {
        health.services.ai = {
          status: 'error',
          error: `Missing environment variables: ${missingVars.join(', ')}`
        };
      } else {
        health.services.ai = {
          status: 'ready'
        };
      }
    } catch (error) {
      health.services.ai = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown AI service error'
      };
    }

    // Determine overall health status
    const serviceStatuses = Object.values(health.services);
    const hasErrors = serviceStatuses.some(service => service.status === 'error');
    const hasUnavailable = serviceStatuses.some(service => 
      service.status === 'disconnected' || service.status === 'unavailable'
    );

    if (hasErrors) {
      health.status = 'unhealthy';
    } else if (hasUnavailable) {
      health.status = 'degraded';
    } else {
      health.status = 'healthy';
    }

    // Return appropriate HTTP status code
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }), {
      status: 503,
      headers: { "content-type": "application/json" }
    });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: Request) {
  try {
    // Quick health check without detailed service testing
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}