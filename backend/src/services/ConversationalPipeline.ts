/**
 * Conversational Pipeline - Sesame/Maya Centric Intelligence
 * Upstream models draft → Sesame CI shapes → Maya TTS voices
 * Maintains conversational authenticity and cost efficiency
 */

import { logger } from '../utils/logger';
import { routeToModel } from './ElementalIntelligenceRouter';
import { safetyService } from './SafetyModerationService';
import { getMayaMode, MAYA_FEATURES } from '../config/mayaMode';
import { MAYA_PROMPT_BETA, getMayaBetaFallback } from '../prompts/mayaPrompt.beta';
import { MAYA_PROMPT_FULL } from '../prompts/mayaPrompt.full';
import { sesameTTS } from './SesameTTS';
import { MemoryOrchestrator } from './MemoryOrchestrator';
import { ttsOrchestrator } from './TTSOrchestrator';
// import { FileMemoryIntegration } from '../../../lib/services/FileMemoryIntegration'; // Temporarily disabled
import axios from 'axios';

// Context type for pipeline
export interface ConversationalContext {
  userText: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  sentiment: "low" | "neutral" | "high";
  element: "air" | "fire" | "water" | "earth" | "aether";
  voiceEnabled: boolean;
  userId: string;
  sessionId: string;
  // Legacy fields for backward compatibility
  convoSummary?: string;
  longMemSnippets?: string[];
  recentBotReplies?: string[];
}

// Pipeline result
export interface ConversationalResult {
  text: string;
  audioUrl: string | null;
  element: string;
  processingTime: number;
  source: 'sesame_shaped' | 'fallback';
  citations?: {
    fileId: string;
    fileName: string;
    category?: string;
    pageNumber?: number;
    sectionTitle?: string;
    sectionLevel?: number;
    preview: string;
    relevance: number;
    chunkIndex: number;
  }[];
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
  private memoryOrchestrator: MemoryOrchestrator;
  // private fileMemory: FileMemoryIntegration; // Temporarily disabled

  constructor(dependencies?: { supabase?: any; vectorSearch?: any }) {
    this.memoryOrchestrator = new MemoryOrchestrator(dependencies);
    // this.fileMemory = new FileMemoryIntegration(); // Temporarily disabled
  }

