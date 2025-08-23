// 🧠 MEMORY APPLICATION SERVICE
// Orchestration layer that coordinates between memory domain logic and infrastructure

import { 
  MemoryDomainService, 
  MemoryItem, 
  SpiritualPattern, 
  MemoryInsight, 
  MemoryAnalysis 
} from '../../domain/services/MemoryDomainService';
import { IMemoryRepository } from '../../infrastructure/repositories/MemoryRepository';
import { logger } from '../../utils/logger';
import { eventBus } from '../../core/events/EventBus';

export interface MemoryApplicationService {
  // Memory creation and management
  createMemory(memory: Omit<MemoryItem, 'id'>): Promise<MemoryItem>;
  updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem>;
  deleteMemory(id: string): Promise<void>;
  getMemory(id: string): Promise<MemoryItem | null>;
  
  // User memory queries
  getUserMemories(userId: string, options?: {
    limit?: number;
    offset?: number;
    element?: string;
    sourceAgent?: string;
    orderBy?: 'created_at' | 'updated_at' | 'confidence';
    order?: 'asc' | 'desc';
  }): Promise<{
    memories: MemoryItem[];
    total: number;
    hasMore: boolean;
  }>;
  
  // Search and analysis
  searchMemories(userId: string, query: string, options?: {
    limit?: number;
    minConfidence?: number;
  }): Promise<MemoryItem[]>;
  
  getMemoryAnalysis(userId: string, options?: {
    includeRecent?: boolean;
    recentDays?: number;
  }): Promise<MemoryAnalysis>;
  
  getMemoryInsights(userId: string, limit?: number): Promise<MemoryInsight[]>;
  
  // Specialized queries  
  getMemoriesByElement(userId: string, element: string, limit?: number): Promise<MemoryItem[]>;
  getMemoriesBySymbols(userId: string, symbols: string[], limit?: number): Promise<MemoryItem[]>;
  getRecentMemoryTrends(userId: string, days: number): Promise<{
    totalMemories: number;
    dailyBreakdown: Array<{ date: string; count: number }>;
    elementalTrends: Record<string, number>;
    significanceAverage: number;
  }>;
  
  // Batch operations
  createMemoriesBatch(memories: Array<Omit<MemoryItem, 'id'>>): Promise<MemoryItem[]>;
  enhanceMemoryWithAnalysis(memoryId: string): Promise<MemoryItem>;
  
  // Statistics and insights
  getMemoryStatistics(userId: string): Promise<{
    overview: {
      totalMemories: number;
      averageConfidence: number;
      mostActiveElement: string;
      mostActiveAgent: string;
    };
    patterns: SpiritualPattern[];
    insights: MemoryInsight[];
    recommendations: string[];
  }>;
  
  // Maintenance and cleanup
  cleanupOldMemories(userId: string, olderThanDays: number): Promise<number>;
  recalculateMemoryConfidence(userId: string): Promise<number>;
  
  // Export and backup
  exportUserMemories(userId: string, format: 'json' | 'csv'): Promise<string>;
}

export class MemoryApplicationServiceImpl implements MemoryApplicationService {
  constructor(private memoryRepository: IMemoryRepository) {}

