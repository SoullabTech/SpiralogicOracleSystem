/**
 * Conversational Pipeline - Sesame/Maya Centric Intelligence
 * Upstream models draft → Sesame CI shapes → Maya TTS voices
 * Maintains conversational authenticity and cost efficiency
 */

import { logger } from '../utils/logger';
import { routeToModel, routeToModelStreaming } from './ElementalIntelligenceRouter';
import { safetyService } from './SafetyModerationService';
import axios from 'axios';

// Context type for pipeline
export interface ConversationalContext {
  userText: string;
  convoSummary: string;
  longMemSnippets: string[];
  recentBotReplies: string[];
  sentiment: "low" | "neutral" | "high";
  element: "air" | "fire" | "water" | "earth" | "aether";
  voiceEnabled: boolean;
  userId: string;
  sessionId?: string;
}

// Pipeline result
export interface ConversationalResult {
  text: string;
  audioUrl: string | null;
  element: string;
  processingTime: number;
  source: 'sesame_shaped' | 'fallback';
  metadata: {
    draftModel: string;
    reshapeCount: number;
    voiceSynthesized: boolean;
    cost: {
      draftTokens: number;
      ttsSeconds?: number;
    };
  };
}

// Response planning
interface ResponsePlan {
  contentConstraints: string[];
  voiceDirectives: string[];
  expectedLength: 'short' | 'medium' | 'long';
  emotionalGoal: string;
}

// Anti-canned detection
const BOILERPLATE_PHRASES = [
  "I understand",
  "I'm here to help",
  "That's a great question",
  "I appreciate you sharing",
  "Thank you for reaching out",
  "I'm sorry to hear",
  "It sounds like",
  "I can imagine",
  "That makes sense",
  "I hear you saying"
];

const GENERIC_PATTERNS = [
  /I'm (here|available) to .*/i,
  /feel free to .*/i,
  /please don't hesitate to .*/i,
  /is there anything else .*/i,
  /(remember|keep in mind) that .*/i
];

export class ConversationalPipeline {
  private recentAudioCache = new Map<string, string>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Main conversational pipeline entry point
   */
  async converseViaSesame(ctx: ConversationalContext): Promise<ConversationalResult> {
    const startTime = Date.now();
    let reshapeCount = 0;

    try {
      // Step 1: Draft with upstream model (not final)
      let draft = await this.draftText(ctx);
      let draftModel = this.getDraftModelName(ctx.element);

      // Step 2: Anti-canned guard - reshape if needed
      if (this.rejectBoilerplate(draft) || this.tooSimilar(draft, ctx.recentBotReplies)) {
        logger.info(`Reshaping canned response for user ${ctx.userId}`);
        draft = await this.redraftWithFreshness(ctx, draft);
        reshapeCount = 1;
      }

      // Step 3: Format for Maya with prosody hints
      const hinted = this.formatForMaya(draft, {
        pace: ctx.sentiment === "low" ? "calm" : "neutral"
      });

      // Step 4: Sesame CI shapes the final utterance
      const finalForVoice = await this.sesameCITransform(hinted, {
        element: ctx.element,
        sentiment: ctx.sentiment,
        goals: this.getConversationalGoals(ctx)
      });

      // Step 5: Maya TTS (only if voice enabled and meets criteria)
      let audioUrl: string | null = null;
      let ttsSeconds = 0;

      if (ctx.voiceEnabled && this.shouldSynthesize(finalForVoice)) {
        const ttsStart = Date.now();
        audioUrl = await this.mayaTTS(finalForVoice, {
          userId: ctx.userId,
          voice: "maya"
        });
        ttsSeconds = (Date.now() - ttsStart) / 1000;
      }

      const processingTime = Date.now() - startTime;

      return {
        text: finalForVoice,
        audioUrl,
        element: ctx.element,
        processingTime,
        source: 'sesame_shaped',
        metadata: {
          draftModel,
          reshapeCount,
          voiceSynthesized: audioUrl !== null,
          cost: {
            draftTokens: this.estimateTokens(draft),
            ttsSeconds: ttsSeconds > 0 ? ttsSeconds : undefined
          }
        }
      };

    } catch (error) {
      logger.error('Conversational pipeline error:', error);
      
      // Fallback to simple response
      return {
        text: "I'm taking a moment to gather my thoughts. What would you like to explore together?",
        audioUrl: null,
        element: ctx.element,
        processingTime: Date.now() - startTime,
        source: 'fallback',
        metadata: {
          draftModel: 'fallback',
          reshapeCount: 0,
          voiceSynthesized: false,
          cost: { draftTokens: 0 }
        }
      };
    }
  }

