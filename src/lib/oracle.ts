import { ClaudeClient } from './claude-client';
import { OpenAIClient } from './openai-client';
import { MemoryContextBuilder } from './memory-context';
import type { Message, OracleResponse } from '../types';
import { env } from './config';

export class OracleAI {
  private claudeClient: ClaudeClient;
  private openAiClient: OpenAIClient;
  private memoryContext: MemoryContextBuilder;

  constructor() {
    this.claudeClient = new ClaudeClient(env.VITE_CLAUDE_API_KEY);
    this.openAiClient = new OpenAIClient(env.VITE_OPENAI_API_KEY);
    this.memoryContext = new MemoryContextBuilder();
  }

  private detectEmotionalContent(input: string): boolean {
    const emotionalKeywords = [
      'feel', 'emotion', 'heart', 'pain', 'joy', 'sad',
      'angry', 'fear', 'love', 'hate', 'anxiety', 'hope'
    ];
    return emotionalKeywords.some(word => input.toLowerCase().includes(word));
  }

  async respond(clientId: string, message: string, context?: any): Promise<OracleResponse> {
    try {
      // Get memory context
      const memoryContext = await this.memoryContext.getMemoryContext(clientId);
      
      // Determine which AI to use based on content
      const isEmotional = this.detectEmotionalContent(message);
      let response: Message;

      if (isEmotional) {
        // Use Claude for emotional content
        response = await this.claudeClient.chat(message, {
          ...context,
          client_id: clientId,
          memory_context: memoryContext
        });
      } else {
        // Use OpenAI for analytical content
        response = await this.openAiClient.chat(message, {
          ...context,
          client_id: clientId,
          memory_context: memoryContext
        });
      }

      // Store the response in memory
      await this.memoryContext.storeMemory({
        user_id: clientId,
        content: response.content,
        type: 'oracle_response',
        metadata: {
          model: response.model,
          element: response.element,
          insight_type: response.insight_type
        },
        strength: 0.8,
        timestamp: new Date()
      });

      // Find and store related memories
      const relatedMemories = await this.memoryContext.findRelatedMemories(
        response.content,
        clientId
      );

      // Create memory connections if relevant
      for (const memory of relatedMemories) {
        await this.memoryContext.createMemoryConnection(
          memory.id,
          response.id,
          0.7
        );
      }

      return {
        result: response.content,
        analysis: {
          element: response.element || null,
          insightType: response.insight_type || null
        }
      };
    } catch (error) {
      console.error('Oracle response error:', error);
      throw new Error('Failed to generate Oracle response');
    }
  }

  async getMemoryInsights(clientId: string): Promise<Message[]> {
    return this.memoryContext.getRecentMemories(clientId);
  }

  async loadClient(clientName: string): Promise<Message> {
    // Randomly choose between Claude and OpenAI for initial greeting
    return Math.random() > 0.5
      ? this.claudeClient.loadClient(clientName)
      : this.openAiClient.loadClient(clientName);
  }

  async bypassMode(clientId: string, message: string, context?: any): Promise<Message> {
    // Use OpenAI for bypass mode
    return this.openAiClient.bypassChat(message, {
      ...context,
      client_id: clientId
    });
  }
}

// Export singleton instance
export const oracleAI = new OracleAI();