  async createMemory(memory: Omit<MemoryItem, 'id'>): Promise<MemoryItem> {
    try {
      // Enhance memory with domain analysis
      const spiritualThemes = MemoryDomainService.extractSpiritualThemes(memory.content);
      const significance = MemoryDomainService.calculateSpiritualSignificance(
        memory.content,
        memory.element,
        memory.source_agent
      );

      // Merge extracted data with provided memory
      const enhancedMemory = {
        ...memory,
        confidence: memory.confidence || significance,
        symbols: memory.symbols || spiritualThemes.slice(0, 5), // Top 5 themes as symbols
        timestamp: memory.timestamp || new Date().toISOString(),
        created_at: memory.created_at || new Date().toISOString(),
        updated_at: memory.updated_at || new Date().toISOString()
      };

      // Create memory in repository
      const createdMemory = await this.memoryRepository.createMemory(enhancedMemory);

      // Publish memory creation event
      await eventBus.publish({
        type: 'memory.created',
        source: 'MemoryApplicationService',
        payload: {
          memoryId: createdMemory.id,
          userId: createdMemory.user_id,
          element: createdMemory.element,
          sourceAgent: createdMemory.source_agent,
          spiritualThemes,
          significance
        },
        userId: createdMemory.user_id
      });

      logger.info('Memory created successfully', {
        memoryId: createdMemory.id,
        userId: createdMemory.user_id,
        element: createdMemory.element,
        significance
      });

      return createdMemory;
    } catch (error) {
      logger.error('Failed to create memory', { memory, error });
      throw error;
    }
  }

