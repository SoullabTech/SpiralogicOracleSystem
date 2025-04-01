import { Letta } from 'letta-client';
import type { Memory } from './types';

export class LettaMemoryClient {
  private client: Letta;
  
  constructor() {
    this.client = new Letta({
      token: import.meta.env.VITE_LETTA_API_KEY
    });
  }

  async storeMemory(memory: Memory): Promise<void> {
    await this.client.memories.create({
      userId: memory.user_id,
      content: memory.content,
      type: memory.type,
      metadata: memory.metadata,
      strength: memory.strength,
      timestamp: memory.created_at.toISOString()
    });
  }

  async getMemories(options: {
    userId: string;
    type?: string;
    minStrength?: number;
    limit?: number;
  }): Promise<Memory[]> {
    const memories = await this.client.memories.list({
      userId: options.userId,
      type: options.type,
      minStrength: options.minStrength,
      limit: options.limit
    });

    return memories.map(m => ({
      id: m.id,
      user_id: m.userId,
      content: m.content,
      type: m.type,
      metadata: m.metadata,
      strength: m.strength,
      created_at: new Date(m.timestamp),
      updated_at: new Date(m.timestamp)
    }));
  }

  async connectMemories(sourceId: string, targetId: string, strength = 1.0): Promise<void> {
    await this.client.connections.create({
      sourceId,
      targetId,
      strength
    });
  }

  async getConnectedMemories(memoryId: string): Promise<Memory[]> {
    const connections = await this.client.connections.list({
      memoryId
    });

    return connections.map(c => ({
      id: c.id,
      user_id: c.userId,
      content: c.content,
      type: c.type,
      metadata: c.metadata,
      strength: c.strength,
      created_at: new Date(c.timestamp),
      updated_at: new Date(c.timestamp)
    }));
  }

  async subscribeToMemoryUpdates(callback: (memory: Memory) => void): Promise<() => void> {
    const subscription = await this.client.memories.subscribe(memory => {
      callback({
        id: memory.id,
        user_id: memory.userId,
        content: memory.content,
        type: memory.type,
        metadata: memory.metadata,
        strength: memory.strength,
        created_at: new Date(memory.timestamp),
        updated_at: new Date(memory.timestamp)
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}