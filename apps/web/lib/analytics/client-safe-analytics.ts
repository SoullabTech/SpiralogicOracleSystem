/**
 * Client-Safe Analytics with SSR Protection
 * Wraps all browser-only analytics code to prevent SSR errors
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debugMode: boolean;
  userId?: string;
}

/**
 * Safe analytics class that handles SSR gracefully
 */
class ClientSafeAnalytics {
  private config: AnalyticsConfig = {
    enabled: true,
    debugMode: false,
  };

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Initialize analytics (browser-only)
   */
  init(config: Partial<AnalyticsConfig> = {}) {
    if (!this.isClient()) {
      return; // Skip on server-side
    }

    this.config = { ...this.config, ...config };
    
    // Load user ID from localStorage if available
    if (!this.config.userId) {
      try {
        this.config.userId = localStorage.getItem('spiralogic-user-id') || undefined;
      } catch (error) {
        console.warn('Failed to load user ID from localStorage:', error);
      }
    }

    if (this.config.debugMode) {
      console.log('🔍 Analytics initialized:', this.config);
    }
  }

  /**
   * Track an analytics event
   */
  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isClient() || !this.config.enabled) {
      return; // Skip on server-side or when disabled
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      userId: this.config.userId,
      timestamp: Date.now(),
    };

    // Store in localStorage for batch sending
    try {
      const events = this.getStoredEvents();
      events.push(analyticsEvent);
      localStorage.setItem('spiralogic-analytics-events', JSON.stringify(events));
      
      if (this.config.debugMode) {
        console.log('📊 Analytics event tracked:', analyticsEvent);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }

    // Send immediately if we have connectivity
    this.sendEvents();
  }

  /**
   * Track page view
   */
  trackPageView(path?: string) {
    if (!this.isClient()) {
      return;
    }

    this.track('page_view', {
      path: path || window.location.pathname,
      referrer: document.referrer,
      title: document.title,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, element: string, properties: Record<string, any> = {}) {
    this.track('user_interaction', {
      action,
      element,
      ...properties,
    });
  }

  /**
   * Track Oracle usage
   */
  trackOracleUsage(agentType: string, query: string, response: string) {
    this.track('oracle_usage', {
      agentType,
      queryLength: query.length,
      responseLength: response.length,
      sessionId: this.getSessionId(),
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string = 'used') {
    this.track('feature_usage', {
      feature,
      action,
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string) {
    this.config.userId = userId;
    
    if (this.isClient()) {
      try {
        localStorage.setItem('spiralogic-user-id', userId);
      } catch (error) {
        console.warn('Failed to save user ID to localStorage:', error);
      }
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (!this.isClient()) {
      return 'server-session';
    }

    try {
      let sessionId = sessionStorage.getItem('spiralogic-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('spiralogic-session-id', sessionId);
      }
      return sessionId;
    } catch (error) {
      console.warn('Failed to get/set session ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Get stored events from localStorage
   */
  private getStoredEvents(): AnalyticsEvent[] {
    if (!this.isClient()) {
      return [];
    }

    try {
      const stored = localStorage.getItem('spiralogic-analytics-events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      return [];
    }
  }

  /**
   * Send stored events to analytics service
   */
  private async sendEvents() {
    if (!this.isClient()) {
      return;
    }

    const events = this.getStoredEvents();
    if (events.length === 0) {
      return;
    }

    try {
      // In a real implementation, send to your analytics service
      // For now, just log in debug mode
      if (this.config.debugMode) {
        console.log('📤 Would send analytics events:', events);
      }

      // Clear sent events
      localStorage.removeItem('spiralogic-analytics-events');
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  clear() {
    if (!this.isClient()) {
      return;
    }

    try {
      localStorage.removeItem('spiralogic-analytics-events');
      localStorage.removeItem('spiralogic-user-id');
      sessionStorage.removeItem('spiralogic-session-id');
    } catch (error) {
      console.warn('Failed to clear analytics data:', error);
    }
  }
}

// Export singleton instance
export const analytics = new ClientSafeAnalytics();

// Initialize with default config
if (typeof window !== 'undefined') {
  analytics.init({
    enabled: process.env.NODE_ENV === 'production',
    debugMode: process.env.NODE_ENV === 'development',
  });
}

export default analytics;