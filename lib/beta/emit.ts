// Beta Event Emitter Utility
// Lightweight helper for recording beta events from client and server

export async function emitBetaEvent(kind: string, details?: any) {
  try {
    await fetch('/api/beta/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, details })
    });
  } catch (error) {
    // Non-blocking - don't fail user interactions if beta tracking fails
    console.warn('Beta event emission failed:', error);
  }
}

// Convenience functions for common events
export const betaEmit = {
  // Core Oracle interaction
  async oracleTurn(details?: { conversationId?: string; responseLength?: number; sacredDetected?: boolean }) {
    await emitBetaEvent('oracle_turn', details);
  },

  // Voice interactions
  async voicePlay(details?: { type?: 'preview' | 'reply'; voiceId?: string; duration?: number }) {
    await emitBetaEvent('voice_play', details);
  },

  // Thread weaving
  async weaveCreated(details?: { conversationId?: string; threadCount?: number; synthesisStrength?: number }) {
    await emitBetaEvent('weave_created', details);
  },

  // Soul Memory saves
  async soulSave(details?: { conversationId?: string; soulMemoryId?: string; sacredMoment?: boolean }) {
    await emitBetaEvent('soul_save', details);
  },

  // Holoflower exploration
  async holoflowerExplore(details?: { element?: string; previousElement?: string; adjustmentMagnitude?: number }) {
    await emitBetaEvent('holoflower_explore', details);
  },

  // Shadow work handling
  async shadowSafe(details?: { conversationId?: string; shadowScore?: number; category?: string }) {
    await emitBetaEvent('shadow_safe', details);
  },

  // Feedback submission
  async adminFeedback(details?: { type?: 'bug' | 'feature' | 'experience' | 'other'; sentiment?: 'positive' | 'neutral' | 'negative' }) {
    await emitBetaEvent('admin_feedback', details);
  },

  // First-time events
  async firstConversation(details?: { conversationId?: string; onboardingComplete?: boolean }) {
    await emitBetaEvent('first_conversation', details);
  },

  // Pattern discovery
  async patternDiscovery(details?: { conversationId?: string; patternType?: string; insightLevel?: number }) {
    await emitBetaEvent('pattern_discovery', details);
  },

  // Upload events
  async uploadProcessed(details?: { uploadId?: string; fileType?: string; processingTime?: number; success?: boolean }) {
    await emitBetaEvent('upload_processed', details);
  },

  async uploadContextUsed(details?: { conversationId?: string; uploadCount?: number; mentionedExplicitly?: boolean; keywords?: string[] }) {
    await emitBetaEvent('upload_context_used', details);
  },

  async uploadReferenced(details?: { uploadId?: string; conversationId?: string; context?: string }) {
    await emitBetaEvent('upload_referenced', details);
  },

  async voiceTranscribed(details?: { uploadId?: string; duration?: number; wordCount?: number }) {
    await emitBetaEvent('voice_transcribed', details);
  },

  async documentSummarized(details?: { uploadId?: string; fileType?: string; pageCount?: number }) {
    await emitBetaEvent('document_summarized', details);
  },

  async imageDescribed(details?: { uploadId?: string; containsFace?: boolean; complexity?: 'simple' | 'moderate' | 'complex' }) {
    await emitBetaEvent('image_described', details);
  }
};

// Server-side event emission (for use in API routes)
export async function emitBetaEventServer(userId: string, kind: string, details?: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    await supabase
      .from('beta_events')
      .insert({
        user_id: userId,
        kind,
        details: details ?? {}
      });
  } catch (error) {
    console.warn('Server beta event emission failed:', error);
  }
}

// Check if user is in beta program (client-side)
export async function checkBetaStatus(): Promise<{ inBeta: boolean; status?: string; badges?: any[] }> {
  try {
    const response = await fetch('/api/beta/status');
    const data = await response.json();
    
    return {
      inBeta: data.status === 'beta',
      status: data.status,
      badges: data.badges
    };
  } catch {
    return { inBeta: false };
  }
}

// Toast notification for new badges (client-side)
export function showBadgeToast(badge: { emoji: string; name: string; description: string }) {
  // This would integrate with your existing toast system
  // For now, just console log
  console.log(`🎉 Badge earned: ${badge.emoji} ${badge.name} - ${badge.description}`);
  
  // You could dispatch a custom event here for UI components to listen to
  window.dispatchEvent(new CustomEvent('badge-earned', { 
    detail: badge 
  }));
}