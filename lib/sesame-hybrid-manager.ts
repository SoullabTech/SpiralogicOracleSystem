// lib/sesame-hybrid-manager.ts
interface EndpointConfig {
  url: string;
  type: 'production' | 'tunnel' | 'ngrok' | 'local';
  priority: number;
  enabled: boolean;
  lastSuccess: number;
  consecutiveFailures: number;
}

interface SesameResponse {
  success: boolean;
  shaped: string;
  source: string;
  responseTime: number;
  fallbackUsed: boolean;
}

class SesameHybridManager {
  private endpoints: EndpointConfig[] = [
    {
      url: 'https://soullab.life/api/sesame/ci/shape',
      type: 'production',
      priority: 1,
      enabled: true,
      lastSuccess: 0,
      consecutiveFailures: 0
    },
    {
      url: 'https://sesame.soullab.life/ci/shape',
      type: 'tunnel',
      priority: 2,
      enabled: true,
      lastSuccess: 0,
      consecutiveFailures: 0
    },
    {
      url: 'https://76201ef0497f.ngrok-free.app/ci/shape',
      type: 'ngrok',
      priority: 3,
      enabled: true,
      lastSuccess: 0,
      consecutiveFailures: 0
    }
  ];

  private circuitBreakerThreshold = 3; // Failures before disabling endpoint
  private recoveryTimeout = 5 * 60 * 1000; // 5 minutes before re-enabling

  constructor() {
    this.loadEndpointStatus();
  }

  private loadEndpointStatus() {
    // In a real implementation, you'd load from a persistent store
    // For now, we'll use memory with periodic recovery attempts
  }

  private saveEndpointStatus() {
    // Save endpoint status for persistence across restarts
  }

  getActiveEndpoints(): EndpointConfig[] {
    const now = Date.now();
    return this.endpoints
      .filter(endpoint => {
        // Re-enable endpoints after recovery timeout
        if (!endpoint.enabled && 
            now - endpoint.lastSuccess > this.recoveryTimeout) {
          endpoint.enabled = true;
          endpoint.consecutiveFailures = 0;
          console.log(`Re-enabling endpoint: ${endpoint.url}`);
        }
        return endpoint.enabled;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  private async tryEndpoint(
    endpoint: EndpointConfig, 
    text: string, 
    element: string = 'water', 
    archetype: string = 'oracle'
  ): Promise<SesameResponse | null> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ text, element, archetype }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Mark success
      endpoint.lastSuccess = Date.now();
      endpoint.consecutiveFailures = 0;
      this.saveEndpointStatus();
      
      console.log(`✅ Sesame success via ${endpoint.type}: ${responseTime}ms`);
      
      return {
        success: true,
        shaped: data.shaped || data.text || text,
        source: `sesame-${endpoint.type}`,
        responseTime,
        fallbackUsed: false
      };
      
    } catch (error: any) {
      console.warn(`❌ Sesame endpoint ${endpoint.type} failed:`, error.message);
      
      // Track failure
      endpoint.consecutiveFailures++;
      
      // Disable endpoint if it fails too many times
      if (endpoint.consecutiveFailures >= this.circuitBreakerThreshold) {
        endpoint.enabled = false;
        console.warn(`🚫 Disabling endpoint ${endpoint.type} after ${this.circuitBreakerThreshold} failures`);
      }
      
      this.saveEndpointStatus();
      return null;
    }
  }

  async shapeText(
    text: string,
    element: string = 'water',
    archetype: string = 'oracle'
  ): Promise<SesameResponse> {
    const activeEndpoints = this.getActiveEndpoints();
    
    if (activeEndpoints.length === 0) {
      console.warn('🚨 No active Sesame endpoints available');
      return {
        success: true,
        shaped: text,
        source: 'fallback-no-endpoints',
        responseTime: 0,
        fallbackUsed: true
      };
    }
    
    // Try endpoints in order of priority
    for (const endpoint of activeEndpoints) {
      const result = await this.tryEndpoint(endpoint, text, element, archetype);
      if (result) {
        return result;
      }
    }
    
    // All endpoints failed - return original text as fallback
    console.warn('🚨 All Sesame endpoints failed, using fallback');
    return {
      success: true,
      shaped: text,
      source: 'fallback-all-failed',
      responseTime: 0,
      fallbackUsed: true
    };
  }

  async getHealthStatus() {
    const activeEndpoints = this.getActiveEndpoints();
    const disabledEndpoints = this.endpoints.filter(e => !e.enabled);
    
    return {
      healthy: activeEndpoints.length > 0,
      activeEndpoints: activeEndpoints.length,
      totalEndpoints: this.endpoints.length,
      disabledEndpoints: disabledEndpoints.map(e => ({
        url: e.url,
        type: e.type,
        failures: e.consecutiveFailures
      })),
      recommendedAction: activeEndpoints.length === 0 
        ? 'All endpoints down - using Claude-only mode'
        : activeEndpoints.length < this.endpoints.length 
        ? 'Some endpoints down - monitoring recovery'
        : 'All systems operational'
    };
  }

  // Force endpoint recovery (useful for manual intervention)
  forceRecoverEndpoint(type: string) {
    const endpoint = this.endpoints.find(e => e.type === type);
    if (endpoint) {
      endpoint.enabled = true;
      endpoint.consecutiveFailures = 0;
      endpoint.lastSuccess = Date.now();
      this.saveEndpointStatus();
      console.log(`🔧 Manually recovered endpoint: ${type}`);
    }
  }
}

// Export singleton instance
export const sesameHybridManager = new SesameHybridManager();