  /**
   * Draft text using upstream model
   */
  private async draftText(ctx: ConversationalContext): Promise<string> {
    const plan = this.planTurn(ctx);
    const tone = this.toneInstruction(ctx.userText, ctx.sentiment);

    const system = [
      "You are Maya (conversational intelligence).",
      "Use concrete, situation-specific guidance from context & memory.",
      ...plan.contentConstraints.map(c => `Constraint: ${c}`),
      `Tone: ${tone}`,
      ...plan.voiceDirectives.map(v => `Voice: ${v}`),
      "Avoid boilerplate and meta-AI talk.",
      "Speak naturally as if continuing a conversation with someone you know."
    ].join("\n");

    const user = [
      `User: ${ctx.userText}`,
      ctx.convoSummary ? `Context: ${ctx.convoSummary}` : "",
      ctx.longMemSnippets.length ? `Memory:\n- ${ctx.longMemSnippets.slice(0, 3).join("\n- ")}` : ""
    ].join("\n");

    // Route to appropriate upstream model for drafting
    const model = routeToModel(ctx.element);
    const response = await model.generateResponse({
      system,
      user,
      temperature: 0.6,
      maxTokens: 300
    });

    return response.content.trim();
  }

  /**
   * Redraft with emphasis on freshness
   */
  private async redraftWithFreshness(ctx: ConversationalContext, originalDraft: string): Promise<string> {
    const system = [
      "Rephrase with fresh structure; no generic phrases.",
      "Use specific, contextual language that reflects the user's actual situation.",
      "Draw from memory snippets for concrete, personal responses.",
      "Avoid: 'I understand', 'I'm here to help', 'That makes sense', etc."
    ].join("\n");

    const user = `Redraft this response with fresh language and specific context:\n\nOriginal: ${originalDraft}\n\nUser context: ${ctx.userText}\nMemory: ${ctx.longMemSnippets.slice(0, 2).join(", ")}`;

    const model = routeToModel(ctx.element);
    const response = await model.generateResponse({
      system,
      user,
      temperature: 0.7,
      maxTokens: 300
    });
    return response.content;
  }

  /**
   * Format text for Maya with light prosody hints
   */
  private formatForMaya(text: string, opts: { pace?: "calm" | "neutral" | "brisk" } = {}): string {
    let out = text.trim();

    // Light prosody hints Maya understands (keep it minimal & natural)
    out = out
      .replace(/\.\s+/g, ". <pause-200ms> ")
      .replace(/:\s+/g, ": <pause-150ms> ")
      .replace(/\?\s+/g, "? <pause-250ms> ")
      .replace(/!\s+/g, "! <pause-200ms> ");

    // Pace adjustments
    if (opts.pace === "calm") out = "<pace-slow>" + out + "</pace-slow>";
    if (opts.pace === "brisk") out = "<pace-fast>" + out + "</pace-fast>";

    // Mild emphasis for key phrases (Sesame-safe markers)
    out = out.replace(/\*\*(.+?)\*\*/g, "<em>$1</em>");

    return out;
  }

