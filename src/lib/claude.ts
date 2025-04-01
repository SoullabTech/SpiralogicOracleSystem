import { z } from 'zod';
import type { Message } from '../types';

const ResponseSchema = z.object({
  content: z.array(z.object({
    text: z.string()
  }))
});

export class ClaudeClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiKey: string, apiUrl = 'http://localhost:3001/api/anthropic') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async chat(content: string, context?: {
    element?: string;
    phase?: string;
    archetype?: string;
    focusAreas?: string[];
  }): Promise<Message> {
    try {
      const systemPrompt = this.generateSystemPrompt(context);

      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240307',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const validatedResponse = ResponseSchema.parse(data);
      const responseContent = validatedResponse.content[0].text;

      const { element, insightType } = this.analyzeResponse(responseContent);

      return {
        id: Date.now().toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        model: 'claude-3-sonnet',
        element,
        insight_type: insightType,
        context
      };
    } catch (error) {
      console.error('Error in Claude chat:', error);
      throw error;
    }
  }

  private generateSystemPrompt(context?: any): string {
    let prompt = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework.

Core Principles:
1. Provide transformative guidance aligned with the user's current phase and element
2. Maintain consistency in your archetypal approach
3. Balance practical advice with spiritual wisdom
4. Adapt your communication style to match the user's needs`;

    if (context) {
      prompt += `\n\nContext for this interaction:
- Element: ${context.element || 'Not determined'}
- Phase: ${context.phase || 'Initial exploration'}
- Archetype: ${context.archetype || 'Exploring'}
- Focus Areas: ${context.focusAreas?.join(', ') || 'General growth'}`;
    }

    return prompt;
  }

  private analyzeResponse(content: string): { element: any, insightType: any } {
    const elementPatterns = {
      fire: ['vision', 'transform', 'passion', 'action', 'motivation'],
      water: ['feel', 'emotion', 'intuition', 'flow', 'depth'],
      earth: ['ground', 'practical', 'stable', 'material', 'physical'],
      air: ['think', 'connect', 'communicate', 'learn', 'understand'],
      aether: ['integrate', 'whole', 'transcend', 'spirit', 'unity']
    };

    const insightPatterns = {
      reflection: ['reflect', 'notice', 'observe', 'awareness'],
      challenge: ['challenge', 'growth', 'stretch', 'overcome'],
      guidance: ['suggest', 'try', 'practice', 'implement'],
      integration: ['combine', 'synthesize', 'integrate', 'merge']
    };

    let element = null;
    let insightType = null;

    for (const [elem, patterns] of Object.entries(elementPatterns)) {
      if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
        element = elem;
        break;
      }
    }

    for (const [type, patterns] of Object.entries(insightPatterns)) {
      if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
        insightType = type;
        break;
      }
    }

    return { element, insightType };
  }

  async loadClient(clientName: string): Promise<Message> {
    return {
      id: Date.now().toString(),
      content: `Client "${clientName}" loaded. They are currently in the exploration phase with fire as their dominant element. How would you like to proceed with their journey?`,
      role: 'assistant',
      timestamp: new Date(),
    };
  }

  async bypassChat(content: string, context?: any): Promise<Message> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240307',
          max_tokens: 2000,
          system: `You are a helpful assistant for ${context?.client_name || 'the user'}.`,
          messages: [{ role: 'user', content }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const validatedResponse = ResponseSchema.parse(data);
      const responseContent = validatedResponse.content[0].text;

      return {
        id: Date.now().toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        model: 'claude-3-sonnet',
      };
    } catch (error) {
      console.error('Error in bypass chat:', error);
      return {
        id: Date.now().toString(),
        content: 'Error in bypass mode. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  }
}