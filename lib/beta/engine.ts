// Beta Badge Evaluation Engine
// Checks events and awards badges based on user behavior
import { supabaseServer } from "@/lib/supabase/server";
import { awardBadge, hasBadge, getBetaProgress } from "./events";
import { getThresholds } from "./config";

export interface BadgeRule {
  code: string;
  name: string;
  check: (userId: string, progress: any, events: any[]) => Promise<boolean>;
  cooldown?: number; // minutes between checks
}

// Badge evaluation rules
export const badgeRules: BadgeRule[] = [
  {
    code: 'PIONEER',
    name: 'Beta Pioneer',
    async check(userId: string, progress: any) {
      const thresholds = await getThresholds();
      // Complete starter pack events based on config
      const requiredEvents = thresholds.starterPack;
      return requiredEvents.every(eventType => progress[eventType] > 0);
    }
  },

  {
    code: 'THREAD_WEAVER',
    name: 'Thread Weaver',
    async check(userId: string, progress: any, events: any[]) {
      // Wove a synthesis when stories connected
      return events.some(e => e.kind === 'thread_weave');
    }
  },

  {
    code: 'MIRROR_MAKER',
    name: 'Mirror Maker',
    async check(userId: string, progress: any) {
      // Tuned the Holoflower with clear intention (changed element 3+ times)
      return progress.holoflower_sets >= 3;
    }
  },

  {
    code: 'VOICE_VOYAGER',
    name: 'Voice Voyager',
    async check(userId: string, progress: any) {
      // Tried voice and let it speak back (used voice preview + had response spoken)
      return progress.voice_previews >= 2;
    }
  },

  {
    code: 'SOUL_KEEPER',
    name: 'Soul Keeper',
    async check(userId: string, progress: any) {
      // Saved a moment that mattered (soul memory with sacred moment)
      return progress.soul_saves >= 1;
    }
  },

  {
    code: 'PATHFINDER',
    name: 'Pathfinder',
    async check(userId: string, progress: any) {
      const thresholds = await getThresholds();
      // Dynamic pathfinder requirements from config
      return progress.active_days >= thresholds.pathfinder.daysNeeded;
    }
  },

  {
    code: 'PATTERN_SCOUT',
    name: 'Pattern Scout',
    async check(userId: string, progress: any, events: any[]) {
      // Surfaced a thread others can learn from (pattern discovery event)
      return events.some(e => e.kind === 'pattern_discovery');
    }
  },

  {
    code: 'SHADOW_STEWARD',
    name: 'Shadow Steward',
    async check(userId: string, progress: any, events: any[]) {
      const thresholds = await getThresholds();
      // Met a hard thing with care (dynamic threshold from config)
      return events.some(e => 
        e.kind === 'shadow_work' && 
        e.detail?.shadowScore >= thresholds.shadowSteward.minScore
      );
    }
  },

  {
    code: 'FEEDBACK_FRIEND',
    name: 'Feedback Friend',
    async check(userId: string, progress: any) {
      // Left notes that made the system better (3+ feedback submissions)
      return progress.feedbacks >= 3;
    }
  },

  {
    code: 'VOICE_VOYAGER',
    name: 'Voice Voyager',
    async check(userId: string, progress: any, events: any[]) {
      // Uploaded and transcribed first audio file
      return events.some(e => e.kind === 'upload_transcribed' && 
        e.detail?.file_type?.startsWith('audio/'));
    }
  },

  {
    code: 'ARCHIVIST',
    name: 'Archivist',
    async check(userId: string, progress: any, events: any[]) {
      // Uploaded and processed 3+ files
      const uploadEvents = events.filter(e => 
        e.kind === 'upload_ready' || e.kind === 'upload_transcribed' || e.kind === 'upload_processed'
      );
      return uploadEvents.length >= 3;
    }
  },

  {
    code: 'INSIGHT_DIVER',
    name: 'Insight Diver',
    async check(userId: string, progress: any, events: any[]) {
      // Referenced an upload in conversation context
      return events.some(e => e.kind === 'upload_context_used' && 
        e.detail?.mentioned_explicitly === true);
    }
  }
];

