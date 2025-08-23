// Cohort helpers for percentage rollouts and user bucketing
import { FeatureFlag } from './flags.schema';

/**
 * Stable hash function for consistent user bucketing
 * Uses a simple hash algorithm to ensure users stay in the same bucket
 */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if a user is enabled for a specific feature based on rollout percentage
 * Uses stable hashing to ensure consistent bucketing across sessions
 */
export function isEnabledForUser(userId: string, flag: FeatureFlag): boolean {
  // Feature must be enabled at the flag level
  if (!flag.rollout.enabled) {
    return false;
  }

  // 100% rollout = everyone gets it
  if (flag.rollout.percentage >= 100) {
    return true;
  }

  // 0% rollout = no one gets it
  if (flag.rollout.percentage <= 0) {
    return false;
  }

  // Use stable hash to determine bucket (0-99)
  const bucket = stableHash(userId + ":" + flag.key) % 100;
  return bucket < flag.rollout.percentage;
}

/**
 * Check multiple features at once for a user
 * Returns object with feature keys as properties and boolean values
 */
export function getUserFeatures(userId: string, flags: Record<string, FeatureFlag>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  
  for (const [key, flag] of Object.entries(flags)) {
    result[key] = isEnabledForUser(userId, flag);
  }
  
  return result;
}

/**
 * Get cohort information for analytics/debugging
 */
export function getUserCohortInfo(userId: string, flag: FeatureFlag) {
  const bucket = stableHash(userId + ":" + flag.key) % 100;
  const enabled = isEnabledForUser(userId, flag);
  
  return {
    bucket,
    enabled,
    rolloutPercentage: flag.rollout.percentage,
    flagEnabled: flag.rollout.enabled,
  };
}

/**
 * Validate rollout constraints and dependencies
 * Returns array of validation errors, empty if valid
 */
export function validateRollout(
  targetKey: string, 
  enabled: boolean, 
  percentage: number,
  flags: Record<string, FeatureFlag>
): string[] {
  const errors: string[] = [];
  const flag = flags[targetKey];
  
  if (!flag) {
    errors.push(`Unknown feature flag: ${targetKey}`);
    return errors;
  }

  // Percentage validation
  if (enabled && (percentage < 0 || percentage > 100)) {
    errors.push('Percentage must be between 0 and 100');
  }

  // Check dependencies if enabling
  if (enabled) {
    for (const depKey of flag.dependsOn) {
      const depFlag = flags[depKey];
      if (!depFlag || !depFlag.rollout.enabled) {
        errors.push(`Dependency ${depKey} (${depFlag?.label || 'unknown'}) is not enabled`);
      }
    }
  }

  // Check dependents if disabling
  if (!enabled) {
    const dependents = Object.values(flags).filter(f => f.dependsOn.includes(targetKey));
    const enabledDependents = dependents.filter(d => flags[d.key]?.rollout.enabled);
    
    if (enabledDependents.length > 0) {
      errors.push(`Cannot disable: required by ${enabledDependents.map(d => d.label).join(', ')}`);
    }
  }

  return errors;
}