  /**
   * Main conversational pipeline entry point
   */
  async converseViaSesame(ctx: ConversationalContext): Promise<ConversationalResult> {
    const startTime = Date.now();
    let reshapeCount = 0;

    try {
      // Step 0: Build comprehensive memory context - MUST ALWAYS HAPPEN
      let memoryContext;
      try {
        memoryContext = await this.memoryOrchestrator.buildContext(
          ctx.userId,
          ctx.userText,
          ctx.sessionId,
          ctx.conversationHistory
        );
        
        // Debug memory loading if enabled
        if (process.env.MAYA_DEBUG_MEMORY === 'true') {
          console.log('[Memory Debug] Context loaded:', {
            sessionEntries: memoryContext.session?.length || 0,
            journalEntries: memoryContext.journal?.length || 0,
            profileLoaded: !!memoryContext.profile,
            symbolicPatterns: memoryContext.symbolic?.length || 0,
            externalContent: memoryContext.external?.length || 0,
            totalContextSize: JSON.stringify(memoryContext).length,
            processingTime: Date.now() - startTime
          });
        }
        
      } catch (memoryError) {
        console.warn('[ConversationalPipeline] Memory orchestration failed, using fallback context:', memoryError.message);
        logger.error('Memory orchestration failed:', memoryError);
        
        // Provide minimal fallback context - never skip memory injection completely
        memoryContext = {
          session: [],
          journal: [],
          profile: {},
          symbolic: [],
          external: []
        };
      }

      // Step 0.5: Fetch relevant files from user's library for citations
      let fileContexts: any[] = [];
      let citations: any[] = [];
      try {
        // fileContexts = await this.fileMemory.retrieveRelevantFiles(
        //   ctx.userId, 
        //   ctx.userText, 
        //   { limit: 3, minRelevance: 0.75 }
        // ); // Temporarily disabled
        
        if (fileContexts.length > 0) {
          // citations = this.fileMemory.formatCitationMetadata(fileContexts); // Temporarily disabled
          logger.info('File contexts integrated for citations', {
            userId: ctx.userId,
            filesReferenced: fileContexts.length,
            citationsGenerated: citations.length
          });
        }
      } catch (fileError) {
        logger.warn('File memory integration failed:', fileError);
        fileContexts = [];
        citations = [];
      }

      // Step 1: Draft with upstream model using full memory context + file context
      let draft = await this.draftTextWithMemory(ctx, memoryContext, fileContexts);
      let draftModel = this.getDraftModelName(ctx.element);

      // Step 2: Anti-canned guard - reshape if needed
      const recentReplies = ctx.recentBotReplies || ctx.conversationHistory
        .filter(turn => turn.role === 'assistant')
        .slice(-3)
        .map(turn => turn.content);
      
      if (this.rejectBoilerplate(draft) || this.tooSimilar(draft, recentReplies)) {
        logger.info(`Reshaping response for Maya tone for user ${ctx.userId}`);
        draft = await this.redraftWithFreshness(ctx, draft, memoryContext);
        reshapeCount = 1;
        
        // If still generic, use Maya fallback
        if (this.rejectBoilerplate(draft)) {
          draft = getMayaBetaFallback();
        }
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
        const ttsResult = await ttsOrchestrator.generateSpeech(finalForVoice, "maya", {
          userId: ctx.userId,
          sessionId: ctx.sessionId
        });
        audioUrl = ttsResult.audioUrl || null;
        ttsSeconds = (Date.now() - ttsStart) / 1000;
        
        logger.debug('TTS generated', {
          service: ttsResult.service,
          cached: ttsResult.cached,
          processingTime: ttsResult.processingTime
        });
      }

      const processingTime = Date.now() - startTime;

      // Persist conversation turn to user's memory
      await this.memoryOrchestrator.persistConversationTurn(
        ctx.userId,
        ctx.userText,
        finalForVoice,
        ctx.sessionId,
        {
          element: ctx.element,
          sentiment: ctx.sentiment,
          processingTime,
          voiceSynthesized: audioUrl !== null
        }
      ).catch(error => {
        logger.warn('Memory persistence failed (non-critical):', error);
      });

      return {
        text: finalForVoice,
        audioUrl,
        element: ctx.element,
        processingTime,
        source: 'sesame_shaped',
        citations,
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
      
      // Use Maya fallback instead of generic response
      const fallbackText = getMayaBetaFallback();
      
      return {
        text: fallbackText,
        audioUrl: null,
        element: ctx.element,
        processingTime: Date.now() - startTime,
        source: 'fallback',
        citations: [],
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
   * Draft text using Maya prompts (beta or full mode)
   */
  private async draftText(ctx: ConversationalContext): Promise<string> {
    const plan = this.planTurn(ctx);
    
    // Determine which Maya mode to use (could be user-specific later)
    const mayaMode = getMayaMode();
    const mayaPrompt = mayaMode === 'beta' ? MAYA_PROMPT_BETA : MAYA_PROMPT_FULL;
    
    const system = [
      mayaPrompt,
      "",
      "Context for this conversation:",
      ...plan.contentConstraints.map(c => `- ${c}`),
      ctx.convoSummary ? `Recent discussion: ${ctx.convoSummary}` : "",
      ctx.longMemSnippets.length ? `Relevant context: ${ctx.longMemSnippets.slice(0, 3).join(", ")}` : "",
      "",
      mayaMode === 'beta' 
        ? "Respond as Maya - thoughtful, mature, and present."
        : "Draw from your full understanding to guide this person."
    ].join("\n");

    const user = ctx.userText;

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
   * Format text for Maya with light prosody hints
   */
  private formatForMaya(text: string, opts: { pace?: "calm" | "neutral" | "brisk" } = {}): string {
    // Add null/undefined check
    if (!text || typeof text !== 'string') {
      console.warn('[formatForMaya] Invalid text input:', text);
      return '';
    }
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
    // Add null/undefined check
    if (!text || typeof text !== 'string') {
      console.warn('[sesameCITransform] Invalid text input:', text);
      return text || '';
    }
    
    try {
      // Use SESAME_URL instead of SESAME_CI_URL
      const sesameBaseUrl = process.env.SESAME_URL || 'http://localhost:8000';
      const response = await axios.post(`${sesameBaseUrl}/ci/shape`, {
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
            // Use SesameTTS service with prosody preservation
            const audioUrl = await sesameTTS.synthesize(truncatedText, {
              voice: opts.voice || 'maya'
            });
            
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
    // Type safety check
    if (!text || typeof text !== 'string') {
      logger.warn('shouldSynthesize received invalid text:', { text, type: typeof text });
      return false; // Don't synthesize invalid text
    }
    return text.length >= 5 && text.length <= 1000 && !text.includes('[');
  }

  /**
   * Detect boilerplate phrases
   */
  private rejectBoilerplate(text: string): boolean {
    // Type safety check - ensure we have a valid string
    if (!text || typeof text !== 'string') {
      logger.warn('rejectBoilerplate received invalid text:', { text, type: typeof text });
      return true; // Reject non-string responses as boilerplate
    }
    
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
   * Process streaming message - returns a stream of text chunks
   */
  async processStreamingMessage(params: any): Promise<any> {
    const { userText, element = 'aether', userId, sessionId, threadId, metadata = {} } = params;
    
    try {
      // Build memory context first
      const memoryContext = await this.memoryOrchestrator.buildContext({
        userId,
        userText,
        sessionId,
        threadId
      });

      // Create context object
      const ctx: ConversationalContext = {
        userText,
        conversationHistory: memoryContext.conversationHistory || [],
        sentiment: 'neutral',
        element: element as any,
        voiceEnabled: metadata.enableVoice || false,
        userId,
        sessionId
      };

      // Use streaming model if available
      const model = routeToModel(element);
      
      if (!model || !model.generateStreamingResponse) {
        // Fallback to non-streaming
        const result = await this.converseViaSesame(ctx);
        return {
          stream: null,
          text: result.text,
          metadata: result.metadata
        };
      }

      // Generate streaming response
      const mayaMode = getMayaMode();
      const systemPrompt = mayaMode === 'full' ? MAYA_PROMPT_FULL : MAYA_PROMPT_BETA;
      const memoryPrompt = this.memoryOrchestrator.formatForPrompt(memoryContext);
      
      const fullPrompt = `${systemPrompt}

${memoryPrompt}

Current User Message: ${userText}

Respond as Maya with appropriate depth and memory integration.`;

      const stream = await model.generateStreamingResponse({
        messages: [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      // Store conversation after streaming completes
      if (memoryContext) {
        setTimeout(async () => {
          try {
            await this.memoryOrchestrator.storeConversation({
              userId,
              sessionId,
              threadId,
              userMessage: userText,
              assistantResponse: '', // Will be accumulated from stream
              element,
              metadata
            });
          } catch (error) {
            logger.error('Failed to store streaming conversation:', error);
          }
        }, 5000);
      }

      return {
        stream,
        metadata: {
          model: model.name || 'maya-streaming',
          element,
          sessionId,
          userId
        }
      };

    } catch (error) {
      logger.error('Streaming message processing failed:', error);
      throw error;
    }
  }

  /**
   * Process non-streaming message (for backward compatibility)
   */
  async processMessage(params: any): Promise<any> {
    const { userText, element = 'aether', userId, sessionId, metadata = {} } = params;
    
    const ctx: ConversationalContext = {
      userText,
      conversationHistory: [],
      sentiment: 'neutral',
      element: element as any,
      voiceEnabled: metadata.enableVoice || false,
      userId,
      sessionId
    };

    const result = await this.converseViaSesame(ctx);
    return {
      text: result.text,
      element: result.element,
      metadata: result.metadata
    };
  }

  /**
   * Draft text using memory-enhanced context
   */
  private async draftTextWithMemory(ctx: ConversationalContext, memoryContext: any, fileContexts?: any[]): Promise<string> {
    const mayaMode = getMayaMode();
    const systemPrompt = mayaMode === 'full' ? MAYA_PROMPT_FULL : MAYA_PROMPT_BETA;
    
    // Format memory context for prompt injection - ALWAYS called
    const memoryPrompt = this.memoryOrchestrator.formatForPrompt(memoryContext);
    
    // Format file contexts if available
    let filePrompt = '';
    if (fileContexts && fileContexts.length > 0) {
      const fileReferences = fileContexts.map(file => 
        `File: ${file.fileName} (${file.category || 'uncategorized'})\nContent: ${file.content}`
      ).join('\n\n');
      filePrompt = `\nRelevant files from user's library:\n${fileReferences}\n`;
    }
    
    const fullPrompt = `${systemPrompt}

${memoryPrompt}${filePrompt}

Current User Message: ${ctx.userText}

Respond as Maya with appropriate depth, memory integration, and reference to uploaded files when relevant.`;

    // Ensure we have just the element string, not the whole context
    const element = typeof ctx.element === 'string' ? ctx.element : 'aether';
    logger.debug('draftTextWithMemory routing to element:', { element, ctxElement: ctx.element });
    
    const model = routeToModel(element);
    const response = await model.generateResponse({
      system: "You are Maya, a wise and empathetic AI companion.",
      user: fullPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    return response?.content?.trim() || getMayaBetaFallback();
  }

  /**
   * Redraft with memory context for freshness
   */
  private async redraftWithFreshness(
    ctx: ConversationalContext, 
    previousDraft: string, 
    memoryContext?: any
  ): Promise<string> {
    const freshPrompt = `The previous response was too generic: "${previousDraft}"

Given the user's message: "${ctx.userText}"
${memoryContext ? `\nMemory Context:\n${this.memoryOrchestrator.formatForPrompt(memoryContext)}` : ''}

Generate a more specific, personalized Maya response that:
- References specific details from the user's context
- Avoids generic phrases
- Shows genuine understanding
- Asks a thoughtful question if appropriate

Respond naturally as Maya:`;

    // Ensure we have just the element string, not the whole context
    const element = typeof ctx.element === 'string' ? ctx.element : 'aether';
    logger.debug('redraftWithFreshness routing to element:', { element, ctxElement: ctx.element });
    
    const model = routeToModel(element);
    const response = await model.generateResponse({
      system: "You are Maya, a wise and empathetic AI companion.",
      user: freshPrompt,
      temperature: 0.7,
      maxTokens: 300
    });

    return response?.content?.trim() || getMayaBetaFallback();
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

      // CRITICAL FIX: Build comprehensive memory context BEFORE streaming
      let memoryContext;
      try {
        memoryContext = await this.memoryOrchestrator.buildContext(
          ctx.userId,
          ctx.userText,
          ctx.sessionId,
          ctx.conversationHistory
        );
        
        // Debug memory loading if enabled
        if (process.env.MAYA_DEBUG_MEMORY === 'true') {
          console.log('[Stream Memory Debug] Context loaded:', {
            sessionEntries: memoryContext.session?.length || 0,
            journalEntries: memoryContext.journal?.length || 0,
            profileLoaded: !!memoryContext.profile,
            symbolicPatterns: memoryContext.symbolic?.length || 0,
            externalContent: memoryContext.external?.length || 0,
            totalContextSize: JSON.stringify(memoryContext).length,
            processingTime: Date.now() - startTime
          });
        }
        
      } catch (memoryError) {
        console.warn('[StreamResponse] Memory orchestration failed, using fallback context:', memoryError.message);
        logger.error('Stream memory orchestration failed:', memoryError);
        
        // Provide minimal fallback context - never skip memory injection completely
        memoryContext = {
          session: [],
          journal: [],
          profile: {},
          symbolic: [],
          external: []
        };
      }

      // Send element routing notification
      callbacks.onElement({
        element: ctx.element,
        model: ctx.element === 'air' ? 'claude-3-sonnet' : 'elemental-oracle-2.0',
        status: 'routing'
      });

      // Route to appropriate elemental intelligence with streaming (now with memory context)
      const draftResponse = await routeToModelStreaming({
        ...ctx,
        memoryContext // Pass memory context to streaming router
      }, {
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

      // CRITICAL FIX: Persist conversation turn to user's memory (matches converseViaSesame behavior)
      try {
        await this.memoryOrchestrator.persistConversationTurn(
          ctx.userId,
          ctx.userText,
          shapedText,
          ctx.sessionId,
          {
            element: ctx.element,
            processingTime: Math.round(processingTime),
            hasVoice: !!audioUrl,
            source: 'streaming_pipeline'
          }
        );
      } catch (persistError) {
        logger.warn('Failed to persist conversation turn for streaming response:', persistError);
      }

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