"use client";

/**
 * Feature Rollout Configuration
 * Manages gradual rollout of Uizard enhancements to user segments
 */

export interface RolloutConfig {
  featureName: string;
  rolloutPercentage: number;
  targetUserGroups: UserGroup[];
  enabledEnvironments: Environment[];
  startDate: Date;
  endDate?: Date;
  rollbackTriggers: RollbackTrigger[];
  metrics: MetricThreshold[];
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  selectionCriteria: UserCriteria;
}

export interface UserCriteria {
  userType?: 'beta' | 'premium' | 'free' | 'internal';
  engagementLevel?: 'high' | 'medium' | 'low';
  registrationDate?: { before?: Date; after?: Date };
  activityScore?: { min?: number; max?: number };
  geographic?: string[];
  customAttributes?: Record<string, any>;
}

export type Environment = 'development' | 'staging' | 'production';

export interface RollbackTrigger {
  metric: string;
  threshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  timeWindow: number; // minutes
  action: 'warn' | 'rollback' | 'pause';
}

export interface MetricThreshold {
  name: string;
  target: number;
  critical: number;
  unit: string;
}

// ========================================
// UIZARD ENHANCEMENT ROLLOUT CONFIGS
// ========================================

/**
 * Phase 1: Internal Team Testing (Week 1)
 */
export const internalTestingConfig: RolloutConfig = {
  featureName: 'uizard_components',
  rolloutPercentage: 100,
  targetUserGroups: [
    {
      id: 'internal-team',
      name: 'Internal Team',
      description: 'SpiralogicOracleSystem development and design team',
      selectionCriteria: {
        userType: 'internal',
        customAttributes: {
          role: ['developer', 'designer', 'product-manager']
        }
      }
    }
  ],
  enabledEnvironments: ['development', 'staging'],
  startDate: new Date('2024-01-28'),
  endDate: new Date('2024-02-04'),
  rollbackTriggers: [
    {
      metric: 'error_rate',
      threshold: 1, // 1% error rate
      comparison: 'greater_than',
      timeWindow: 15,
      action: 'rollback'
    },
    {
      metric: 'performance_degradation',
      threshold: 50, // 50ms slower
      comparison: 'greater_than',
      timeWindow: 30,
      action: 'warn'
    }
  ],
  metrics: [
    {
      name: 'User Satisfaction',
      target: 4.5,
      critical: 3.5,
      unit: 'stars'
    },
    {
      name: 'Interaction Rate',
      target: 15, // 15% improvement
      critical: -5, // Don't decrease by more than 5%
      unit: 'percentage'
    }
  ]
};

/**
 * Phase 2: Beta Users (Week 2) - 10% Rollout
 */
export const betaUsersConfig: RolloutConfig = {
  featureName: 'uizard_components',
  rolloutPercentage: 10,
  targetUserGroups: [
    {
      id: 'engaged-beta-users',
      name: 'Engaged Beta Users',
      description: 'High-engagement beta testers who provide quality feedback',
      selectionCriteria: {
        userType: 'beta',
        engagementLevel: 'high',
        activityScore: { min: 80 },
        registrationDate: { after: new Date('2024-01-01') }
      }
    },
    {
      id: 'premium-early-adopters',
      name: 'Premium Early Adopters',
      description: 'Premium users who opt-in to beta features',
      selectionCriteria: {
        userType: 'premium',
        customAttributes: {
          betaOptIn: true,
          lastActivity: 'within_7_days'
        }
      }
    }
  ],
  enabledEnvironments: ['production'],
  startDate: new Date('2024-02-04'),
  endDate: new Date('2024-02-11'),
  rollbackTriggers: [
    {
      metric: 'error_rate',
      threshold: 0.5, // 0.5% error rate (stricter for production)
      comparison: 'greater_than',
      timeWindow: 10,
      action: 'rollback'
    },
    {
      metric: 'user_complaints',
      threshold: 5,
      comparison: 'greater_than',
      timeWindow: 60,
      action: 'pause'
    },
    {
      metric: 'bounce_rate',
      threshold: 10, // 10% increase in bounce rate
      comparison: 'greater_than',
      timeWindow: 30,
      action: 'warn'
    }
  ],
  metrics: [
    {
      name: 'User Retention',
      target: 85, // 85% retention
      critical: 75,
      unit: 'percentage'
    },
    {
      name: 'Feature Adoption',
      target: 60, // 60% of eligible users interact with enhancements
      critical: 30,
      unit: 'percentage'
    },
    {
      name: 'Performance Score',
      target: 90, // Lighthouse score
      critical: 80,
      unit: 'score'
    }
  ]
};

/**
 * Phase 3: Gradual Expansion (Week 3+)
 */
