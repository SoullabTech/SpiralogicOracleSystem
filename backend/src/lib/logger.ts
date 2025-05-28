// src/lib/logger.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Logs a message from any intelligent agent (e.g., GuideAgent, ShadowAgent).
 */
export async function logAgentInteraction({
  userId,
  agent,
  content,
  phase,
}: {
  userId: string;
  agent: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from('adjuster_logs').insert({
    user_id: userId,
    agent,
    message: content,
    spiral_phase: phase || null,
  });

  if (error) {
    console.error('❌ Logger (agent) error:', error);
  }
}

/**
 * Logs a journal entry with optional emotion tagging and symbolic extraction.
 */
export async function logJournalEntry({
  userId,
  content,
  emotionTag,
  symbols,
}: {
  userId: string;
  content: string;
  emotionTag?: string;
  symbols?: string[];
}) {
  const { error } = await supabase.from('memory_items').insert({
    user_id: userId,
    content,
    emotion_tag: emotionTag || null,
    symbols: symbols || [],
  });

  if (error) {
    console.error('❌ Journal logging error:', error);
  }
}

/**
 * Logs a system-generated insight or reflection from the Adjuster Agent.
 */
export async function logAdjusterInsight({
  userId,
  content,
  phase,
}: {
  userId: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from('adjuster_logs').insert({
    user_id: userId,
    agent: 'AdjusterAgent',
    message: content,
    spiral_phase: phase || null,
  });

  if (error) {
    console.error('❌ Adjuster insight logging error:', error);
  }
}
