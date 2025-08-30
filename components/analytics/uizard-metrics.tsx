"use client";

/**
 * Uizard Enhancement Metrics Tracking
 * Tracks performance and user engagement with AI-generated UI improvements
 */

import React, { useCallback, useEffect } from 'react';
import { useFeatureFlags } from '@/lib/feature-flags';

// ========================================
// METRICS INTERFACE
// ========================================

export interface UizardEnhancementMetrics {
  // Performance Metrics
  renderTimeImprovement: number;    // Target: <10ms increase
  animationFPS: number;            // Target: 60fps maintained
  memoryUsage: number;             // Target: <5MB increase
  
  // User Engagement  
  interactionRate: number;         // Target: +15% improvement
  hoverEngagement: number;         // Time spent exploring (ms)
  clickThroughRate: number;        // Conversion improvement
  
  // Quality Metrics
  errorRate: number;               // Target: 0% increase
  accessibilityScore: number;      // Target: maintained or improved
  loadingTime: number;             // Target: <100ms increase
  
  // User Sentiment
  feedbackScore: number;           // 1-5 rating from user feedback
  adoptionRate: number;            // % choosing enhanced version
  rollbackRate: number;           // % users turning off enhancements
}

export interface ComponentInteraction {
  componentType: 'OracleCard' | 'ButtonV2' | 'OracleInput';
  variant: string;
  enhancement: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// ========================================
// ANALYTICS TRACKER
// ========================================

class UizardAnalytics {
  private interactions: ComponentInteraction[] = [];
  private performanceEntries: PerformanceEntry[] = [];
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.startPerformanceMonitoring();
    }
  }
  
  private generateSessionId(): string {
    return `uizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private startPerformanceMonitoring() {
    // Monitor render performance
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name.includes('oracle-card') || entry.name.includes('button-v2')) {
            this.performanceEntries.push(entry);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }
  
  // Track component interactions
  public trackInteraction(interaction: Omit<ComponentInteraction, 'timestamp' | 'sessionId'>) {
    const fullInteraction: ComponentInteraction = {
      ...interaction,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.interactions.push(fullInteraction);
    
    // Send to analytics service (implement based on your analytics provider)
    this.sendToAnalytics('component_interaction', fullInteraction);
  }
  
  // Track feature flag exposures
  public trackFeatureExposure(feature: string, enabled: boolean, variant?: string) {
    this.sendToAnalytics('feature_exposure', {
      feature,
      enabled,
      variant,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }
  
  // Track performance metrics
  public trackPerformance(componentType: string, metrics: Partial<UizardEnhancementMetrics>) {
    this.sendToAnalytics('performance_metrics', {
      componentType,
      ...metrics,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }
  
  // Track user feedback
  public trackFeedback(componentType: string, rating: number, feedback?: string) {
    this.sendToAnalytics('user_feedback', {
      componentType,
      rating,
      feedback,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }
  
  // Send to analytics service (implement based on your provider)
  private sendToAnalytics(event: string, data: any) {
    // For development, just log
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Uizard Analytics] ${event}:`, data);
      return;
    }
    
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    // In production, send to your analytics service
    // Example implementations:
    
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event, {
        custom_parameters: data
      });
    }
    
    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(event, data);
    }
    
    // Custom API endpoint
    fetch('/api/analytics/uizard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    }).catch(error => {
      console.warn('Analytics tracking failed:', error);
    });
  }
  
  // Get aggregated metrics
  public getMetrics(): UizardEnhancementMetrics {
    const interactions = this.interactions;
    const recentInteractions = interactions.filter(
      i => i.timestamp > Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    return {
      renderTimeImprovement: this.calculateRenderTimeImprovement(),
      animationFPS: this.calculateAverageFPS(),
      memoryUsage: this.calculateMemoryUsage(),
      interactionRate: recentInteractions.length / Math.max(1, interactions.length),
      hoverEngagement: this.calculateHoverEngagement(),
      clickThroughRate: this.calculateClickThroughRate(),
      errorRate: 0, // Calculate from error tracking
      accessibilityScore: 100, // Calculate from accessibility audit
      loadingTime: this.calculateLoadingTime(),
      feedbackScore: this.calculateAverageFeedback(),
      adoptionRate: this.calculateAdoptionRate(),
      rollbackRate: this.calculateRollbackRate()
    };
  }
  
  private calculateRenderTimeImprovement(): number {
    // Implement based on performance entries
    return 0;
  }
  
  private calculateAverageFPS(): number {
    return 60; // Default assumption
  }
  
  private calculateMemoryUsage(): number {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  private calculateHoverEngagement(): number {
    const hoverInteractions = this.interactions.filter(
      i => i.enhancement.includes('hover') || i.enhancement.includes('animation')
    );
    return hoverInteractions.reduce((sum, i) => sum + (i.metadata?.duration || 0), 0);
  }
  
  private calculateClickThroughRate(): number {
    const clickInteractions = this.interactions.filter(i => i.enhancement.includes('click'));
    return clickInteractions.length / Math.max(1, this.interactions.length);
  }
  
  private calculateLoadingTime(): number {
    const navigationEntries = this.performanceEntries.filter(e => e.entryType === 'navigation');
    if (navigationEntries.length > 0) {
      const latest = navigationEntries[navigationEntries.length - 1] as PerformanceNavigationTiming;
      return latest.loadEventEnd - latest.fetchStart; // Use fetchStart instead of navigationStart
    }
    return 0;
  }
  
  private calculateAverageFeedback(): number {
    // Calculate from feedback tracking
    return 4.5; // Placeholder
  }
  
  private calculateAdoptionRate(): number {
    // Calculate % of users using enhanced components
    return 0.85; // 85% placeholder
  }
  
  private calculateRollbackRate(): number {
    // Calculate % of users disabling enhancements
    return 0.05; // 5% placeholder
  }
}

// Singleton instance
const uizardAnalytics = new UizardAnalytics();

// ========================================
// REACT HOOKS
// ========================================

/**
 * Hook for tracking component interactions with Uizard enhancements
 */
export const useUizardTracking = (componentType: ComponentInteraction['componentType']) => {
  const { flags } = useFeatureFlags();
  
  const trackInteraction = useCallback((
    variant: string, 
    enhancement: string, 
    metadata?: Record<string, any>
  ) => {
    uizardAnalytics.trackInteraction({
      componentType,
      variant,
      enhancement,
      userId: undefined, // Add user ID from auth context if available
      metadata
    });
  }, [componentType]);
  
  const trackFeatureExposure = useCallback((feature: string, variant?: string) => {
    uizardAnalytics.trackFeatureExposure(feature, flags[feature as keyof typeof flags], variant);
  }, [flags]);
  
  const trackPerformance = useCallback((metrics: Partial<UizardEnhancementMetrics>) => {
    uizardAnalytics.trackPerformance(componentType, metrics);
  }, [componentType]);
  
  const trackFeedback = useCallback((rating: number, feedback?: string) => {
    uizardAnalytics.trackFeedback(componentType, rating, feedback);
  }, [componentType]);
  
  return {
    trackInteraction,
    trackFeatureExposure,
    trackPerformance,
    trackFeedback
  };
};

/**
 * Hook for monitoring component performance
 */
export const useUizardPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      uizardAnalytics.trackPerformance(componentName, {
        renderTimeImprovement: renderTime
      });
    };
  }, [componentName]);
  
  const measureInteraction = useCallback((interactionName: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    uizardAnalytics.trackInteraction({
      componentType: componentName as ComponentInteraction['componentType'],
      variant: 'performance',
      enhancement: interactionName,
      metadata: {
        duration: endTime - startTime,
        timestamp: Date.now()
      }
    });
  }, [componentName]);
  
  return { measureInteraction };
};

/**
 * Component wrapper for automatic tracking
 */
export function withUizardTracking(
  Component: React.ComponentType<any>,
  componentType: ComponentInteraction['componentType']
) {
  const TrackedComponent = (props: any) => {
    const { trackFeatureExposure } = useUizardTracking(componentType);
    
    useEffect(() => {
      trackFeatureExposure(`uizard_${componentType.toLowerCase()}`);
    }, [trackFeatureExposure]);
    
    return <Component {...props} />;
  };
  
  TrackedComponent.displayName = `withUizardTracking(${Component.displayName || Component.name})`;
  return TrackedComponent;
}

export { uizardAnalytics };