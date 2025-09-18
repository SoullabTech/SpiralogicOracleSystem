/**
 * Feature flags for progressive feature rollout
 * Phase 1: Core features (enabled)
 * Phase 2: Advanced features (disabled, ready for beta)
 */

export const FEATURE_FLAGS = {
  // === Phase 1: Core Features (Active) ===
  SPIRALOGIC_PRESENCE: true,           // 36-dimensional presence tracking
  VOICE_INTERFACE: true,                // Voice conversation capabilities
  COLLECTIVE_INTELLIGENCE: true,        // Anonymous pattern aggregation
  MAYA_CHAT: true,                      // Core Maya conversational AI
  SYMBOLIC_TIMELINE: true,              // Basic timeline and event tracking
  ELEMENTAL_TRACKING: true,             // Track elemental facets in conversations

  // === Phase 2: Advanced Features (Beta Ready) ===
  WEEKLY_INSIGHTS: true,                // Weekly psychological insights & spiral visualization
  EDGE_PANELS: true,                    // Sliding panels (top/bottom/left/right)
  DIVINATION_TOOLS: false,              // Tarot, I-Ching, ritual guidance
  LONGITUDINAL_PATTERNS: true,          // Monthly/seasonal pattern tracking
  COMMUNITY_THEMES: false,              // Collective resonance patterns
  DAILY_CHECKINS: false,                // Morning/evening elemental check-ins
  INTEGRATION_PRACTICES: true,          // Personalized practice recommendations
  ADVANCED_VISUALIZATIONS: false,       // Enhanced data visualizations
  RITUAL_LIBRARY: false,                // Guided rituals and ceremonies
  SYNCHRONICITY_ORACLE: false,          // Pattern-based synchronicity readings

  // === Development Features ===
  DEBUG_MODE: process.env.NODE_ENV === "development",
  VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === "true",
  MOCK_DATA: process.env.USE_MOCK_DATA === "true"
} as const;

/**
 * Check if a feature is enabled
 * Can be used in components: if (isFeatureEnabled("WEEKLY_INSIGHTS")) { ... }
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] || false;
}

/**
 * Get all enabled features (for debugging/admin panels)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}

/**
 * Phase 2 rollout configuration
 * Controls gradual feature enablement
 */
export const PHASE2_ROLLOUT = {
  // User cohorts for beta testing
  BETA_USER_IDS: process.env.NEXT_PUBLIC_BETA_USER_IDS?.split(",") || [],

  // Percentage rollout (0-100)
  ROLLOUT_PERCENTAGE: {
    WEEKLY_INSIGHTS: 0,        // Start at 0%, increase gradually
    EDGE_PANELS: 0,
    DIVINATION_TOOLS: 0
  },

  // Date-based activation (ISO strings)
  ACTIVATION_DATES: {
    WEEKLY_INSIGHTS: "2025-02-01",
    EDGE_PANELS: "2025-02-15",
    DIVINATION_TOOLS: "2025-03-01"
  }
};

/**
 * Check if user has access to Phase 2 features
 */
export function hasPhase2Access(userId: string, feature: keyof typeof FEATURE_FLAGS): boolean {
  // Check if feature is force-enabled
  if (FEATURE_FLAGS[feature]) return true;

  // Check if user is in beta cohort
  if (PHASE2_ROLLOUT.BETA_USER_IDS.includes(userId)) return true;

  // Check percentage rollout (using hash of userId for consistency)
  const rolloutPercent = PHASE2_ROLLOUT.ROLLOUT_PERCENTAGE[feature as keyof typeof PHASE2_ROLLOUT.ROLLOUT_PERCENTAGE];
  if (rolloutPercent && rolloutPercent > 0) {
    const userHash = hashCode(userId);
    const userPercent = Math.abs(userHash) % 100;
    if (userPercent < rolloutPercent) return true;
  }

  // Check date-based activation
  const activationDate = PHASE2_ROLLOUT.ACTIVATION_DATES[feature as keyof typeof PHASE2_ROLLOUT.ACTIVATION_DATES];
  if (activationDate && new Date() >= new Date(activationDate)) return true;

  return false;
}

/**
 * Simple hash function for consistent user bucketing
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}