  async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    try {
      const existingMemory = await this.memoryRepository.getMemory(id);
      if (!existingMemory) {
        throw new Error('Memory not found');
      }

      // If content is being updated, recalculate spiritual analysis
      let enhancedUpdates = { ...updates };
      if (updates.content) {
        const spiritualThemes = MemoryDomainService.extractSpiritualThemes(updates.content);
        const significance = MemoryDomainService.calculateSpiritualSignificance(
          updates.content,
          updates.element || existingMemory.element,
          updates.source_agent || existingMemory.source_agent
        );

        enhancedUpdates = {
          ...enhancedUpdates,
          confidence: updates.confidence || significance,
          symbols: updates.symbols || spiritualThemes.slice(0, 5),
          updated_at: new Date().toISOString()
        };
      }

      const updatedMemory = await this.memoryRepository.updateMemory(id, enhancedUpdates);

      // Publish memory update event
      await eventBus.publish({
        type: 'memory.updated',
        source: 'MemoryApplicationService',
        payload: {
          memoryId: updatedMemory.id,
          userId: updatedMemory.user_id,
          changes: Object.keys(updates)
        },
        userId: updatedMemory.user_id
      });

      logger.info('Memory updated successfully', {
        memoryId: updatedMemory.id,
        userId: updatedMemory.user_id,
        changedFields: Object.keys(updates)
      });

      return updatedMemory;
    } catch (error) {
      logger.error('Failed to update memory', { id, updates, error });
      throw error;
    }
  }

  async deleteMemory(id: string): Promise<void> {
    try {
      const memory = await this.memoryRepository.getMemory(id);
      if (!memory) {
        throw new Error('Memory not found');
      }

      await this.memoryRepository.deleteMemory(id);

      // Publish memory deletion event
      await eventBus.publish({
        type: 'memory.deleted',
        source: 'MemoryApplicationService',
        payload: {
          memoryId: id,
          userId: memory.user_id
        },
        userId: memory.user_id
      });

      logger.info('Memory deleted successfully', {
        memoryId: id,
        userId: memory.user_id
      });
    } catch (error) {
      logger.error('Failed to delete memory', { id, error });
      throw error;
    }
  }

  async getMemory(id: string): Promise<MemoryItem | null> {
    try {
      return await this.memoryRepository.getMemory(id);
    } catch (error) {
      logger.error('Failed to get memory', { id, error });
      throw error;
    }
  }

  async getUserMemories(userId: string, options: {
    limit?: number;
    offset?: number;
    element?: string;
    sourceAgent?: string;
    orderBy?: 'created_at' | 'updated_at' | 'confidence';
    order?: 'asc' | 'desc';
  } = {}): Promise<{
    memories: MemoryItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;

      // Get memories with pagination
      const memories = await this.memoryRepository.getUserMemories(userId, {
        ...options,
        limit: limit + 1 // Get one extra to check if there are more
      });

      // Get total count
      const total = await this.memoryRepository.getUserMemoryCount(userId, {
        element: options.element,
        sourceAgent: options.sourceAgent
      });

      // Determine if there are more results
      const hasMore = memories.length > limit;
      const resultMemories = hasMore ? memories.slice(0, limit) : memories;

      return {
        memories: resultMemories,
        total,
        hasMore
      };
    } catch (error) {
      logger.error('Failed to get user memories', { userId, options, error });
      throw error;
    }
  }

  async searchMemories(userId: string, query: string, options: {
    limit?: number;
    minConfidence?: number;
  } = {}): Promise<MemoryItem[]> {
    try {
      const memories = await this.memoryRepository.searchMemories(userId, query, options);

      // Publish search event for analytics
      await eventBus.publish({
        type: 'memory.searched',
        source: 'MemoryApplicationService',
        payload: {
          userId,
          query,
          resultsCount: memories.length
        },
        userId
      });

      return memories;
    } catch (error) {
      logger.error('Failed to search memories', { userId, query, options, error });
      throw error;
    }
  }

  async getMemoryAnalysis(userId: string, options: {
    includeRecent?: boolean;
    recentDays?: number;
  } = {}): Promise<MemoryAnalysis> {
    try {
      let memories: MemoryItem[];

      if (options.includeRecent && options.recentDays) {
        memories = await this.memoryRepository.getRecentMemories(userId, options.recentDays);
      } else {
        const result = await this.getUserMemories(userId, { limit: 1000 }); // Get up to 1000 for analysis
        memories = result.memories;
      }

      // Analyze memories using domain service
      const patterns = MemoryDomainService.analyzeSpiritualPatterns(memories);
      const insights = MemoryDomainService.generateMemoryInsights(patterns, memories);
      const elementalBalance = MemoryDomainService.calculateElementalBalance(memories);
      const evolutionStage = MemoryDomainService.determineEvolutionStage(patterns, memories);
      const nextEvolutionOpportunity = MemoryDomainService.suggestNextEvolutionOpportunity(
        evolutionStage,
        patterns,
        elementalBalance
      );

      const analysis: MemoryAnalysis = {
        patterns,
        insights,
        elementalBalance,
        evolutionStage,
        nextEvolutionOpportunity
      };

      // Publish analysis completion event
      await eventBus.publish({
        type: 'memory.analysis_completed',
        source: 'MemoryApplicationService',
        payload: {
          userId,
          analysisType: options.includeRecent ? 'recent' : 'complete',
          memoriesAnalyzed: memories.length,
          patternsFound: patterns.length,
          insightsGenerated: insights.length,
          evolutionStage
        },
        userId
      });

      return analysis;
    } catch (error) {
      logger.error('Failed to get memory analysis', { userId, options, error });
      throw error;
    }
  }

  async getMemoryInsights(userId: string, limit: number = 10): Promise<MemoryInsight[]> {
    try {
      const analysis = await this.getMemoryAnalysis(userId);
      return analysis.insights.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get memory insights', { userId, limit, error });
      throw error;
    }
  }

  async getMemoriesByElement(userId: string, element: string, limit?: number): Promise<MemoryItem[]> {
    try {
      return await this.memoryRepository.getMemoriesByElement(userId, element, limit);
    } catch (error) {
      logger.error('Failed to get memories by element', { userId, element, limit, error });
      throw error;
    }
  }

  async getMemoriesBySymbols(userId: string, symbols: string[], limit?: number): Promise<MemoryItem[]> {
    try {
      return await this.memoryRepository.getMemoriesBySymbols(userId, symbols, limit);
    } catch (error) {
      logger.error('Failed to get memories by symbols', { userId, symbols, limit, error });
      throw error;
    }
  }

  async getRecentMemoryTrends(userId: string, days: number): Promise<{
    totalMemories: number;
    dailyBreakdown: Array<{ date: string; count: number }>;
    elementalTrends: Record<string, number>;
    significanceAverage: number;
  }> {
    try {
      const memories = await this.memoryRepository.getRecentMemories(userId, days);
      
      const trends = {
        totalMemories: memories.length,
        dailyBreakdown: [] as Array<{ date: string; count: number }>,
        elementalTrends: {} as Record<string, number>,
        significanceAverage: 0
      };

      if (memories.length === 0) {
        return trends;
      }

      // Calculate daily breakdown
      const dateCounts: Record<string, number> = {};
      let totalConfidence = 0;

      memories.forEach(memory => {
        const dateKey = new Date(memory.created_at || memory.timestamp).toISOString().split('T')[0];
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;

        if (memory.element) {
          trends.elementalTrends[memory.element] = (trends.elementalTrends[memory.element] || 0) + 1;
        }

        totalConfidence += memory.confidence || 0.5;
      });

      trends.dailyBreakdown = Object.entries(dateCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

      trends.significanceAverage = totalConfidence / memories.length;

      return trends;
    } catch (error) {
      logger.error('Failed to get recent memory trends', { userId, days, error });
      throw error;
    }
  }

  async createMemoriesBatch(memories: Array<Omit<MemoryItem, 'id'>>): Promise<MemoryItem[]> {
    try {
      // Enhance all memories with spiritual analysis
      const enhancedMemories = memories.map(memory => {
        const spiritualThemes = MemoryDomainService.extractSpiritualThemes(memory.content);
        const significance = MemoryDomainService.calculateSpiritualSignificance(
          memory.content,
          memory.element,
          memory.source_agent
        );

        return {
          ...memory,
          confidence: memory.confidence || significance,
          symbols: memory.symbols || spiritualThemes.slice(0, 5),
          timestamp: memory.timestamp || new Date().toISOString(),
          created_at: memory.created_at || new Date().toISOString(),
          updated_at: memory.updated_at || new Date().toISOString()
        };
      });

      const createdMemories = await this.memoryRepository.createMemories(enhancedMemories);

      // Publish batch creation event
      if (createdMemories.length > 0) {
        await eventBus.publish({
          type: 'memory.batch_created',
          source: 'MemoryApplicationService',
          payload: {
            userId: createdMemories[0].user_id,
            memoriesCount: createdMemories.length,
            memoryIds: createdMemories.map(m => m.id)
          },
          userId: createdMemories[0].user_id
        });
      }

      logger.info('Memories batch created successfully', {
        count: createdMemories.length,
        userId: createdMemories[0]?.user_id
      });

      return createdMemories;
    } catch (error) {
      logger.error('Failed to create memories batch', { memoriesCount: memories.length, error });
      throw error;
    }
  }

  async enhanceMemoryWithAnalysis(memoryId: string): Promise<MemoryItem> {
    try {
      const memory = await this.memoryRepository.getMemory(memoryId);
      if (!memory) {
        throw new Error('Memory not found');
      }

      // Re-analyze the memory content
      const spiritualThemes = MemoryDomainService.extractSpiritualThemes(memory.content);
      const significance = MemoryDomainService.calculateSpiritualSignificance(
        memory.content,
        memory.element,
        memory.source_agent
      );

      // Update memory with enhanced analysis
      const enhancedMemory = await this.memoryRepository.updateMemory(memoryId, {
        confidence: significance,
        symbols: spiritualThemes.slice(0, 5),
        updated_at: new Date().toISOString()
      });

      logger.info('Memory enhanced with analysis', {
        memoryId,
        userId: memory.user_id,
        newConfidence: significance,
        themes: spiritualThemes
      });

      return enhancedMemory;
    } catch (error) {
      logger.error('Failed to enhance memory with analysis', { memoryId, error });
      throw error;
    }
  }

  async getMemoryStatistics(userId: string): Promise<{
    overview: {
      totalMemories: number;
      averageConfidence: number;
      mostActiveElement: string;
      mostActiveAgent: string;
    };
    patterns: SpiritualPattern[];
    insights: MemoryInsight[];
    recommendations: string[];
  }> {
    try {
      const stats = await this.memoryRepository.getMemoryStatistics(userId);
      const analysis = await this.getMemoryAnalysis(userId);

      // Find most active element and agent
      const mostActiveElement = Object.entries(stats.elementalBreakdown)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
      
      const mostActiveAgent = Object.entries(stats.agentBreakdown)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (stats.totalMemories < 10) {
        recommendations.push("Continue engaging with your Oracle to build a richer spiritual memory bank");
      }
      
      if (stats.averageConfidence < 0.6) {
        recommendations.push("Focus on deeper, more meaningful spiritual conversations to increase insight quality");
      }
      
      if (analysis.nextEvolutionOpportunity) {
        recommendations.push(analysis.nextEvolutionOpportunity);
      }

      return {
        overview: {
          totalMemories: stats.totalMemories,
          averageConfidence: stats.averageConfidence,
          mostActiveElement,
          mostActiveAgent
        },
        patterns: analysis.patterns,
        insights: analysis.insights,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to get memory statistics', { userId, error });
      throw error;
    }
  }

  async cleanupOldMemories(userId: string, olderThanDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Get memories to be deleted for logging
      const memoriesToDelete = await this.memoryRepository.getMemoriesByDateRange(
        userId,
        new Date(0), // From beginning of time
        cutoffDate
      );

      let deletedCount = 0;
      for (const memory of memoriesToDelete) {
        await this.memoryRepository.deleteMemory(memory.id);
        deletedCount++;
      }

      // Publish cleanup event
      await eventBus.publish({
        type: 'memory.cleanup_completed',
        source: 'MemoryApplicationService',
        payload: {
          userId,
          deletedCount,
          olderThanDays
        },
        userId
      });

      logger.info('Old memories cleaned up', {
        userId,
        deletedCount,
        olderThanDays
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old memories', { userId, olderThanDays, error });
      throw error;
    }
  }

  async recalculateMemoryConfidence(userId: string): Promise<number> {
    try {
      const result = await this.getUserMemories(userId, { limit: 1000 });
      const memories = result.memories;
      let updatedCount = 0;

      for (const memory of memories) {
        const newConfidence = MemoryDomainService.calculateSpiritualSignificance(
          memory.content,
          memory.element,
          memory.source_agent
        );

        if (Math.abs((memory.confidence || 0.5) - newConfidence) > 0.1) {
          await this.memoryRepository.updateMemoryConfidence(memory.id, newConfidence);
          updatedCount++;
        }
      }

      logger.info('Memory confidence recalculated', {
        userId,
        totalMemories: memories.length,
        updatedCount
      });

      return updatedCount;
    } catch (error) {
      logger.error('Failed to recalculate memory confidence', { userId, error });
      throw error;
    }
  }

  async exportUserMemories(userId: string, format: 'json' | 'csv'): Promise<string> {
    try {
      const result = await this.getUserMemories(userId, { limit: 10000 }); // Export up to 10k memories
      const memories = result.memories;

      if (format === 'json') {
        return JSON.stringify(memories, null, 2);
      } else if (format === 'csv') {
        if (memories.length === 0) {
          return 'No memories to export';
        }

        // CSV headers
        const headers = [
          'id', 'content', 'element', 'source_agent', 'confidence',
          'symbols', 'timestamp', 'created_at', 'updated_at'
        ];

        // CSV rows
        const rows = memories.map(memory => [
          memory.id,
          `"${memory.content.replace(/"/g, '""')}"`, // Escape quotes
          memory.element || '',
          memory.source_agent || '',
          memory.confidence || '',
          `"${(memory.symbols || []).join(', ')}"`,
          memory.timestamp,
          memory.created_at || '',
          memory.updated_at || ''
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      }

      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      logger.error('Failed to export user memories', { userId, format, error });
      throw error;
    }
  }
}