export const gradualExpansionConfig: RolloutConfig = {
  featureName: 'uizard_components',
  rolloutPercentage: 25, // Start at 25%, increase weekly
  targetUserGroups: [
    {
      id: 'regular-users',
      name: 'Regular Active Users',
      description: 'Standard user base with consistent activity',
      selectionCriteria: {
        userType: 'free',
        engagementLevel: 'medium',
        activityScore: { min: 40 },
        registrationDate: { before: new Date('2024-01-15') }
      }
    }
  ],
  enabledEnvironments: ['production'],
  startDate: new Date('2024-02-11'),
  rollbackTriggers: [
    {
      metric: 'error_rate',
      threshold: 0.3, // Even stricter for wider rollout
      comparison: 'greater_than',
      timeWindow: 10,
      action: 'rollback'
    },
    {
      metric: 'support_tickets',
      threshold: 20, // 20 additional tickets per hour
      comparison: 'greater_than',
      timeWindow: 60,
      action: 'pause'
    }
  ],
  metrics: [
    {
      name: 'Overall Satisfaction',
      target: 4.3,
      critical: 3.8,
      unit: 'stars'
    },
    {
      name: 'Session Duration',
      target: 10, // 10% increase
      critical: -10, // Don't decrease by more than 10%
      unit: 'percentage'
    }
  ]
};

// ========================================
// ROLLOUT MANAGER
// ========================================

export class RolloutManager {
  private currentConfig: RolloutConfig | null = null;
  
  constructor(private environment: Environment) {}
  
  /**
   * Determine if user should see enhanced features
   */
  public shouldEnableForUser(
    userId: string, 
    userAttributes: Record<string, any>,
    featureName: string
  ): boolean {
    const config = this.getCurrentConfig(featureName);
    if (!config) return false;
    
    // Check environment
    if (!config.enabledEnvironments.includes(this.environment)) {
      return false;
    }
    
    // Check if user matches target groups
    const matchesUserGroup = config.targetUserGroups.some(group => 
      this.userMatchesCriteria(userAttributes, group.selectionCriteria)
    );
    
    if (!matchesUserGroup) return false;
    
    // Apply percentage rollout
    const userHash = this.hashUserId(userId);
    const userPercentile = userHash % 100;
    
    return userPercentile < config.rolloutPercentage;
  }
  
  /**
   * Check if rollback should be triggered
   */
  public shouldRollback(featureName: string, metrics: Record<string, number>): boolean {
    const config = this.getCurrentConfig(featureName);
    if (!config) return false;
    
    return config.rollbackTriggers.some(trigger => {
      const metricValue = metrics[trigger.metric];
      if (metricValue === undefined) return false;
      
      switch (trigger.comparison) {
        case 'greater_than':
          return metricValue > trigger.threshold;
        case 'less_than':
          return metricValue < trigger.threshold;
        case 'equals':
          return metricValue === trigger.threshold;
        default:
          return false;
      }
    });
  }
  
  /**
   * Get current rollout configuration
   */
  private getCurrentConfig(featureName: string): RolloutConfig | null {
    const now = new Date();
    const configs = [internalTestingConfig, betaUsersConfig, gradualExpansionConfig];
    
    return configs.find(config => 
      config.featureName === featureName &&
      config.startDate <= now &&
      (!config.endDate || config.endDate >= now)
    ) || null;
  }
  
  /**
   * Check if user matches selection criteria
   */
  private userMatchesCriteria(
    userAttributes: Record<string, any>, 
    criteria: UserCriteria
  ): boolean {
    if (criteria.userType && userAttributes.userType !== criteria.userType) {
      return false;
    }
    
    if (criteria.engagementLevel && userAttributes.engagementLevel !== criteria.engagementLevel) {
      return false;
    }
    
    if (criteria.activityScore) {
      const score = userAttributes.activityScore || 0;
      if (criteria.activityScore.min && score < criteria.activityScore.min) return false;
      if (criteria.activityScore.max && score > criteria.activityScore.max) return false;
    }
    
    // Check custom attributes
    if (criteria.customAttributes) {
      for (const [key, expectedValue] of Object.entries(criteria.customAttributes)) {
        if (Array.isArray(expectedValue)) {
          if (!expectedValue.includes(userAttributes[key])) return false;
        } else {
          if (userAttributes[key] !== expectedValue) return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Simple hash function for consistent user bucketing
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// ========================================
// USAGE EXAMPLES
// ========================================

/**
 * Example usage in feature flag system
 */
export function useRolloutConfig(featureName: string, userId: string, userAttributes: Record<string, any>) {
  const environment: Environment = process.env.NODE_ENV as Environment || 'development';
  const rolloutManager = new RolloutManager(environment);
  
  return rolloutManager.shouldEnableForUser(userId, userAttributes, featureName);
}

/**
 * Example metrics monitoring
 */
export function monitorRolloutMetrics(featureName: string, currentMetrics: Record<string, number>) {
  const environment: Environment = process.env.NODE_ENV as Environment || 'development';
  const rolloutManager = new RolloutManager(environment);
  
  if (rolloutManager.shouldRollback(featureName, currentMetrics)) {
    console.warn(`🚨 Rollback triggered for ${featureName}:`, currentMetrics);
    // Trigger rollback process
    return true;
  }
  
  return false;
}