  /**
   * Sesame CI transformation
   */
  private async sesameCITransform(text: string, meta: {
    element: string;
    sentiment: string;
    goals: string[];
  }): Promise<string> {
    try {
      const response = await axios.post(`${process.env.SESAME_CI_URL}/ci/shape`, {
        text,
        meta
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SESAME_TOKEN}`
        },
        timeout: 5000
      });

      return response.data.text || text;
    } catch (error) {
      logger.warn('Sesame CI transformation failed, using draft:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Maya TTS synthesis with cost controls
   */
  private async mayaTTS(text: string, opts: { userId: string; voice?: string; seed?: number }): Promise<string | null> {
    try {
      // Cost control: truncate to 1000 chars
      const truncatedText = text.length > 1000 ? text.slice(0, 997) + "..." : text;

      // Check cache first
      const cacheKey = `${opts.userId}_${truncatedText.slice(0, 100)}`;
      if (this.recentAudioCache.has(cacheKey)) {
        return this.recentAudioCache.get(cacheKey)!;
      }

      // Debounce: clear existing timer for this user
      const existingTimer = this.debounceTimers.get(opts.userId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set debounce timer
      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          try {
            const response = await axios.post(`${process.env.SESAME_TTS_URL}/tts`, {
              text: truncatedText,
              voice: opts.voice ?? "maya",
              seed: opts.seed
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SESAME_TOKEN}`
              },
              timeout: 10000 // 10s timeout with fallback
            });

            const audioUrl = response.data.audioUrl;
            
            // Cache for 5 minutes
            if (audioUrl) {
              this.recentAudioCache.set(cacheKey, audioUrl);
              setTimeout(() => this.recentAudioCache.delete(cacheKey), 5 * 60 * 1000);
            }

