// 🧠 MEMORY REPOSITORY
// Infrastructure layer for memory data access, handles all memory database operations

import { MemoryItem } from '../../domain/services/MemoryDomainService';

export interface IMemoryRepository {
  // Basic memory operations
  createMemory(memory: Omit<MemoryItem, 'id'>): Promise<MemoryItem>;
  getMemory(id: string): Promise<MemoryItem | null>;
  updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem>;
  deleteMemory(id: string): Promise<void>;
  
  // User memory queries
  getUserMemories(userId: string, options?: {
    limit?: number;
    offset?: number;
    element?: string;
    sourceAgent?: string;
    orderBy?: 'created_at' | 'updated_at' | 'confidence';
    order?: 'asc' | 'desc';
  }): Promise<MemoryItem[]>;
  
  getUserMemoryCount(userId: string, filters?: {
    element?: string;
    sourceAgent?: string;
  }): Promise<number>;
  
  // Search and filtering
  searchMemories(userId: string, query: string, options?: {
    limit?: number;
    minConfidence?: number;
  }): Promise<MemoryItem[]>;
  
  getMemoriesByElement(userId: string, element: string, limit?: number): Promise<MemoryItem[]>;
  getMemoriesByAgent(userId: string, sourceAgent: string, limit?: number): Promise<MemoryItem[]>;
  getMemoriesBySymbols(userId: string, symbols: string[], limit?: number): Promise<MemoryItem[]>;
  
  // Temporal queries
  getMemoriesByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date,
    limit?: number
  ): Promise<MemoryItem[]>;
  
  getRecentMemories(userId: string, days: number, limit?: number): Promise<MemoryItem[]>;
  
  // Analytics and insights
  getMemoryStatistics(userId: string): Promise<{
    totalMemories: number;
    elementalBreakdown: Record<string, number>;
    agentBreakdown: Record<string, number>;
    averageConfidence: number;
    mostCommonSymbols: Array<{ symbol: string; count: number }>;
    creationTrend: Array<{ date: string; count: number }>;
  }>;
  
  // Bulk operations
  createMemories(memories: Array<Omit<MemoryItem, 'id'>>): Promise<MemoryItem[]>;
  deleteUserMemories(userId: string): Promise<number>;
  
  // Maintenance
  cleanupOldMemories(olderThanDays: number): Promise<number>;
  updateMemoryConfidence(id: string, confidence: number): Promise<void>;
}

export class SupabaseMemoryRepository implements IMemoryRepository {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async createMemory(memory: Omit<MemoryItem, 'id'>): Promise<MemoryItem> {
    const { data, error } = await this.supabase
      .from("memories")
      .insert([{
        user_id: memory.user_id,
        content: memory.content,
        element: memory.element,
        source_agent: memory.source_agent,
        confidence: memory.confidence || 0.5,
        metadata: memory.metadata,
        symbols: memory.symbols,
        timestamp: memory.timestamp,
        created_at: memory.created_at || new Date().toISOString(),
        updated_at: memory.updated_at || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create memory: ${error.message}`);
    }

    return this.mapToMemoryItem(data);
  }

  async getMemory(id: string): Promise<MemoryItem | null> {
    const { data, error } = await this.supabase
      .from("memories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get memory: ${error.message}`);
    }

    return data ? this.mapToMemoryItem(data) : null;
  }

  async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    const dbUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from("memories")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }

    return this.mapToMemoryItem(data);
  }

  async deleteMemory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("memories")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  async getUserMemories(userId: string, options: {
    limit?: number;
    offset?: number;
    element?: string;
    sourceAgent?: string;
    orderBy?: 'created_at' | 'updated_at' | 'confidence';
    order?: 'asc' | 'desc';
  } = {}): Promise<MemoryItem[]> {
    let query = this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId);

    // Apply filters
    if (options.element) {
      query = query.eq("element", options.element);
    }
    if (options.sourceAgent) {
      query = query.eq("source_agent", options.sourceAgent);
    }

    // Apply ordering
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'desc';
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get user memories: ${error.message}`);
    }

    return data ? data.map(this.mapToMemoryItem) : [];
  }

  async getUserMemoryCount(userId: string, filters: {
    element?: string;
    sourceAgent?: string;
  } = {}): Promise<number> {
    let query = this.supabase
      .from("memories")
      .select("id", { count: 'exact' })
      .eq("user_id", userId);

    if (filters.element) {
      query = query.eq("element", filters.element);
    }
    if (filters.sourceAgent) {
      query = query.eq("source_agent", filters.sourceAgent);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to get memory count: ${error.message}`);
    }

    return count || 0;
  }

  async searchMemories(userId: string, query: string, options: {
    limit?: number;
    minConfidence?: number;
  } = {}): Promise<MemoryItem[]> {
    let dbQuery = this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .textSearch('content', query);

    if (options.minConfidence) {
      dbQuery = dbQuery.gte("confidence", options.minConfidence);
    }

    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    const { data, error } = await dbQuery.order('confidence', { ascending: false });

    if (error) {
      throw new Error(`Failed to search memories: ${error.message}`);
    }

    return data ? data.map(this.mapToMemoryItem) : [];
  }

  async getMemoriesByElement(userId: string, element: string, limit?: number): Promise<MemoryItem[]> {
    return this.getUserMemories(userId, {
      element,
      limit,
      orderBy: 'created_at',
      order: 'desc'
    });
  }

  async getMemoriesByAgent(userId: string, sourceAgent: string, limit?: number): Promise<MemoryItem[]> {
    return this.getUserMemories(userId, {
      sourceAgent,
      limit,
      orderBy: 'created_at',
      order: 'desc'
    });
  }

  async getMemoriesBySymbols(userId: string, symbols: string[], limit?: number): Promise<MemoryItem[]> {
    let query = this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .overlaps('symbols', symbols);

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get memories by symbols: ${error.message}`);
    }

    return data ? data.map(this.mapToMemoryItem) : [];
  }

  async getMemoriesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<MemoryItem[]> {
    let query = this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get memories by date range: ${error.message}`);
    }

    return data ? data.map(this.mapToMemoryItem) : [];
  }

  async getRecentMemories(userId: string, days: number, limit?: number): Promise<MemoryItem[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getMemoriesByDateRange(userId, startDate, new Date(), limit);
  }

  async getMemoryStatistics(userId: string): Promise<{
    totalMemories: number;
    elementalBreakdown: Record<string, number>;
    agentBreakdown: Record<string, number>;
    averageConfidence: number;
    mostCommonSymbols: Array<{ symbol: string; count: number }>;
    creationTrend: Array<{ date: string; count: number }>;
  }> {
    // Get all memories for this user
    const memories = await this.getUserMemories(userId);
    
    const stats = {
      totalMemories: memories.length,
      elementalBreakdown: {} as Record<string, number>,
      agentBreakdown: {} as Record<string, number>,
      averageConfidence: 0,
      mostCommonSymbols: [] as Array<{ symbol: string; count: number }>,
      creationTrend: [] as Array<{ date: string; count: number }>
    };

    if (memories.length === 0) {
      return stats;
    }

    // Calculate breakdowns and averages
    let totalConfidence = 0;
    const symbolCounts: Record<string, number> = {};
    const dateCounts: Record<string, number> = {};

    memories.forEach(memory => {
      // Elemental breakdown
      if (memory.element) {
        stats.elementalBreakdown[memory.element] = 
          (stats.elementalBreakdown[memory.element] || 0) + 1;
      }

      // Agent breakdown
      if (memory.source_agent) {
        stats.agentBreakdown[memory.source_agent] = 
          (stats.agentBreakdown[memory.source_agent] || 0) + 1;
      }

      // Confidence average
      if (memory.confidence) {
        totalConfidence += memory.confidence;
      }

      // Symbol counting
      if (memory.symbols) {
        memory.symbols.forEach(symbol => {
          symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
      }

      // Creation trend (by date)
      const dateKey = new Date(memory.created_at || memory.timestamp).toISOString().split('T')[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    stats.averageConfidence = totalConfidence / memories.length;

    // Get most common symbols (top 10)
    stats.mostCommonSymbols = Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symbol, count]) => ({ symbol, count }));

    // Creation trend (last 30 days)
    stats.creationTrend = Object.entries(dateCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return stats;
  }

  async createMemories(memories: Array<Omit<MemoryItem, 'id'>>): Promise<MemoryItem[]> {
    const dbMemories = memories.map(memory => ({
      user_id: memory.user_id,
      content: memory.content,
      element: memory.element,
      source_agent: memory.source_agent,
      confidence: memory.confidence || 0.5,
      metadata: memory.metadata,
      symbols: memory.symbols,
      timestamp: memory.timestamp,
      created_at: memory.created_at || new Date().toISOString(),
      updated_at: memory.updated_at || new Date().toISOString()
    }));

    const { data, error } = await this.supabase
      .from("memories")
      .insert(dbMemories)
      .select();

    if (error) {
      throw new Error(`Failed to create memories: ${error.message}`);
    }

    return data ? data.map(this.mapToMemoryItem) : [];
  }

  async deleteUserMemories(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("memories")
      .delete()
      .eq("user_id", userId)
      .select("id");

    if (error) {
      throw new Error(`Failed to delete user memories: ${error.message}`);
    }

    return data ? data.length : 0;
  }

  async cleanupOldMemories(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error } = await this.supabase
      .from("memories")
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .select("id");

    if (error) {
      throw new Error(`Failed to cleanup old memories: ${error.message}`);
    }

    return data ? data.length : 0;
  }

  async updateMemoryConfidence(id: string, confidence: number): Promise<void> {
    const { error } = await this.supabase
      .from("memories")
      .update({ 
        confidence,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update memory confidence: ${error.message}`);
    }
  }

  private mapToMemoryItem(data: any): MemoryItem {
    return {
      id: data.id,
      user_id: data.user_id,
      content: data.content,
      element: data.element,
      source_agent: data.source_agent,
      confidence: data.confidence,
      metadata: data.metadata,
      symbols: data.symbols,
      timestamp: data.timestamp,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

// Mock repository for testing
export class MockMemoryRepository implements IMemoryRepository {
  private memories: Map<string, MemoryItem> = new Map();
  private idCounter = 1;

  async createMemory(memory: Omit<MemoryItem, 'id'>): Promise<MemoryItem> {
    const id = (this.idCounter++).toString();
    const newMemory: MemoryItem = {
      ...memory,
      id,
      created_at: memory.created_at || new Date().toISOString(),
      updated_at: memory.updated_at || new Date().toISOString()
    };

    this.memories.set(id, newMemory);
    return newMemory;
  }

  async getMemory(id: string): Promise<MemoryItem | null> {
    return this.memories.get(id) || null;
  }

  async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    const current = this.memories.get(id);
    if (!current) {
      throw new Error('Memory not found');
    }

    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    this.memories.set(id, updated);
    return updated;
  }

  async deleteMemory(id: string): Promise<void> {
    this.memories.delete(id);
  }

  async getUserMemories(userId: string, options: {
    limit?: number;
    offset?: number;
    element?: string;
    sourceAgent?: string;
    orderBy?: 'created_at' | 'updated_at' | 'confidence';
    order?: 'asc' | 'desc';
  } = {}): Promise<MemoryItem[]> {
    let memories = Array.from(this.memories.values())
      .filter(m => m.user_id === userId);

    // Apply filters
    if (options.element) {
      memories = memories.filter(m => m.element === options.element);
    }
    if (options.sourceAgent) {
      memories = memories.filter(m => m.source_agent === options.sourceAgent);
    }

    // Apply sorting
    const orderBy = options.orderBy || 'created_at';
    const order = options.order || 'desc';
    
    memories.sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit;
    
    if (limit) {
      memories = memories.slice(offset, offset + limit);
    } else if (offset > 0) {
      memories = memories.slice(offset);
    }

    return memories;
  }

  async getUserMemoryCount(userId: string, filters: {
    element?: string;
    sourceAgent?: string;
  } = {}): Promise<number> {
    let count = 0;
    
    for (const memory of this.memories.values()) {
      if (memory.user_id === userId) {
        if (filters.element && memory.element !== filters.element) continue;
        if (filters.sourceAgent && memory.source_agent !== filters.sourceAgent) continue;
        count++;
      }
    }
    
    return count;
  }

  async searchMemories(userId: string, query: string, options: {
    limit?: number;
    minConfidence?: number;
  } = {}): Promise<MemoryItem[]> {
    let memories = Array.from(this.memories.values())
      .filter(m => 
        m.user_id === userId && 
        m.content.toLowerCase().includes(query.toLowerCase())
      );

    if (options.minConfidence) {
      memories = memories.filter(m => (m.confidence || 0) >= options.minConfidence!);
    }

    // Sort by confidence desc
    memories.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    if (options.limit) {
      memories = memories.slice(0, options.limit);
    }

    return memories;
  }

  async getMemoriesByElement(userId: string, element: string, limit?: number): Promise<MemoryItem[]> {
    return this.getUserMemories(userId, { element, limit });
  }

  async getMemoriesByAgent(userId: string, sourceAgent: string, limit?: number): Promise<MemoryItem[]> {
    return this.getUserMemories(userId, { sourceAgent, limit });
  }

  async getMemoriesBySymbols(userId: string, symbols: string[], limit?: number): Promise<MemoryItem[]> {
    let memories = Array.from(this.memories.values())
      .filter(m => 
        m.user_id === userId &&
        m.symbols &&
        symbols.some(symbol => m.symbols!.includes(symbol))
      );

    if (limit) {
      memories = memories.slice(0, limit);
    }

    return memories;
  }

  async getMemoriesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<MemoryItem[]> {
    let memories = Array.from(this.memories.values())
      .filter(m => {
        if (m.user_id !== userId) return false;
        const created = new Date(m.created_at || m.timestamp);
        return created >= startDate && created <= endDate;
      });

    if (limit) {
      memories = memories.slice(0, limit);
    }

    return memories;
  }

  async getRecentMemories(userId: string, days: number, limit?: number): Promise<MemoryItem[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getMemoriesByDateRange(userId, startDate, new Date(), limit);
  }

  async getMemoryStatistics(userId: string): Promise<{
    totalMemories: number;
    elementalBreakdown: Record<string, number>;
    agentBreakdown: Record<string, number>;
    averageConfidence: number;
    mostCommonSymbols: Array<{ symbol: string; count: number }>;
    creationTrend: Array<{ date: string; count: number }>;
  }> {
    const memories = await this.getUserMemories(userId);
    
    const stats = {
      totalMemories: memories.length,
      elementalBreakdown: {} as Record<string, number>,
      agentBreakdown: {} as Record<string, number>,
      averageConfidence: 0,
      mostCommonSymbols: [] as Array<{ symbol: string; count: number }>,
      creationTrend: [] as Array<{ date: string; count: number }>
    };

    if (memories.length === 0) {
      return stats;
    }

    let totalConfidence = 0;
    const symbolCounts: Record<string, number> = {};
    const dateCounts: Record<string, number> = {};

    memories.forEach(memory => {
      if (memory.element) {
        stats.elementalBreakdown[memory.element] = 
          (stats.elementalBreakdown[memory.element] || 0) + 1;
      }

      if (memory.source_agent) {
        stats.agentBreakdown[memory.source_agent] = 
          (stats.agentBreakdown[memory.source_agent] || 0) + 1;
      }

      if (memory.confidence) {
        totalConfidence += memory.confidence;
      }

      if (memory.symbols) {
        memory.symbols.forEach(symbol => {
          symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        });
      }

      const dateKey = new Date(memory.created_at || memory.timestamp).toISOString().split('T')[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    stats.averageConfidence = totalConfidence / memories.length;

    stats.mostCommonSymbols = Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symbol, count]) => ({ symbol, count }));

    stats.creationTrend = Object.entries(dateCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return stats;
  }

  async createMemories(memories: Array<Omit<MemoryItem, 'id'>>): Promise<MemoryItem[]> {
    const created: MemoryItem[] = [];
    
    for (const memory of memories) {
      const newMemory = await this.createMemory(memory);
      created.push(newMemory);
    }
    
    return created;
  }

  async deleteUserMemories(userId: string): Promise<number> {
    let deleted = 0;
    
    for (const [id, memory] of this.memories.entries()) {
      if (memory.user_id === userId) {
        this.memories.delete(id);
        deleted++;
      }
    }
    
    return deleted;
  }

  async cleanupOldMemories(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deleted = 0;
    
    for (const [id, memory] of this.memories.entries()) {
      const created = new Date(memory.created_at || memory.timestamp);
      if (created < cutoffDate) {
        this.memories.delete(id);
        deleted++;
      }
    }
    
    return deleted;
  }

  async updateMemoryConfidence(id: string, confidence: number): Promise<void> {
    const memory = this.memories.get(id);
    if (memory) {
      memory.confidence = confidence;
      memory.updated_at = new Date().toISOString();
      this.memories.set(id, memory);
    }
  }

  // Testing utilities
  clear(): void {
    this.memories.clear();
    this.idCounter = 1;
  }

  setMemory(id: string, memory: MemoryItem): void {
    this.memories.set(id, memory);
  }

  getAllMemories(): MemoryItem[] {
    return Array.from(this.memories.values());
  }
}