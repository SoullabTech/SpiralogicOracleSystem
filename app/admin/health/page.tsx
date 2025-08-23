// Sacred Intelligence & Bridge Health Monitor
"use client";

import { useState, useEffect } from 'react';

interface HealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  lastCheck: string;
  metrics?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  components: HealthStatus[];
  lastUpdated: string;
}

export default function HealthMonitorPage() {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'unknown',
    components: [],
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    runHealthCheck();
    
    if (autoRefresh) {
      const interval = setInterval(runHealthCheck, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      // Simulate health checks for various components
      const components = await Promise.all([
        checkDatabase(),
        checkSoulMemoryBridge(),
        checkSpiralogicIntegration(),
        checkSafeguards(),
        checkArchetypeDetection(),
        checkReflectionGates(),
        checkEnrichmentPipeline(),
        checkExternalAPIs()
      ]);

      const criticalCount = components.filter(c => c.status === 'critical').length;
      const warningCount = components.filter(c => c.status === 'warning').length;
      
      const overall = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy';

      setHealth({
        overall,
        components,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock health check functions (in real implementation, these would call actual APIs)
  const checkDatabase = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      component: 'Database (Supabase)',
      status: 'healthy',
      message: 'All connections healthy, RLS policies active',
      lastCheck: new Date().toISOString(),
      metrics: {
        activeConnections: 12,
        avgResponseTime: '45ms',
        diskUsage: '23%'
      }
    };
  };

  const checkSoulMemoryBridge = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      component: 'Soul Memory AIN Bridge',
      status: 'healthy',
      message: 'Bridge operational, dual-write functioning',
      lastCheck: new Date().toISOString(),
      metrics: {
        entriesLast24h: 47,
        successRate: '98.3%',
        avgProcessingTime: '120ms'
      }
    };
  };

  const checkSpiralogicIntegration = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      component: 'Spiralogic Knowledge Integration',
      status: 'healthy',
      message: 'All knowledge loaders functional',
      lastCheck: new Date().toISOString(),
      metrics: {
        archetypesLoaded: 9,
        phasesLoaded: 13,
        elementMappings: 5
      }
    };
  };

  const checkSafeguards = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const alertCount = Math.floor(Math.random() * 3); // Simulate 0-2 alerts
    return {
      component: 'Spiritual Bypassing Safeguards',
      status: alertCount > 1 ? 'warning' : 'healthy',
      message: alertCount > 1 ? `${alertCount} bypassing patterns detected` : 'No concerning patterns detected',
      lastCheck: new Date().toISOString(),
      metrics: {
        alertsLast24h: alertCount,
        interventionsDelivered: Math.max(0, alertCount - 1),
        patternTypes: ['insight_addiction', 'emotional_avoidance']
      }
    };
  };

  const checkArchetypeDetection = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 180));
    return {
      component: 'Archetypal Recognition Engine',
      status: 'healthy',
      message: 'Pattern matching operational',
      lastCheck: new Date().toISOString(),
      metrics: {
        detectionAccuracy: '87%',
        processedInputs: 156,
        topArchetype: 'Seeker'
      }
    };
  };

  const checkReflectionGates = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const pendingGates = Math.floor(Math.random() * 5);
    return {
      component: 'Integration Gates & Reflection Periods',
      status: pendingGates > 10 ? 'warning' : 'healthy',
      message: `${pendingGates} active reflection periods`,
      lastCheck: new Date().toISOString(),
      metrics: {
        activeReflections: pendingGates,
        completionRate: '94%',
        avgDuration: '18 hours'
      }
    };
  };

  const checkEnrichmentPipeline = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 220));
    return {
      component: 'Soul Memory Enrichment Pipeline',
      status: 'healthy',
      message: 'All enrichment stages functional',
      lastCheck: new Date().toISOString(),
      metrics: {
        enrichmentsProcessed: 89,
        avgQualityScore: 8.2,
        failureRate: '0.8%'
      }
    };
  };

  const checkExternalAPIs = async (): Promise<HealthStatus> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const hasApiIssue = Math.random() < 0.1; // 10% chance of API issue
    return {
      component: 'External APIs (OpenAI, etc.)',
      status: hasApiIssue ? 'warning' : 'healthy',
      message: hasApiIssue ? 'Elevated response times detected' : 'All APIs responding normally',
      lastCheck: new Date().toISOString(),
      metrics: {
        openaiStatus: hasApiIssue ? 'degraded' : 'operational',
        avgResponseTime: hasApiIssue ? '3.2s' : '1.1s',
        rateLimitUsage: '34%'
      }
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🏥 System Health Monitor
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh
              </label>
            </div>
            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  🔄 Run Check
                </>
              )}
            </button>
            <a 
              href="/admin/overview"
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Back to Console
            </a>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 mb-6 ${
          health.overall === 'critical' ? 'border-red-200 dark:border-red-800' :
          health.overall === 'warning' ? 'border-yellow-200 dark:border-yellow-800' :
          'border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getStatusIcon(health.overall)}</span>
              <div>
                <h2 className={`text-xl font-semibold ${getStatusColor(health.overall)}`}>
                  System Status: {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date(health.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Components</div>
              <div className="flex space-x-4">
                <span className="text-green-600 dark:text-green-400">
                  ✅ {health.components.filter(c => c.status === 'healthy').length}
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ {health.components.filter(c => c.status === 'warning').length}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  🚨 {health.components.filter(c => c.status === 'critical').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Component Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {health.components.map((component, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${
                component.status === 'critical' ? 'border-red-200 dark:border-red-800' :
                component.status === 'warning' ? 'border-yellow-200 dark:border-yellow-800' :
                'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(component.status)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {component.component}
                    </h3>
                    <p className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                      {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(component.lastCheck).toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {component.message}
              </p>

              {component.metrics && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {Object.entries(component.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Health History (Future Feature) */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-dashed">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Health History (Coming Soon)
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Historical health data and trend analysis will be available here to help identify patterns and predict potential issues.
          </p>
        </div>
      </div>
    </div>
  );
}