// app/api/sesame/dashboard/route.ts
import { sesameHybridManager } from '../../../../lib/sesame-hybrid-manager';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  endpointPerformance: {
    [key: string]: {
      requests: number;
      successes: number;
      failures: number;
      avgResponseTime: number;
      lastUsed: number;
    }
  };
  uptime: {
    overall: number;
    byEndpoint: { [key: string]: number };
  };
}

// Simple in-memory metrics store (in production, use Redis or similar)
let metricsStore: PerformanceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  endpointPerformance: {},
  uptime: {
    overall: 0,
    byEndpoint: {}
  }
};

let startTime = Date.now();

export async function GET() {
  try {
    // Get current health status
    const healthStatus = await sesameHybridManager.getHealthStatus();
    
    // Calculate uptime
    const currentUptime = Date.now() - startTime;
    metricsStore.uptime.overall = currentUptime;
    
    // Build comprehensive dashboard data
    const dashboardData = {
      timestamp: Date.now(),
      status: {
        overall: healthStatus.healthy ? 'operational' : 'degraded',
        activeEndpoints: healthStatus.activeEndpoints,
        totalEndpoints: healthStatus.totalEndpoints,
        message: healthStatus.recommendedAction
      },
      health: healthStatus,
      performance: metricsStore,
      system: {
        uptime: currentUptime,
        uptimeFormatted: formatUptime(currentUptime),
        memoryUsage: process.memoryUsage(),
        startTime,
        nodeVersion: process.version
      },
      recommendations: generateRecommendations(healthStatus, metricsStore)
    };
    
    // Generate HTML dashboard
    const html = generateDashboardHTML(dashboardData);
    
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html',
        'cache-control': 'no-cache',
        'refresh': '30' // Auto-refresh every 30 seconds
      }
    });
    
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Dashboard unavailable',
      details: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export async function POST(req: Request) {
  try {
    const { action, endpoint } = await req.json();
    
    if (action === 'recover' && endpoint) {
      // Force recovery of a specific endpoint
      sesameHybridManager.forceRecoverEndpoint(endpoint);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Endpoint ${endpoint} recovery initiated`
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    if (action === 'reset-metrics') {
      // Reset performance metrics
      metricsStore = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        endpointPerformance: {},
        uptime: { overall: 0, byEndpoint: {} }
      };
      startTime = Date.now();
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Metrics reset successfully'
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Invalid action'
    }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Action failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function generateRecommendations(health: any, metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];
  
  if (!health.healthy) {
    recommendations.push('🚨 Critical: All Sesame endpoints are down. Check service availability.');
  }
  
  if (health.activeEndpoints < health.totalEndpoints) {
    recommendations.push('⚠️  Some endpoints are disabled. Consider investigating failed endpoints.');
  }
  
  if (metrics.averageResponseTime > 3000) {
    recommendations.push('🐌 Performance: Response times are high. Consider endpoint optimization.');
  }
  
  if (metrics.successfulRequests < metrics.totalRequests * 0.9) {
    recommendations.push('📊 Reliability: Success rate is below 90%. Review endpoint health.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All systems operational. Sesame hybrid setup is performing well.');
  }
  
  return recommendations;
}

function generateDashboardHTML(data: any): string {
  const statusColor = data.status.overall === 'operational' ? '#10b981' : 
                     data.status.overall === 'degraded' ? '#f59e0b' : '#ef4444';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sesame Hybrid Dashboard - SoulLab AIN</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
            color: #e2e8f0;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${statusColor};
            margin-right: 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        .card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(20px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h3 {
            color: #60a5fa;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .metric-value {
            color: #10b981;
            font-weight: 600;
        }
        .recommendations {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        .endpoint-status {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .endpoint-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .healthy { background: #10b981; }
        .degraded { background: #f59e0b; }
        .unhealthy { background: #ef4444; }
        .refresh-info {
            text-align: center;
            color: #64748b;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="status-indicator"></span>
                Sesame Hybrid Dashboard
            </h1>
            <p style="margin-top: 10px; opacity: 0.7;">
                Real-time monitoring for Maya's Sesame CI integration
            </p>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🎯 System Status</h3>
                <div class="metric">
                    <span>Overall Status:</span>
                    <span class="metric-value">${data.status.overall}</span>
                </div>
                <div class="metric">
                    <span>Active Endpoints:</span>
                    <span class="metric-value">${data.status.activeEndpoints}/${data.status.totalEndpoints}</span>
                </div>
                <div class="metric">
                    <span>Uptime:</span>
                    <span class="metric-value">${data.system.uptimeFormatted}</span>
                </div>
            </div>

            <div class="card">
                <h3>📊 Performance Metrics</h3>
                <div class="metric">
                    <span>Total Requests:</span>
                    <span class="metric-value">${data.performance.totalRequests}</span>
                </div>
                <div class="metric">
                    <span>Success Rate:</span>
                    <span class="metric-value">${data.performance.totalRequests > 0 ? 
                        Math.round((data.performance.successfulRequests / data.performance.totalRequests) * 100) : 0}%</span>
                </div>
                <div class="metric">
                    <span>Avg Response Time:</span>
                    <span class="metric-value">${data.performance.averageResponseTime}ms</span>
                </div>
            </div>

            <div class="card">
                <h3>🔗 Endpoint Health</h3>
                ${data.health.disabledEndpoints && data.health.disabledEndpoints.length > 0 ? 
                    data.health.disabledEndpoints.map((ep: any) => `
                        <div class="endpoint-status">
                            <div class="endpoint-dot unhealthy"></div>
                            <span>${ep.type}: ${ep.failures} failures</span>
                        </div>
                    `).join('') : 
                    '<div class="endpoint-status"><div class="endpoint-dot healthy"></div><span>All endpoints operational</span></div>'
                }
            </div>

            <div class="card">
                <h3>💾 System Resources</h3>
                <div class="metric">
                    <span>Memory Usage:</span>
                    <span class="metric-value">${Math.round(data.system.memoryUsage.heapUsed / 1024 / 1024)}MB</span>
                </div>
                <div class="metric">
                    <span>Node.js:</span>
                    <span class="metric-value">${data.system.nodeVersion}</span>
                </div>
                <div class="metric">
                    <span>Started:</span>
                    <span class="metric-value">${new Date(data.system.startTime).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            ${data.recommendations.map((rec: string) => `<p style="margin-bottom: 10px;">${rec}</p>`).join('')}
        </div>

        <div class="refresh-info">
            Auto-refreshing every 30 seconds • Last updated: ${new Date(data.timestamp).toLocaleTimeString()}
        </div>
    </div>
</body>
</html>`;
}