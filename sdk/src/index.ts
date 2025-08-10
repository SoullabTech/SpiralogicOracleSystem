// AIN Engine SDK - TypeScript Client
// Official SDK for the Spiralogic Oracle System AIN Engine API

export interface AINEngineConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface CollectiveInsight {
  id: string;
  type: 'archetypal_pattern' | 'elemental_shift' | 'consciousness_trend' | 'shadow_integration';
  title: string;
  description: string;
  elementalResonance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  archetypalSignature: string;
  confidenceLevel: number;
  relevantUsers: number;
  timeframe: string;
  guidance: string;
  createdAt: string;
}

export interface ArchetypalProcess {
  id: string;
  name: string;
  element: string;
  archetype: string;
  description: string;
  phases: string[];
  practices: string[];
  indicators: string[];
  integrationGuidance: string;
  isActive: boolean;
}

export interface ElementalWisdom {
  [element: string]: {
    element: string;
    principle: string;
    currentTrend: string;
    guidance: string;
    practices: string[];
    balance: string;
  };
}

export interface SystemStatus {
  status: string;
  version: string;
  lastUpdate: string;
  services: Record<string, string>;
  metrics: Record<string, any>;
  rateLimit: {
    requestsPerWindow: number;
    windowDuration: string;
    currentUsage: number;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
    [key: string]: any;
  };
}

export interface CollectiveInsightsQuery {
  limit?: number;
  type?: 'archetypal_pattern' | 'elemental_shift' | 'consciousness_trend' | 'shadow_integration';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  confidenceThreshold?: number;
}

export interface ArchetypalProcessQuery {
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype?: string;
  activeOnly?: boolean;
}

export class AINEngineError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'AINEngineError';
  }
}

export class AINEngineClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: AINEngineConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.spiralogic.oracle/v1/ain-engine';
    this.timeout = config.timeout || 30000;

    if (!this.apiKey) {
      throw new Error('API key is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data: APIResponse<T> = await response.json();

      if (!response.ok) {
        throw new AINEngineError(
          response.status,
          data.errors?.[0] || `HTTP ${response.status}`,
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AINEngineError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AINEngineError(408, 'Request timeout');
        }
        throw new AINEngineError(500, error.message);
      }
      
      throw new AINEngineError(500, 'Unknown error occurred');
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
    
    return filtered.length > 0 ? `?${filtered.join('&')}` : '';
  }

  /**
   * Get anonymized collective insights from the Spiralogic Oracle network
   */
  async getCollectiveInsights(
    query: CollectiveInsightsQuery = {}
  ): Promise<CollectiveInsight[]> {
    const queryString = this.buildQueryString(query);
    const response = await this.makeRequest<CollectiveInsight[]>(`/collective-insights${queryString}`);
    return response.data || [];
  }

  /**
   * Get available archetypal development processes
   */
  async getArchetypalProcesses(
    query: ArchetypalProcessQuery = {}
  ): Promise<ArchetypalProcess[]> {
    const queryString = this.buildQueryString(query);
    const response = await this.makeRequest<ArchetypalProcess[]>(`/archetypal-processes${queryString}`);
    return response.data || [];
  }

  /**
   * Get elemental wisdom patterns and guidance
   */
  async getElementalWisdom(): Promise<ElementalWisdom> {
    const response = await this.makeRequest<ElementalWisdom>('/elemental-wisdom');
    return response.data || {};
  }

  /**
   * Get AIN Engine system status and health metrics
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await this.makeRequest<SystemStatus>('/system-status');
    return response.data || {} as SystemStatus;
  }

  /**
   * Test API connectivity and authentication
   */
  async ping(): Promise<boolean> {
    try {
      await this.getSystemStatus();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export default client factory
export function createAINEngineClient(config: AINEngineConfig): AINEngineClient {
  return new AINEngineClient(config);
}

// Export everything as default export as well
export default {
  AINEngineClient,
  createAINEngineClient,
  AINEngineError,
};