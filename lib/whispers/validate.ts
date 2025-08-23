import { createClient } from "@/lib/supabase/server";

/**
 * Production validation utilities for whispers system
 */

export async function validateUserAccess(): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) return { valid: false, error: error.message };
    if (!user) return { valid: false, error: "No user found" };
    
    return { valid: true, userId: user.id };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

export function sanitizeWhisperForLogs(whisper: any): any {
  // Hash content for privacy - only log ID and metadata
  return {
    id: whisper.id,
    tagCount: whisper.tags?.length ?? 0,
    element: whisper.element,
    energy: whisper.energy_level,
    hasRecall: !!whisper.recall_at,
    score: whisper.score,
    reason: whisper.reason
  };
}

export function validateLimit(limit: number): number {
  if (limit > 50) {
    console.warn(`Whispers limit ${limit} too high, capping at 50`);
    return 50;
  }
  if (limit < 1) {
    return 1;
  }
  return Math.floor(limit);
}