// app/api/sesame/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface EndpointHealth {
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: number;
  error?: string;
}

interface HealthReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  endpoints: EndpointHealth[];
  recommendations: string[];
}

// Sesame endpoints in order of preference
const SESAME_ENDPOINTS = [
  { url: 'https://soullab.life/api/sesame/ci/shape', type: 'production', priority: 1 },
  { url: 'https://sesame.soullab.life/ci/shape', type: 'tunnel', priority: 2 },
  { url: 'https://76201ef0497f.ngrok-free.app/ci/shape', type: 'ngrok', priority: 3 }
];

async function checkEndpointHealth(endpoint: typeof SESAME_ENDPOINTS[0]): Promise<EndpointHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        text: 'health check',
        element: 'water',
        archetype: 'oracle'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        url: endpoint.url,
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now()
      };
    } else {
      return {
        url: endpoint.url,
        status: 'unhealthy',
        responseTime,
        lastChecked: Date.now(),
        error: `HTTP ${response.status}`
      };
    }
    
  } catch (error: any) {
    return {
      url: endpoint.url,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: Date.now(),
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
  }
}

export async function GET() {
  try {
    // Check all endpoints in parallel
    const healthChecks = await Promise.all(
      SESAME_ENDPOINTS.map(checkEndpointHealth)
    );
    
    // Determine overall status
    const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
    const degradedCount = healthChecks.filter(h => h.status === 'degraded').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    if (healthyCount > 0) {
      overallStatus = 'healthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (overallStatus === 'unhealthy') {
      recommendations.push('All Sesame endpoints are unhealthy. Maya will use Claude-only mode.');
    } else if (overallStatus === 'degraded') {
      recommendations.push('Some Sesame endpoints are slow. Consider endpoint optimization.');
    }
    
    if (healthChecks[0].status === 'unhealthy' && healthChecks[1].status === 'healthy') {
      recommendations.push('Production endpoint down, using tunnel fallback.');
    }
    
    const report: HealthReport = {
      timestamp: Date.now(),
      overallStatus,
      endpoints: healthChecks,
      recommendations
    };
    
    console.log('Sesame Health Report:', report);
    
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      }
    });
    
  } catch (error: any) {
    console.error('Sesame health check failed:', error);
    
    return new Response(JSON.stringify({
      timestamp: Date.now(),
      overallStatus: 'unhealthy',
      endpoints: [],
      recommendations: ['Health check system failed'],
      error: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}