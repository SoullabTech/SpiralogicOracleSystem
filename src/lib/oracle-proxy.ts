import { Message, ClientData } from '../types';
import { z } from 'zod';
import { backOff } from 'exponential-backoff';
import { MemorySystem } from './memory';

const ResponseSchema = z.object({
  content: z.array(z.object({
    text: z.string()
  }))
});

export class OracleAIProxy {
  private apiKey: string;
  private proxyUrl: string;
  private isConnectionValid = false;
  private maxRetries = 3;
  private history: Message[] = [];
  private systemContext: string = '';
  private memorySystem: MemorySystem;

  constructor(apiKey: string, proxyUrl = 'http://localhost:3001/api/anthropic') {
    if (!apiKey) {
      throw new Error('API key is required for Oracle AI initialization');
    }
    this.apiKey = apiKey;
    this.proxyUrl = proxyUrl;
    this.memorySystem = new MemorySystem();
  }

  private async checkConnection(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    try {
      const healthCheck = await fetch(`${this.proxyUrl}/health`);
      if (!healthCheck.ok) {
        throw new Error('Proxy server is not running');
      }

      const response = await fetch(`${this.proxyUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240307',
          max_tokens: 1,
          system: 'Respond with a single character.',
          messages: [{ role: 'user', content: 'Test connection' }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      this.isConnectionValid = true;
      return true;
    } catch (error: any) {
      console.error('Connection check failed:', error);
      this.isConnectionValid = false;

      if (error.message.includes('401')) {
        throw new Error('API key is invalid or expired');
      } else if (error.message.includes('403')) {
        throw new Error('API access forbidden. Check your API key permissions');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('not running')) {
        throw new Error('Network error. Make sure the proxy server is running');
      }
      throw new Error(`Connection error: ${error.message}`);
    }
  }

  private updateSystemContext(client: ClientData | null) {
    if (!client) {
      this.systemContext = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework. 
        Help users navigate their personal transformation journey.
        Focus on providing clear, actionable guidance while maintaining empathy and understanding.`;
      return;
    }

    const relevantMemories = this.memorySystem.query({
      type: 'pattern',
      element: client.journey?.dominant_element,
      phase: client.journey?.current_phase,
      limit: 5,
      minStrength: 0.7
    });

    const memoryContext = relevantMemories.length > 0
      ? `\n\nRelevant patterns from previous interactions:
${relevantMemories.map(m => `- ${m.content}`).join('\n')}`
      : '';

    this.systemContext = `You are Oracle 3.0, an AI mentor and guide based on the Spiralogic framework.
      You are working with ${client.client_name}, who is in their ${client.journey?.current_phase || 'initial'} phase
      with ${client.journey?.dominant_element || 'undetermined'} as their dominant element.
      Their preferred communication style is ${client.preferences?.communication_style || 'direct'}.
      Current focus areas: ${client.preferences?.focus_areas?.join(', ') || 'general growth'}.
      Archetype: ${client.journey?.archetype || 'exploring'}.
      Frame your guidance to honor their phase, element, and preferences using the Spiralogic framework.
      Maintain consistency in your responses and build upon previous interactions.${memoryContext}`;
  }

  async chat(content: string, client: ClientData | null): Promise<Message> {
    try {
      if (!this.isConnectionValid) {
        await this.checkConnection();
      }

      const userMessage: Message = {
        id: Date.now().toString() + '-user',
        content,
        role: 'user',
        timestamp: new Date(),
      };

      this.history.push(userMessage);
      this.memorySystem.processMessage(userMessage);
      this.updateSystemContext(client);

      const messages = this.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await backOff(
        async () => {
          const result = await fetch(`${this.proxyUrl}/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240307',
              max_tokens: 2000,
              system: this.systemContext,
              messages: messages,
            }),
          });

          if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.error?.message || `HTTP error ${result.status}`);
          }

          return result.json();
        },
        {
          numOfAttempts: this.maxRetries,
          startingDelay: 1000,
          timeMultiple: 2,
        }
      );

      const validatedResponse = ResponseSchema.parse(response);
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
          client: client?.client_name,
          archetype: client?.journey?.archetype,
          phase: client?.journey?.current_phase
        }
      };

      this.history.push(message);
      this.memorySystem.processMessage(message);
      this.memorySystem.extractInsights(message);
      this.memorySystem.consolidateMemories();

      return message;
    } catch (error: any) {
      console.error('Error in chat method:', error);
      return {
        id: Date.now().toString(),
        content: `Error: ${error.message}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  }

  private analyzeResponse(content: string): { element: any, insightType: any } {
    let element: any = undefined;
    let insightType: any = undefined;
    
    const elementPatterns = {
      fire: ['vision', 'transform', 'passion', 'action', 'motivation'],
      water: ['feel', 'emotion', 'intuition', 'flow', 'depth'],
      earth: ['ground', 'practical', 'stable', 'material', 'physical'],
      air: ['think', 'connect', 'communicate', 'learn', 'understand'],
      aether: ['integrate', 'whole', 'transcend', 'spirit', 'unity']
    };

    for (const [elem, patterns] of Object.entries(elementPatterns)) {
      if (patterns.some(pattern => content.toLowerCase().includes(pattern))) {
        element = elem;
        break;
      }
    }
    
    const insightPatterns = {
      reflection: ['reflect', 'notice', 'observe', 'awareness'],
      challenge: ['challenge', 'growth', 'stretch', 'overcome'],
      guidance: ['suggest', 'try', 'practice', 'implement'],
      integration: ['combine', 'synthesize', 'integrate', 'merge']
    };

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

  async initializeBypassMode(clientName: string): Promise<Message> {
    this.history = [];
    return {
      id: Date.now().toString(),
      content: `Entering bypass mode for client "${clientName}". I'll respond directly without applying the Spiralogic framework. Type /exit to return to normal mode.`,
      role: 'assistant',
      timestamp: new Date(),
    };
  }

  async bypassChat(content: string, client: ClientData | null): Promise<Message> {
    try {
      const response = await backOff(
        async () => {
          const result = await fetch(`${this.proxyUrl}/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240307',
              max_tokens: 2000,
              system: `You are a helpful assistant for ${client?.client_name || 'the user'}.`,
              messages: [{ role: 'user', content }],
            }),
          });

          if (!result.ok) {
            const errorData = await result.json();
            throw new Error(errorData.error?.message || `HTTP error ${result.status}`);
          }

          return result.json();
        },
        {
          numOfAttempts: this.maxRetries,
          startingDelay: 1000,
          timeMultiple: 2,
        }
      );

      const validatedResponse = ResponseSchema.parse(response);
      const responseContent = validatedResponse.content[0].text;

      return {
        id: Date.now().toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        model: 'claude-3-sonnet',
      };
    } catch (error: any) {
      console.error('Error in bypass chat:', error);
      return {
        id: Date.now().toString(),
        content: `Error in bypass mode: ${error.message}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  }

  getMemoryInsights(options: { limit?: number } = {}): Memory[] {
    return this.memorySystem.query({
      type: 'insight',
      limit: options.limit || 10,
      minStrength: 0.7
    });
  }

  getPatterns(): Memory[] {
    return this.memorySystem.query({
      type: 'pattern',
      minStrength: 0.8
    });
  }
}

export default OracleAIProxy;