// Evaluate all badges for a user
export async function evaluateUserBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];
  
  try {
    // Check if badges are enabled
    const thresholds = await getThresholds();
    if (!thresholds.badgesEnabled) {
      return newBadges;
    }

    const progress = await getBetaProgress(userId);
    if (!progress) return newBadges;

    // Get recent events for detailed checks
    const { data: events } = await supabaseServer()
      .from('beta_events')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(100);

    // Check each badge rule
    for (const rule of badgeRules) {
      const alreadyHas = await hasBadge(userId, rule.code);
      if (alreadyHas) continue;

      const qualifies = await rule.check(userId, progress, events || []);
      if (qualifies) {
        const awarded = await awardBadge(userId, rule.code);
        if (awarded) {
          newBadges.push(rule.code);
        }
      }
    }

  } catch (error) {
    console.warn('Badge evaluation failed for user:', userId, error);
  }

  return newBadges;
}

// Batch evaluate badges for multiple users (for background processing)
export async function evaluateBatchBadges(userIds: string[]): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  
  for (const userId of userIds) {
    try {
      results[userId] = await evaluateUserBadges(userId);
    } catch (error) {
      console.warn('Badge evaluation failed for user:', userId, error);
      results[userId] = [];
    }
  }
  
  return results;
}

// Get users who might need badge evaluation (have recent activity)
export async function getActiveUsers(hoursBack: number = 24): Promise<string[]> {
  try {
    const { data } = await supabaseServer()
      .from('beta_events')
      .select('user_id')
      .gte('occurred_at', new Date(Date.now() - hoursBack * 3600 * 1000).toISOString())
      .order('occurred_at', { ascending: false });

    if (!data) return [];

    // Deduplicate user IDs
    const uniqueUsers = [...new Set(data.map(row => row.user_id))];
    return uniqueUsers;
  } catch {
    return [];
  }
}

// Check if user is eligible for specific badge (without awarding)
export async function checkBadgeEligibility(userId: string, badgeCode: string): Promise<boolean> {
  const rule = badgeRules.find(r => r.code === badgeCode);
  if (!rule) return false;

  const alreadyHas = await hasBadge(userId, badgeCode);
  if (alreadyHas) return false;

  const progress = await getBetaProgress(userId);
  if (!progress) return false;

  const { data: events } = await supabaseServer()
    .from('beta_events')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(100);

  return await rule.check(userId, progress, events || []);
}

// Get user's badge collection with metadata
export async function getUserBadges(userId: string) {
  try {
    const { data } = await supabaseServer()
      .from('beta_user_badges')
      .select(`
        badge_code,
        awarded_at,
        beta_badges (
          name,
          tagline,
          category,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    return data?.map(row => ({
      code: row.badge_code,
      awardedAt: row.awarded_at,
      ...row.beta_badges
    })) || [];
  } catch {
    return [];
  }
}

// Get badge progress for UI (which badges are close to earning)
export async function getBadgeProgress(userId: string) {
  const progress = await getBetaProgress(userId);
  if (!progress) return [];

  const { data: events } = await supabaseServer()
    .from('beta_events')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(100);

  const progressData = [];

  for (const rule of badgeRules) {
    const alreadyHas = await hasBadge(userId, rule.code);
    if (alreadyHas) continue;

    // Calculate progress towards badge
    let progressPercent = 0;
    let description = '';

    switch (rule.code) {
      case 'PIONEER':
        const pioneerProgress = Math.min(100, 
          (progress.active_days / 3) * 40 + 
          (progress.voice_previews > 0 ? 30 : 0) + 
          (progress.holoflower_sets > 0 ? 30 : 0)
        );
        progressPercent = pioneerProgress;
        description = `${progress.active_days}/3 active days, voice: ${progress.voice_previews > 0 ? '✓' : '✗'}, holoflower: ${progress.holoflower_sets > 0 ? '✓' : '✗'}`;
        break;

      case 'PATHFINDER':
        progressPercent = Math.min(100, (progress.active_days / 7) * 100);
        description = `${progress.active_days}/7 active days`;
        break;

      case 'MIRROR_MAKER':
        progressPercent = Math.min(100, (progress.holoflower_sets / 3) * 100);
        description = `${progress.holoflower_sets}/3 holoflower adjustments`;
        break;

      case 'VOICE_VOYAGER':
        progressPercent = Math.min(100, (progress.voice_previews / 2) * 100);
        description = `${progress.voice_previews}/2 voice interactions`;
        break;

      case 'FEEDBACK_FRIEND':
        progressPercent = Math.min(100, (progress.feedbacks / 3) * 100);
        description = `${progress.feedbacks}/3 feedback submissions`;
        break;

      default:
        progressPercent = 0;
        description = 'Progress tracked automatically';
    }

    progressData.push({
      code: rule.code,
      name: rule.name,
      progressPercent,
      description,
      completed: false
    });
  }

  return progressData;
}