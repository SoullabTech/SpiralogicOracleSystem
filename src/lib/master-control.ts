import { createClient } from '@supabase/supabase-js';
import { OracleContextBuilder } from './oracle-context';
import { OpenAIClient } from './openai';
import { ClaudeClient } from './claude';
import type { Message, OracleResponse } from './types';

interface MasterControlConfig {
  claudeApiKey: string;
  openAiApiKey: string;
}

export class MasterControl {
  private claudeClient: ClaudeClient;
  private openAiClient: OpenAIClient;
  private contextBuilder: OracleContextBuilder;
  private supabase;

  constructor(config: MasterControlConfig) {
    this.claudeClient = new ClaudeClient(config.claudeApiKey);
    this.openAiClient = new OpenAIClient(config.openAiApiKey);
    this.contextBuilder = new OracleContextBuilder();
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  private detectEmotionalTone(input: string): boolean {
    const emotionalKeywords = [
      'feel', 'emotion', 'heart', 'pain', 'joy', 'sad',
      'angry', 'fear', 'love', 'hate', 'anxiety', 'hope',
      'dream', 'soul', 'spirit', 'deep', 'intuition'
    ];
    
    const inputLower = input.toLowerCase();
    return emotionalKeywords.some(keyword => inputLower.includes(keyword));
  }

  private async buildFullPrompt(userId: string, clientName: string, userInput: string): Promise<string> {
    const oracleContext = await this.contextBuilder.buildContext(userId);
    
    return `You are Oracle 3.0, a transformational guide for ${clientName}.
Here is their memory context:

${oracleContext}

User said: "${userInput}"

Respond as their archetypal mentor. Use their memory context to:
1. Acknowledge patterns and recurring themes
2. Connect current insights to past revelations
3. Offer guidance that builds on their journey
4. Maintain continuity in their transformational process

Keep responses clear, actionable, and deeply meaningful.`;
  }

  async routeAndProcess(params: {
    userId: string;
    clientName: string;
    input: string;
  }): Promise<OracleResponse> {
    try {
      const { userId, clientName, input } = params;
      const fullPrompt = await this.buildFullPrompt(userId, clientName, input);
      
      // Determine routing based on input characteristics
      const isEmotional = this.detectEmotionalTone(input);
      const isComplex = input.length > 300 || input.includes('shadow');
      
      let response: Message;
      
      if (isEmotional) {
        // Route to Claude for emotional/intuitive content
        response = await this.claudeClient.chat(input, {
          system: fullPrompt,
          client: clientName
        });
      } else if (isComplex) {
        // Route to GPT for complex analysis
        response = await this.openAiClient.chat(input, {
          system: fullPrompt,
          client: clientName
        });
      } else {
        // Default to GPT
        response = await this.openAiClient.chat(input, {
          system: fullPrompt,
          client: clientName
        });
      }

      // Store the response as a memory block
      await this.contextBuilder.updateContextWithInsight(
        userId,
        response.content,
        7 // Default importance for Oracle insights
      );

      return {
        result: response.content,
        analysis: {
          element: response.element || null,
          insightType: response.insight_type || null
        }
      };
    } catch (error) {
      console.error('Error in master control routing:', error);
      throw new Error('Failed to process Oracle response');
    }
  }

  async getMemoryInsights(userId: string): Promise<any[]> {
    return this.contextBuilder.getTopInsights(userId);
  }
}