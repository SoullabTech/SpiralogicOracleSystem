import { z } from 'zod';
import type { Message } from '../types';
import { backOff } from 'exponential-backoff';
import { env } from './config';

const ResponseSchema = z.object({
  content: z.array(z.object({
    text: z.string()
  }))
});

export class ClaudeClient {
  private apiKey: string;
  private proxyUrl: string;
  private history: Message[] = [];
  private systemContext: string = '';
  private maxRetries = 3;

  constructor(apiKey: string = env.VITE_CLAUDE_API_KEY, proxyUrl = '/api/anthropic') {
    if (!apiKey) {
      throw new Error('API key is required for Claude initialization');
    }
    this.apiKey = apiKey;
    this.proxyUrl = proxyUrl;
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.proxyUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  private updateSystemContext(context?: any) {
    if (!context) {
      this.systemContext = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework. 
        Help users navigate their personal transformation journey.
        Focus on providing clear, actionable guidance while maintaining empathy and understanding.`;
      return;
    }

    const { journey, preferences } = context;
    const style = preferences?.communication_style || 'direct';
    const focusAreas = preferences?.focus_areas?.join(', ') || 'general growth';

    this.systemContext = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework.
      You are working with a client in their ${journey?.current_phase || 'initial'} phase
      with ${journey?.dominant_element || 'undetermined'} as their dominant element.
      Their preferred communication style is ${style}.
      Current focus areas: ${focusAreas}.
      Archetype: ${journey?.archetype || 'exploring'}.
      Frame your guidance to honor their phase, element, and preferences using the Spiralogic framework.
      Maintain consistency in your responses and build upon previous interactions.`;
  }

  async chat(content: string, context?: any): Promise<Message> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Unable to establish connection to Claude API');
      }

      const userMessage = {
        id: Date.now().toString() + '-user',
        content,
        role: 'user',
        timestamp: new Date(),
      } as Message;
      
      this.history.push(userMessage);
      this.updateSystemContext(context);
      
      const messages = this.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await backOff(
        () => fetch(`${this.proxyUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240307',
            max_tokens: 2000,
            temperature: 0.7,
            system: this.systemContext,
            messages: messages
          })
        }),
        {
          numOfAttempts: this.maxRetries,
          startingDelay: 1000,
          timeMultiple: 2,
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const validatedResponse = ResponseSchema.parse(data);
      const responseContent = validatedResponse.content[0].text;
      const { element, insightType } = this.analyzeResponse(responseContent);
      
      const message: Message = {
        id: Date.now().toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        model: 'claude-3-sonnet',
        element,
        insight_type: insightType,
        context: {
          client: context?.client_name,
          archetype: context?.journey?.archetype,
          phase: context?.journey?.current_phase
        }
      };
      
      this.history.push(message);
      return message;
    } catch (error) {
      console.error('Error in chat method:', error);
      
      let errorMessage = 'An error occurred while processing your request.';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please check your API key.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        }
      }
      
      return {
        id: Date.now().toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  }

  private analyzeResponse(content: string): { element: string | null, insightType: string | null } {
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
    this.history = [];
    
    return {
      id: Date.now().toString(),
      content: `Client "${clientName}" loaded. They are currently in the exploration phase with fire as their dominant element. How would you like to proceed with their journey?`,
      role: 'assistant',
      timestamp: new Date(),
    };
  }

  async bypassChat(content: string, context?: any): Promise<Message> {
    try {
      const response = await backOff(
        () => fetch(`${this.proxyUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240307',
            max_tokens: 2000,
            temperature: 0.7,
            system: `You are a helpful assistant for ${context?.client_name || 'the user'}.`,
            messages: [{ role: 'user', content }]
          })
        }),
        {
          numOfAttempts: this.maxRetries,
          startingDelay: 1000,
          timeMultiple: 2
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const validatedResponse = ResponseSchema.parse(data);
      
      return {
        id: Date.now().toString(),
        content: validatedResponse.content[0].text,
        role: 'assistant',
        timestamp: new Date(),
        model: 'claude-3-sonnet',
      };
    } catch (error) {
      console.error('Error in bypass chat:', error);
      
      return {
        id: Date.now().toString(),
        content: 'An error occurred while processing your request in bypass mode.',
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  }
}