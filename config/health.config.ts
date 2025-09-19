/**
 * Health Check Configuration
 * Customizable thresholds and component weights
 */

export interface HealthConfig {
  thresholds: {
    critical: number;    // Below this = critical status
    warning: number;     // Below this = warning status
    healthy: number;     // Above this = healthy status
    excellent: number;   // Above this = excellent status
  };

  componentWeights: {
    core: number;        // Essential components (listening, analysis)
    integration: number; // System integration points
    optional: number;    // Nice-to-have features
    environment: number; // Environment and dependencies
  };

  timeouts: {
    component: number;   // Max time per component test (ms)
    integration: number; // Max time for integration tests (ms)
    total: number;       // Max total health check time (ms)
  };

  retries: {
    component: number;   // Retry failed component tests
    integration: number; // Retry failed integration tests
  };

  reporting: {
    verbose: boolean;    // Show detailed output
    saveResults: boolean; // Save results to file
    outputPath: string;   // Where to save results
  };
}

export const HEALTH_CONFIG: HealthConfig = {
  thresholds: {
    critical: 0.5,   // 50% - Major functionality broken
    warning: 0.7,    // 70% - Some issues present
    healthy: 0.85,   // 85% - Good operational state
    excellent: 0.95  // 95% - Optimal performance
  },

  componentWeights: {
    core: 1.0,        // Active Listening, Conversation Analysis
    integration: 0.8, // Maya Orchestrator, Full Pipeline
    optional: 0.5,    // Export, Advanced Features
    environment: 0.6  // Node.js, Dependencies, API Keys
  },

  timeouts: {
    component: 5000,    // 5 seconds per component
    integration: 10000, // 10 seconds for integration
    total: 60000        // 1 minute total
  },

  retries: {
    component: 1,       // Retry once on failure
    integration: 2      // Retry twice for integration
  },

  reporting: {
    verbose: false,
    saveResults: true,
    outputPath: './health-reports'
  }
};

// Environment-specific overrides
export const DEV_CONFIG: Partial<HealthConfig> = {
  thresholds: {
    critical: 0.4,  // More lenient in development
    warning: 0.6,
    healthy: 0.8,
    excellent: 0.9
  },

  reporting: {
    verbose: true,    // More verbose in development
    saveResults: false
  }
};

export const PROD_CONFIG: Partial<HealthConfig> = {
  thresholds: {
    critical: 0.6,   // Stricter in production
    warning: 0.8,
    healthy: 0.9,
    excellent: 0.98
  },

  componentWeights: {
    core: 1.0,
    integration: 1.0,  // Integration critical in production
    optional: 0.3,     // Optional features less important
    environment: 1.0   // Environment critical in production
  }
};

export const CI_CONFIG: Partial<HealthConfig> = {
  timeouts: {
    component: 3000,   // Faster timeouts in CI
    integration: 8000,
    total: 30000
  },

  retries: {
    component: 2,      // More retries in CI (flaky environments)
    integration: 3
  },

  reporting: {
    verbose: true,     // Always verbose in CI
    saveResults: true
  }
};

// Helper function to get config for current environment
export function getHealthConfig(): HealthConfig {
  const baseConfig = { ...HEALTH_CONFIG };

  // Apply environment-specific overrides
  if (process.env.NODE_ENV === 'production') {
    return { ...baseConfig, ...PROD_CONFIG };
  }

  if (process.env.CI === 'true') {
    return { ...baseConfig, ...CI_CONFIG };
  }

  if (process.env.NODE_ENV === 'development') {
    return { ...baseConfig, ...DEV_CONFIG };
  }

  return baseConfig;
}

// Component classification for weighted scoring
export const COMPONENT_TYPES = {
  core: [
    'Active Listening',
    'Conversation Analysis',
    'Checklist Evaluation',
    'Quality Scoring'
  ],

  integration: [
    'Maya Orchestrator',
    'Full Integration',
    'System Integration'
  ],

  optional: [
    'Export Functionality',
    'History Tracking',
    'Advanced Features'
  ],

  environment: [
    'Environment',
    'API Keys',
    'Dependencies'
  ]
} as const;