// Badge Constellation Engine
// Rule evaluation and visual generation for graduation ceremonies

export interface ConstellationRule {
  anyOf?: string[];
  allOf?: string[];
  minCounts?: Record<string, number>;
  categories?: Record<string, { min: number; max?: number }>;
}

export interface ConstellationPoint {
  id: string;
  x: number;
  y: number;
  badgeCode: string;
  primary?: boolean;
}

export interface ConstellationLink {
  from: string;
  to: string;
  weight: number;
}

export interface ConstellationVisual {
  points: ConstellationPoint[];
  links: ConstellationLink[];
  palette: string[];
  title: string;
  subtitle: string;
}

export interface Constellation {
  id: string;
  code: string;
  name: string;
  description: string;
  rules: ConstellationRule;
  visual: ConstellationVisual;
}

export interface UserBadge {
  badge_id: string;
  category: string;
  awarded_at: string;
}

// Badge category mapping
const BADGE_CATEGORIES: Record<string, string> = {
  'PIONEER': 'exploration',
  'VOICE_VOYAGER': 'exploration',
  'PATHFINDER': 'exploration',
  'THREAD_WEAVER': 'depth',
  'PATTERN_SCOUT': 'insight',
  'SOUL_KEEPER': 'care',
  'SHADOW_STEWARD': 'care',
  'FEEDBACK_FRIEND': 'systems',
  'GRADUATED_PIONEER': 'systems'
};

export function getBadgeCategory(badgeId: string): string {
  return BADGE_CATEGORIES[badgeId] || 'other';
}