            resolve(audioUrl);
          } catch (error) {
            logger.error('Maya TTS failed:', error);
            resolve(null);
          } finally {
            this.debounceTimers.delete(opts.userId);
          }
        }, 500); // 500ms debounce

        this.debounceTimers.set(opts.userId, timer);
      });

    } catch (error) {
      logger.error('Maya TTS setup failed:', error);
      return null;
    }
  }

  /**
   * Plan response turn based on context
   */
  private planTurn(ctx: ConversationalContext): ResponsePlan {
    const constraints: string[] = [];
    const voiceDirectives: string[] = [];

    // Element-specific planning
    switch (ctx.element) {
      case 'air':
        constraints.push("Be clear and articulate", "Offer fresh perspective");
        voiceDirectives.push("Crisp and clear delivery");
        break;
      case 'water':
        constraints.push("Be emotionally attuned", "Flow with their energy");
        voiceDirectives.push("Gentle and flowing tone");
        break;
      case 'fire':
        constraints.push("Be inspiring and energizing", "Catalyze action");
        voiceDirectives.push("Dynamic and passionate delivery");
        break;
      case 'earth':
        constraints.push("Be grounding and practical", "Offer concrete guidance");
        voiceDirectives.push("Steady and reassuring tone");
        break;
      case 'aether':
        constraints.push("Be integrative and holistic", "Connect deeper patterns");
        voiceDirectives.push("Spacious and wise delivery");
        break;
    }

    // Sentiment-based adjustments
    if (ctx.sentiment === "low") {
      constraints.push("Be especially compassionate");
      voiceDirectives.push("Slower, more nurturing pace");
    }

    return {
      contentConstraints: constraints,
      voiceDirectives,
      expectedLength: ctx.userText.length > 100 ? 'long' : 'medium',
      emotionalGoal: this.getEmotionalGoal(ctx.sentiment)
    };
  }

  /**
   * Generate tone instruction
   */
  private toneInstruction(userText: string, sentiment: string): string {
    if (sentiment === "low") return "Gentle, compassionate, nurturing";
    if (sentiment === "high") return "Enthusiastic, celebratory, energizing";
    return "Warm, present, conversational";
  }

  /**
   * Get conversational goals for Sesame CI
   */
  private getConversationalGoals(ctx: ConversationalContext): string[] {
    const baseGoals = ["clarity", "authenticity"];
    
    if (ctx.sentiment === "low") baseGoals.push("comfort", "validation");
    if (ctx.element === "air") baseGoals.push("precision", "insight");
    if (ctx.element === "water") baseGoals.push("empathy", "flow");
    if (ctx.element === "fire") baseGoals.push("inspiration", "energy");
    if (ctx.element === "earth") baseGoals.push("grounding", "practical");

    return baseGoals;
  }

  /**
   * Check if text should be synthesized
   */
  private shouldSynthesize(text: string): boolean {
    return text.length >= 5 && text.length <= 1000 && !text.includes('[');
  }

  /**
   * Detect boilerplate phrases
   */
  private rejectBoilerplate(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for boilerplate phrases
    const hasBoilerplate = BOILERPLATE_PHRASES.some(phrase => 
      lowerText.includes(phrase.toLowerCase())
    );

    // Check for generic patterns
    const hasGenericPattern = GENERIC_PATTERNS.some(pattern => 
      pattern.test(text)
    );

    return hasBoilerplate || hasGenericPattern;
  }

  /**
   * Check if response is too similar to recent replies
   */
  private tooSimilar(text: string, recentReplies: string[]): boolean {
    if (recentReplies.length === 0) return false;

    const currentWords = new Set(text.toLowerCase().split(/\s+/));
    
    return recentReplies.some(reply => {
      const replyWords = new Set(reply.toLowerCase().split(/\s+/));
      const intersection = new Set([...currentWords].filter(word => replyWords.has(word)));
      const similarity = intersection.size / Math.max(currentWords.size, replyWords.size);
      return similarity > 0.7; // 70% similarity threshold
    });
  }

  /**
   * Get draft model name for logging
   */
  private getDraftModelName(element: string): string {
    return element === 'air' ? 'claude-3-sonnet' : 'gpt-4o-elemental';
  }

  /**
   * Estimate token count (rough)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimate
  }

  /**
   * Get emotional goal
   */
  private getEmotionalGoal(sentiment: string): string {
    switch (sentiment) {
      case 'low': return 'comfort_and_support';
      case 'high': return 'celebration_and_inspiration';
      default: return 'presence_and_connection';
    }
  }

  /**
   * Streaming version of conversational pipeline
   * Streams tokens in real-time for live Maya experience
   */
  async streamResponse(
    ctx: ConversationalContext,
    callbacks: {
      onToken: (token: string) => void;
      onElement: (data: any) => void;
      onComplete: (response: any) => void;
      onError: (error: any) => void;
    }
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      logger.info('🌊 Starting streaming conversational pipeline', {
        userId: ctx.userId,
        element: ctx.element,
        voiceEnabled: ctx.voiceEnabled
      });

      // Send element routing notification
      callbacks.onElement({
        element: ctx.element,
        model: ctx.element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0',
        status: 'routing'
      });

      // Route to appropriate elemental intelligence with streaming
      const draftResponse = await routeToModelStreaming(ctx, {
        streaming: true,
        onToken: callbacks.onToken
      });

      if (!draftResponse) {
        throw new Error('Failed to get response from elemental intelligence');
      }

      // Plan the response shaping
      const plan = this.planTurn(ctx);

      // Send planning notification
      callbacks.onElement({
        plan,
        status: 'shaping_response'
      });

      // For streaming, we'll use the draft response directly for now
      // Future: implement streaming Sesame reshaping
      const shapedText = draftResponse.content;

      // Synthesize voice if enabled
      let audioUrl: string | null = null;
      if (ctx.voiceEnabled && shapedText.length <= 1000) {
        callbacks.onElement({ status: 'synthesizing_voice' });
        
        // Voice synthesis temporarily disabled
        audioUrl = null;
      }

      // Calculate processing metrics
      const processingTime = performance.now() - startTime;

      const result = {
        text: shapedText,
        audioUrl,
        element: ctx.element,
        processingTime,
        source: 'streaming_pipeline',
        metadata: {
          draftModel: ctx.element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0',
          streaming: true,
          voiceSynthesized: !!audioUrl,
          cost: {
            draftTokens: draftResponse.tokens || 0,
            ttsSeconds: audioUrl ? shapedText.length / 15 : undefined
          }
        }
      };

      callbacks.onComplete(result);

      logger.info('✅ Streaming conversation completed', {
        userId: ctx.userId,
        processingTime: Math.round(processingTime),
        hasVoice: !!audioUrl,
        element: ctx.element
      });

    } catch (error) {
      logger.error('❌ Streaming conversation failed:', error);
      callbacks.onError(error);
    }
  }
}

// Export singleton instance
export const conversationalPipeline = new ConversationalPipeline();