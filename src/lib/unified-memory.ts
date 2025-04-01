import { MemoryStore } from './memory-store';
import type { Memory } from './types';

export class UnifiedMemorySystem {
  private memoryStore: MemoryStore;
  private subscribers: ((memory: Memory) => void)[] = [];

  constructor() {
    this.memoryStore = new MemoryStore();
    this.initializeSubscriptions();
  }

  private async initializeSubscriptions() {
    // Subscribe to Supabase real-time updates
    await this.memoryStore.subscribeToMemoryUpdates((memory) => {
      this.notifySubscribers(memory);
    });
  }

  private notifySubscribers(memory: Memory) {
    this.subscribers.forEach(callback => callback(memory));
  }

  async storeMemory(memory: Omit<Memory, 'id'>): Promise<Memory> {
    try {
      // Store in Supabase
      const storedMemory = await this.memoryStore.storeMemory(memory);
      return storedMemory;
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  async getMemories(options: {
    type?: string;
    minStrength?: number;
    limit?: number;
  } = {}): Promise<Memory[]> {
    try {
      return await this.memoryStore.getMemories(options);
    } catch (error) {
      console.error('Failed to get memories:', error);
      throw error;
    }
  }

  async connectMemories(sourceId: string, targetId: string, strength = 1.0): Promise<void> {
    try {
      await this.memoryStore.connectMemories(sourceId, targetId, strength);
    } catch (error) {
      console.error('Failed to connect memories:', error);
      throw error;
    }
  }

  async getConnectedMemories(memoryId: string): Promise<Memory[]> {
    try {
      return await this.memoryStore.getConnectedMemories(memoryId);
    } catch (error) {
      console.error('Failed to get connected memories:', error);
      throw error;
    }
  }

  async createSharedSpace(name: string, description?: string): Promise<void> {
    try {
      await this.memoryStore.createSharedSpace(name, description);
    } catch (error) {
      console.error('Failed to create shared space:', error);
      throw error;
    }
  }

  async addMemberToSpace(spaceId: string, userId: string, role = 'member'): Promise<void> {
    try {
      await this.memoryStore.addMemberToSpace(spaceId, userId, role);
    } catch (error) {
      console.error('Failed to add member to space:', error);
      throw error;
    }
  }

  async getSharedSpaces(): Promise<any[]> {
    try {
      return await this.memoryStore.getSharedSpaces();
    } catch (error) {
      console.error('Failed to get shared spaces:', error);
      throw error;
    }
  }

  subscribeToMemoryUpdates(callback: (memory: Memory) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // API route handler for memory storage
  async handleMemoryAPIRequest(req: { 
    user_id: string; 
    insight: string;
  }): Promise<Memory> {
    try {
      const memory = await this.storeMemory({
        content: req.insight,
        type: 'insight',
        metadata: {
          source: 'api',
          userId: req.user_id
        },
        strength: 1.0
      });

      this.notifySubscribers(memory);
      return memory;
    } catch (error) {
      console.error('Failed to handle memory API request:', error);
      throw error;
    }
  }
}