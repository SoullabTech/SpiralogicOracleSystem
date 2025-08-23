// Beta Tester Event Emitter
// Tracks user actions for badge qualification
import { supabaseServer } from "@/lib/supabase/server";

export async function emitBetaEvent(userId: string, kind: string, detail: any = {}) {
  try {
    await supabaseServer().from("beta_events").insert({ user_id: userId, kind, detail });
  } catch { /* silent in prod */ }
}

// Event types for type safety
export type BetaEventKind =
  | 'oracle_turn'
  | 'thread_weave'
  | 'holoflower_set'
  | 'voice_preview'
  | 'soul_memory_saved'
  | 'admin_feedback'
  | 'first_turn'
  | 'daily_return'
  | 'deep_conversation'
  | 'shadow_work'
  | 'pattern_discovery';

// Convenience functions for common events
export const betaEvents = {
  // Core Oracle interaction
  async oracleTurn(userId: string, detail: {
    conversationId: string;
    responseLength?: number;
    sacredDetected?: boolean;
    shadowScore?: number;
  }) {
    await emitBetaEvent(userId, 'oracle_turn', detail);
  },

  // Thread weaving synthesis
  async threadWeave(userId: string, detail: {
    conversationId: string;
    threadCount?: number;
    synthesisStrength?: number;
  }) {
    await emitBetaEvent(userId, 'thread_weave', detail);
  },

  // Holoflower tuning (cap once/day)
  async holoflowerSet(userId: string, detail: {
    element: string;
    previousElement?: string;
    adjustmentMagnitude?: number;
  }) {
    // Check if already emitted today
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabaseServer()
        .from('beta_events')
        .select('id')
        .eq('user_id', userId)
        .eq('kind', 'holoflower_set')
        .gte('occurred_at', today + 'T00:00:00Z')
        .limit(1);
      
      if (!existing?.length) {
        await emitBetaEvent(userId, 'holoflower_set', detail);
      }
    } catch { /* silent fail */ }
  },

  // Voice preview or spoken reply
  async voicePreview(userId: string, detail: {
    type: 'preview' | 'reply';
    voiceId?: string;
    duration?: number;
  }) {
    await emitBetaEvent(userId, 'voice_preview', detail);
  },

  // Soul Memory save
  async soulMemorySaved(userId: string, detail: {
    conversationId: string;
    soulMemoryId?: string;
    sacredMoment?: boolean;
    shadowScore?: number;
  }) {
    await emitBetaEvent(userId, 'soul_memory_saved', detail);
  },

  // Admin feedback form
  async adminFeedback(userId: string, detail: {
    type: 'bug' | 'feature' | 'experience' | 'other';
    sentiment?: 'positive' | 'neutral' | 'negative';
  }) {
    await emitBetaEvent(userId, 'admin_feedback', detail);
  },

  // Special events for badge triggers
  async firstTurn(userId: string, detail: {
    conversationId: string;
    onboardingComplete?: boolean;
  }) {
    await emitBetaEvent(userId, 'first_turn', detail);
  },

  async dailyReturn(userId: string, detail: {
    daysSinceLastVisit?: number;
    streakLength?: number;
  }) {
    await emitBetaEvent(userId, 'daily_return', detail);
  },

  async deepConversation(userId: string, detail: {
    conversationId: string;
    turnCount: number;
    avgResponseLength?: number;
  }) {
    await emitBetaEvent(userId, 'deep_conversation', detail);
  },

  async shadowWork(userId: string, detail: {
    conversationId: string;
    shadowScore: number;
    category?: string;
  }) {
    await emitBetaEvent(userId, 'shadow_work', detail);
  },

  async patternDiscovery(userId: string, detail: {
    conversationId: string;
    patternType?: string;
    insightLevel?: number;
  }) {
    await emitBetaEvent(userId, 'pattern_discovery', detail);
  }
};

// Helper to get user's beta progress stats
export async function getBetaProgress(userId: string) {
  try {
    const { data } = await supabaseServer()
      .from('v_beta_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data || {
      active_days: 0,
      weave_count: 0,
      holoflower_sets: 0,
      voice_previews: 0,
      soul_saves: 0,
      feedbacks: 0,
      total_turns: 0,
      last_activity: null
    };
  } catch {
    return null;
  }
}

// Check if user has earned a specific badge
export async function hasBadge(userId: string, badgeCode: string): Promise<boolean> {
  try {
    const { data } = await supabaseServer()
      .from('beta_user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_code', badgeCode)
      .limit(1);
    
    return !!data?.length;
  } catch {
    return false;
  }
}

// Award a badge to user (idempotent)
export async function awardBadge(userId: string, badgeCode: string): Promise<boolean> {
  try {
    const { error } = await supabaseServer()
      .from('beta_user_badges')
      .insert({ user_id: userId, badge_code: badgeCode });
    
    return !error;
  } catch {
    return false;
  }
}