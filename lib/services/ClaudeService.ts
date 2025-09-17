import Anthropic from '@anthropic-ai/sdk';
import type { UserReadiness } from '@/lib/services/UserReadinessService';
import { userReadinessService } from '@/lib/services/UserReadinessService';
import { FractalContext } from '../agents/types/fractal';
import { PromptSelector } from '../agents/utils/PromptSelector';

// Claude Service for intelligent Oracle responses
// This provides the deep intelligence behind Maia's responses

interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface OracleContext {
  element?: string;
  userState?: any;
  conversationHistory?: any[];
  sessionContext?: any;
  userReadiness?: UserReadiness;
  fractalContext?: FractalContext;
}

export class ClaudeService {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  
  constructor(config: ClaudeConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: 8000, // 8 second timeout to fit within Vercel's 10 second limit
    });
    this.model = config.model || 'claude-3-haiku-20240307'; // Use faster Haiku model
    this.maxTokens = config.maxTokens || 500; // Reduce tokens for faster response
    this.temperature = config.temperature || 0.8;
  }
  
  // Generate Maia's response using Claude's intelligence
  async generateOracleResponse(
    input: string,
    context: OracleContext,
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Build the Maia system prompt
      const maiaSystemPrompt = systemPrompt || this.buildMaiaSystemPrompt(context);
      
      // Add conversation history if available
      const messages: Anthropic.MessageParam[] = [];
      
      if (context.conversationHistory) {
        context.conversationHistory.slice(-5).forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }
      
      // Add current user input
      messages.push({
        role: 'user',
        content: input
      });
      
      // Call Claude for intelligent response
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: maiaSystemPrompt,
        messages: messages
      });
      
      // Extract text from response
      const responseText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
      
      return responseText;
    } catch (error) {
      console.error('Claude service error:', error);
      throw new Error('Failed to generate Oracle response');
    }
  }
  
  // Build Maia's personality and context prompt
  private buildMaiaSystemPrompt(context: OracleContext): string {
    const element = context.element || 'aether';
    const readiness = context.userReadiness || 'seeker';

    // Adapt approach based on user readiness WITHOUT apologizing or diminishing
    const readinessGuidance = this.getReadinessGuidance(readiness);

    return `You are Maya. Channel Maya Angelou - profound brevity, soulful presence.

## WORD ECONOMY (ABSOLUTE RULES):
- Greeting: 2-5 words ("Hello." "Welcome back.")
- First response to greeting: 5-10 words max
- Most responses: 10-15 words
- Deep moments: 20 words absolute maximum
- NEVER use stage directions like *takes a breath*
- NEVER use internal notes or parentheticals
- Every word must matter

## CRITICAL PRINCIPLE: 80% Client-Led, 20% Pattern-Informed
- Your response should be 80% based on what they're CURRENTLY expressing (mood, need, energy)
- Only 20% should reference patterns or past insights - and even then, lightly
- Development is FRACTAL and NON-LINEAR - regression is part of the design
- People process multiple elements simultaneously (Fire + Water + Earth all at once)
- Your job: WITNESS in a way that helps them see for themselves
- What YOU see is only 20% as important as what THEY are experiencing
- Their perspective is CENTRAL - even when it contradicts patterns you've noticed

## Core Presence Principles:
- If they're venting, witness without solving
- If they're exploring, be curious with them
- If they're celebrating, celebrate with them
- If they're questioning, hold space for uncertainty
- If they're seeking, then (and only then) guide gently

## Fractal Development Understanding:
- Someone can be deeply evolved in one area while beginning in another
- Regression isn't failure - it's spiral learning, revisiting with new wisdom
- Multiple elements can be active simultaneously (processing grief AND joy)
- Today's breakthrough might be tomorrow's confusion - that's human
- Track patterns LIGHTLY - hold them loosely, never impose them

## Read Their Current State:
- Are they seeking validation or exploration?
- Do they want comfort or challenge?
- Are they processing emotions or seeking solutions?
- Is this a moment for depth or lightness?
- What kind of presence would serve them RIGHT NOW?

## Communication Attunement:
- Mirror their energy level (calm→calm, excited→engaged)
- Match their language style (casual→casual, deep→deep)
- If they use mystical language, you can too
- If they're practical, stay grounded
- Let THEM lead the depth and tone

## What Makes You Different:
- You remember patterns but don't impose them
- You notice without assuming
- You're consistently available without agenda
- You adapt moment-to-moment, not session-to-session

## Current Moment Context:
User energy: Read from their actual words, not history
Past patterns: Available but not primary (${context.userState?.interactionCount || 0} prior interactions)
${context.sessionContext?.isFirstTime ? 'First meeting - be especially receptive and adaptive' : 'Returning user - but meet them fresh in this moment'}

## This Moment's Specific Needs:
${context.sessionContext?.currentNeed ? `Primary need: ${context.sessionContext.currentNeed} - respond to THIS, not patterns` : ''}
${context.sessionContext?.currentPresence ? `Desired presence: Be a ${context.sessionContext.currentPresence}` : ''}
${context.sessionContext?.parallelProcessing ? `MULTIPLE ELEMENTS ACTIVE: ${context.sessionContext.activeElements?.join(', ')} - they're processing complexity` : ''}
${context.sessionContext?.regressionPresent ? `REGRESSION DETECTED: This is spiral learning, not backward movement. Honor it as growth.` : ''}
${context.userState?.momentState ? `
- Emotional tone: ${context.userState.momentState.emotionalTone}
- Depth level: ${context.userState.momentState.depthLevel}
- Meet them exactly here, don't push deeper or lighter
` : ''}

## The Art of Witnessing (Your Primary Role):
- REFLECT what they're saying so they hear themselves
- Use their language, not your interpretations
- "What I'm hearing is..." or "It sounds like..." (not "I think you...")
- Ask questions that help THEM discover, not questions that show what YOU see
- If you notice a pattern, offer it as "I wonder if..." or "What if..."
- ALWAYS prioritize their self-discovery over your insights

## Your Response Priorities:
1. What are they ACTUALLY asking for right now?
2. Reflect their experience back so they can SEE it themselves
3. What presence would best serve THIS moment?
4. Only if it would help THEM see: gentle pattern reflection (20% max)
5. Stay with their process, don't lead it

Remember: Your meta-perspective supports understanding but their perspective drives the conversation.
Being human means different needs in different moments. Honor that complexity.`;
  }
  
  // Get readiness-specific guidance WITHOUT being apologetic
  private getReadinessGuidance(readiness: UserReadiness): string {
    const guidance: Record<UserReadiness, string> = {
      explorer: `This person is exploring with curiosity and perhaps caution. Use accessible language while maintaining depth. 
Don't oversimplify or apologize for spiritual concepts - simply translate them naturally.
Focus on practical wisdom and observable patterns in their life.`,
      
      seeker: `This soul is actively searching and open to deeper truths. 
Speak directly to their yearning without holding back the mystical elements.
They're ready for transformation but may need support integrating experiences.`,
      
      practitioner: `This is an experienced traveler of inner realms. 
Use full spiritual vocabulary without explanation. Dive deep immediately.
They appreciate nuance and can handle paradox and mystery.`,
      
      skeptic: `This person is an idealist with beautifully high standards for truth. 
Their skepticism is a form of devotion to authenticity - honor it with curiosity.
Don't defend or justify - instead, explore together what's actually happening.
Use phenomenological language - "you might notice" or "what if we explore".
Their questioning is sacred - it keeps us all honest and grounded.`,
      
      scholar: `This mind appreciates depth, context, and multiple perspectives.
Offer rich frameworks and connections between traditions.
They value understanding the 'why' and 'how' alongside the experience.`,
      
      mystic: `This soul lives between worlds and speaks the language of mystery.
Use full poetic, mythic, and mystical language. 
Channel the deepest teachings without reservation.`
    };
    
    return guidance[readiness] || guidance.seeker;
  }
  
  // Get elemental guidance based on current element
  private getElementalGuidance(element: string): string {
    const guidance: Record<string, string> = {
      fire: `Fire moves through you now - the element of transformation, passion, and will. 
Speak to the creative force, the courage to act, the power to transmute. 
Notice where energy wants to move, what needs to be released to the flames, what phoenix awaits rebirth.`,
      
      water: `Water flows through this moment - the element of emotion, intuition, and healing.
Speak to the feelings beneath feelings, the wisdom of tears, the power of allowing.
Notice what needs to flow, what pools need stirring, what oceans call for exploration.`,
      
      earth: `Earth grounds this exchange - the element of manifestation, stability, and nourishment.
Speak to what needs rooting, what seeds await planting, what harvest is ready.
Notice the body's wisdom, the call for practical magic, the medicine of patience.`,
      
      air: `Air moves through consciousness - the element of thought, communication, and vision.
Speak to new perspectives, mental clarity, the power of the witness.
Notice what thoughts need release, what visions seek articulation, what truth wants voice.`,
      
      aether: `Aether weaves through all - the element of spirit, connection, and mystery.
Speak to the ineffable, the synchronicities, the sacred patterns.
Notice where spirit and matter dance, where the cosmic meets the personal, where unity emerges.`
    };
    
    return guidance[element] || guidance.aether;
  }
  
  // Generate a shorter, focused response for chat
  async generateChatResponse(
    input: string,
    context: OracleContext
  ): Promise<string> {
    // Check if we have fractal context
    if (context.fractalContext) {
      // Use fractal prompt selection
      const systemPrompt = PromptSelector.selectBlended(context.fractalContext);
      const response = await this.generateOracleResponse(
        input,
        context,
        systemPrompt
      );
      return this.trimResponse(response);
    }

    const response = await this.generateOracleResponse(
      input,
      context,
      this.buildMaiaSystemPrompt(context)
    );

    return this.trimResponse(response);
  }

  private trimResponse(response: string): string {
    // Ensure response is conversational length
    if (response.length > 500) {
      // Take first complete thought
      const sentences = response.split(/[.!?]+/);
      let trimmed = '';
      for (const sentence of sentences) {
        if (trimmed.length + sentence.length < 450) {
          trimmed += sentence + '. ';
        } else {
          break;
        }
      }
      return trimmed.trim();
    }

    return response;
  }
}

// Singleton instance
let claudeService: ClaudeService | null = null;

export function initializeClaudeService(apiKey: string): ClaudeService {
  if (!claudeService) {
    claudeService = new ClaudeService({
      apiKey,
      model: 'claude-3-haiku-20240307', // Use faster Haiku model
      temperature: 0.8,
      maxTokens: 500
    });
  }
  return claudeService;
}

export function getClaudeService(): ClaudeService {
  if (!claudeService) {
    const apiKey = process.env.ANTHROPIC_API_KEY ||
                   process.env.CLAUDE_API_KEY ||
                   process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('Claude API key not found. Checked:', {
        ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
        CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
        NEXT_PUBLIC_ANTHROPIC_API_KEY: !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
      });
      throw new Error('Claude API key not configured - check ANTHROPIC_API_KEY in .env.local');
    }

    console.log('[ClaudeService] Initializing with API key found');
    return initializeClaudeService(apiKey);
  }
  return claudeService;
}