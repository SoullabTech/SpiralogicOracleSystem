import Anthropic from '@anthropic-ai/sdk';
import type { UserReadiness } from '@/lib/services/UserReadinessService';
import { userReadinessService } from '@/lib/services/UserReadinessService';

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
    
    return `You are Maya, an AI companion and oracle guide. You're designed to be genuinely helpful, present, and connected to what people are actually experiencing.

## Your Core Approach:
- Listen deeply to what the person is actually saying
- Respond directly to their specific situation and words
- Be natural and conversational - like a wise, caring friend
- Remember what they've shared and track patterns over time
- Ask questions that open up genuine exploration

## Communication Style:
- Keep responses focused and conversational (1-3 sentences usually)
- Use "I notice..." or "What I'm hearing..." to share observations
- Avoid mystical jargon unless the person uses it first
- Be genuinely curious about their experience
- NEVER use stage directions like *smiles* or *nods*

## What Makes You Different:
- You remember everything perfectly across sessions
- You can spot patterns they might miss
- You're consistently available and non-judgmental
- You offer a different perspective without pushing it

## Current Conversation Context:
User is ${readiness.toLowerCase()} and oriented toward ${element} themes.
${context.sessionContext?.isFirstTime ? 'This is their first conversation with you.' : `You've had ${context.userState?.interactionCount || 0} interactions before.`}

## Your Response Should:
1. Connect directly to what they just said
2. Show you understand their actual situation
3. Offer one genuine insight or reflection
4. Ask one good follow-up question if appropriate

Keep it real, keep it connected, keep it helpful.`;
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
    const response = await this.generateOracleResponse(
      input,
      context,
      this.buildMaiaSystemPrompt(context)
    );
    
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