export function evaluateConstellationRules(
  rules: ConstellationRule,
  userBadges: UserBadge[]
): { eligible: boolean; details: any } {
  const badgeIds = userBadges.map(b => b.badge_id);
  const categoryCounts = userBadges.reduce((acc, badge) => {
    const category = getBadgeCategory(badge.badge_id);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const results = {
    anyOf: true,
    allOf: true,
    minCounts: true,
    categories: true,
    details: {
      badgeIds,
      categoryCounts,
      checks: {} as any
    }
  };

  // Check anyOf constraint
  if (rules.anyOf && rules.anyOf.length > 0) {
    results.anyOf = rules.anyOf.some(badgeId => badgeIds.includes(badgeId));
    results.details.checks.anyOf = {
      required: rules.anyOf,
      found: rules.anyOf.filter(b => badgeIds.includes(b)),
      satisfied: results.anyOf
    };
  }

  // Check allOf constraint
  if (rules.allOf && rules.allOf.length > 0) {
    results.allOf = rules.allOf.every(badgeId => badgeIds.includes(badgeId));
    results.details.checks.allOf = {
      required: rules.allOf,
      missing: rules.allOf.filter(b => !badgeIds.includes(b)),
      satisfied: results.allOf
    };
  }

  // Check minCounts constraint
  if (rules.minCounts) {
    const minCountsResults = Object.entries(rules.minCounts).map(([category, minCount]) => {
      const actualCount = categoryCounts[category] || 0;
      return { category, required: minCount, actual: actualCount, satisfied: actualCount >= minCount };
    });
    
    results.minCounts = minCountsResults.every(r => r.satisfied);
    results.details.checks.minCounts = minCountsResults;
  }

  // Check categories constraint
  if (rules.categories) {
    const categoryResults = Object.entries(rules.categories).map(([category, constraints]) => {
      const actualCount = categoryCounts[category] || 0;
      const minSatisfied = actualCount >= constraints.min;
      const maxSatisfied = !constraints.max || actualCount <= constraints.max;
      return {
        category,
        required: constraints,
        actual: actualCount,
        satisfied: minSatisfied && maxSatisfied
      };
    });
    
    results.categories = categoryResults.every(r => r.satisfied);
    results.details.checks.categories = categoryResults;
  }

  const eligible = results.anyOf && results.allOf && results.minCounts && results.categories;

  return { eligible, details: results.details };
}

export function adaptVisualToUserBadges(
  baseVisual: ConstellationVisual,
  userBadges: UserBadge[]
): ConstellationVisual {
  const userBadgeIds = new Set(userBadges.map(b => b.badge_id));
  
  // Filter points to only include badges the user has
  const availablePoints = baseVisual.points.filter(point => 
    userBadgeIds.has(point.badgeCode)
  );

  // Filter links to only connect available points
  const availablePointIds = new Set(availablePoints.map(p => p.id));
  const availableLinks = baseVisual.links.filter(link =>
    availablePointIds.has(link.from) && availablePointIds.has(link.to)
  );

  // If we have fewer points, adjust positions to center them better
  const adjustedPoints = repositionPoints(availablePoints);

  return {
    ...baseVisual,
    points: adjustedPoints,
    links: availableLinks
  };
}

function repositionPoints(points: ConstellationPoint[]): ConstellationPoint[] {
  if (points.length <= 1) return points;

  const centerX = 300;
  const centerY = 200;
  const radius = Math.min(150, 50 + points.length * 15);
  
  // Find primary point (or first point)
  const primaryIndex = points.findIndex(p => p.primary) || 0;
  const primary = points[primaryIndex];
  const others = points.filter((_, i) => i !== primaryIndex);

  // Place primary at center
  const repositioned = [
    { ...primary, x: centerX, y: centerY }
  ];

  // Arrange others in a circle around primary
  others.forEach((point, index) => {
    const angle = (index / others.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    repositioned.push({ ...point, x, y });
  });

  return repositioned;
}

export function generateNarrationLines(constellation: Constellation, userBadges: UserBadge[]): string[] {
  const badgeCount = userBadges.length;
  const categories = [...new Set(userBadges.map(b => getBadgeCategory(b.badge_id)))];
  
  const lines = [
    `Your journey through ${constellation.name} constellation`,
    `${badgeCount} badges earned across ${categories.length} dimensions`,
    `Ready to cross the threshold into graduated pioneer status`
  ];

  return lines;
}

export async function findEligibleConstellation(userBadges: UserBadge[]): Promise<string | null> {
  // Simple priority order - in real implementation, this would check all constellations
  const priorityOrder = ['WEAVER', 'WAYFINDER', 'PIONEER'];
  
  for (const constellationCode of priorityOrder) {
    // This would normally load from database and evaluate rules
    // For now, return first match based on badge count and types
    if (constellationCode === 'PIONEER' && userBadges.length >= 3) {
      return 'PIONEER';
    }
    if (constellationCode === 'WAYFINDER' && userBadges.length >= 4) {
      const hasExploration = userBadges.some(b => getBadgeCategory(b.badge_id) === 'exploration');
      const hasDepth = userBadges.some(b => getBadgeCategory(b.badge_id) === 'depth');
      if (hasExploration && hasDepth) return 'WAYFINDER';
    }
    if (constellationCode === 'WEAVER' && userBadges.length >= 5) {
      const hasThreadWeaver = userBadges.some(b => b.badge_id === 'THREAD_WEAVER');
      const hasPatternScout = userBadges.some(b => b.badge_id === 'PATTERN_SCOUT');
      if (hasThreadWeaver && hasPatternScout) return 'WEAVER';
    }
  }

  return null;
}

export async function shouldOfferGraduation(userBadges: UserBadge[], lastActivity?: Date): Promise<boolean> {
  // Rules: ≥ 5 badges total, at least one from Exploration and Depth, 
  // Thread Weaver or Pattern Scout present, active in last 7 days
  
  if (userBadges.length < 5) return false;
  
  // Check if already graduated
  if (userBadges.some(b => b.badge_id === 'GRADUATED_PIONEER')) return false;
  
  const categories = userBadges.map(b => getBadgeCategory(b.badge_id));
  const hasExploration = categories.includes('exploration');
  const hasDepth = categories.includes('depth');
  
  if (!hasExploration || !hasDepth) return false;
  
  const badgeIds = userBadges.map(b => b.badge_id);
  const hasKeyBadge = badgeIds.includes('THREAD_WEAVER') || badgeIds.includes('PATTERN_SCOUT');
  
  if (!hasKeyBadge) return false;
  
  // Check recent activity (within 7 days)
  if (lastActivity) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (lastActivity < sevenDaysAgo) return false;
  }
  
  return true;
}

// Helper to check graduation eligibility from user ID
export async function checkGraduationEligibility(userId: string): Promise<{ eligible: boolean; reason?: string; badgeCount?: number }> {
  try {
    // This would typically use the Supabase client
    // For now, return a simple structure that the calling code can populate
    return { eligible: false, reason: 'check_implementation_needed' };
  } catch (error) {
    return { eligible: false, reason: 'error_checking_eligibility' };
  }
}