import { z } from 'zod';
import type { Message } from '../types';

export interface Memory {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'insight' | 'pattern' | 'evolution';
  content: string;
  metadata: {
    element?: string;
    phase?: string;
    archetype?: string;
    emotionalState?: string;
    confidence?: number;
    source?: string;
  };
  connections: string[]; // IDs of related memories
  strength: number; // Memory strength/importance (0-1)
}

export interface MemoryQueryOptions {
  type?: Memory['type'];
  element?: string;
  phase?: string;
  archetype?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  minStrength?: number;
}

export class MemorySystem {
  private memories: Memory[] = [];
  private readonly decayRate = 0.1; // Rate at which memories decay over time
  private readonly strengthThreshold = 0.3; // Minimum strength for memory retrieval

  constructor() {
    // Initialize with base archetypal patterns
    this.initializeBaseMemories();
  }

  private initializeBaseMemories() {
    const basePatterns = [
      {
        type: 'pattern',
        content: 'Core elemental alignments',
        metadata: {
          element: 'aether',
          confidence: 1.0
        },
        strength: 1.0
      },
      {
        type: 'pattern',
        content: 'Phase transition indicators',
        metadata: {
          phase: 'meta',
          confidence: 1.0
        },
        strength: 1.0
      }
    ];

    basePatterns.forEach(pattern => {
      this.store({
        id: `base-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        connections: [],
        ...pattern
      });
    });
  }

  store(memory: Memory): void {
    // Update existing memory if it exists
    const existingIndex = this.memories.findIndex(m => m.id === memory.id);
    if (existingIndex >= 0) {
      this.memories[existingIndex] = {
        ...this.memories[existingIndex],
        ...memory,
        strength: Math.max(this.memories[existingIndex].strength, memory.strength)
      };
      return;
    }

    // Store new memory
    this.memories.push(memory);

    // Find and create connections
    this.createConnections(memory);
  }

  private createConnections(memory: Memory): void {
    const relatedMemories = this.memories.filter(m => 
      m.id !== memory.id && 
      (
        m.metadata.element === memory.metadata.element ||
        m.metadata.phase === memory.metadata.phase ||
        m.metadata.archetype === memory.metadata.archetype ||
        this.hasContentSimilarity(m.content, memory.content)
      )
    );

    memory.connections = [
      ...new Set([
        ...memory.connections,
        ...relatedMemories.map(m => m.id)
      ])
    ];

    // Update connections bidirectionally
    relatedMemories.forEach(related => {
      related.connections = [...new Set([...related.connections, memory.id])];
    });
  }

  private hasContentSimilarity(content1: string, content2: string): boolean {
    // Simple word overlap similarity for now
    const words1 = new Set(content1.toLowerCase().split(' '));
    const words2 = new Set(content2.toLowerCase().split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size) > 0.3;
  }

  query(options: MemoryQueryOptions): Memory[] {
    let results = this.memories.filter(memory => {
      // Apply decay based on time
      const age = Date.now() - memory.timestamp.getTime();
      const decayedStrength = memory.strength * Math.exp(-this.decayRate * age / (1000 * 60 * 60 * 24));
      
      if (decayedStrength < this.strengthThreshold) {
        return false;
      }

      // Filter based on options
      if (options.type && memory.type !== options.type) return false;
      if (options.element && memory.metadata.element !== options.element) return false;
      if (options.phase && memory.metadata.phase !== options.phase) return false;
      if (options.archetype && memory.metadata.archetype !== options.archetype) return false;
      if (options.timeRange) {
        const timestamp = memory.timestamp.getTime();
        if (timestamp < options.timeRange.start.getTime() || 
            timestamp > options.timeRange.end.getTime()) {
          return false;
        }
      }
      if (options.minStrength && decayedStrength < options.minStrength) return false;

      return true;
    });

    // Sort by strength and recency
    results.sort((a, b) => {
      const strengthDiff = b.strength - a.strength;
      if (strengthDiff !== 0) return strengthDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  processMessage(message: Message): Memory {
    const memory: Memory = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: message.timestamp,
      type: 'conversation',
      content: message.content,
      metadata: {
        element: message.element,
        phase: message.context?.phase,
        archetype: message.context?.archetype,
        source: message.role,
        confidence: 1.0
      },
      connections: [],
      strength: 0.8
    };

    this.store(memory);
    return memory;
  }

  extractInsights(message: Message): Memory[] {
    const insights: Memory[] = [];
    
    // Extract potential insights based on message content and context
    const sentences = message.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      if (this.isInsightful(sentence)) {
        insights.push({
          id: `insight-${Date.now()}-${Math.random()}`,
          timestamp: message.timestamp,
          type: 'insight',
          content: sentence.trim(),
          metadata: {
            element: message.element,
            phase: message.context?.phase,
            archetype: message.context?.archetype,
            confidence: 0.7
          },
          connections: [],
          strength: 0.9
        });
      }
    });

    insights.forEach(insight => this.store(insight));
    return insights;
  }

  private isInsightful(sentence: string): boolean {
    const insightIndicators = [
      'realize', 'understand', 'notice', 'recognize',
      'pattern', 'connection', 'relationship', 'insight',
      'discover', 'learn', 'reveal', 'emerge'
    ];

    return insightIndicators.some(indicator => 
      sentence.toLowerCase().includes(indicator)
    );
  }

  consolidateMemories(): void {
    // Group related memories and form higher-level patterns
    const groups = this.groupRelatedMemories();
    
    groups.forEach(group => {
      if (group.length < 2) return;

      const pattern = this.synthesizePattern(group);
      if (pattern) {
        this.store(pattern);
      }
    });
  }

  private groupRelatedMemories(): Memory[][] {
    const groups: Memory[][] = [];
    const processed = new Set<string>();

    this.memories.forEach(memory => {
      if (processed.has(memory.id)) return;

      const group = [memory];
      processed.add(memory.id);

      memory.connections.forEach(connectedId => {
        const connected = this.memories.find(m => m.id === connectedId);
        if (connected && !processed.has(connectedId)) {
          group.push(connected);
          processed.add(connectedId);
        }
      });

      if (group.length > 1) {
        groups.push(group);
      }
    });

    return groups;
  }

  private synthesizePattern(memories: Memory[]): Memory | null {
    // Only form patterns from insights and patterns
    const validMemories = memories.filter(m => 
      ['insight', 'pattern'].includes(m.type)
    );

    if (validMemories.length < 2) return null;

    // Find common elements in metadata
    const commonMetadata = this.findCommonMetadata(validMemories);
    
    return {
      id: `pattern-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type: 'pattern',
      content: `Pattern identified across ${validMemories.length} related insights`,
      metadata: commonMetadata,
      connections: validMemories.map(m => m.id),
      strength: 0.95
    };
  }

  private findCommonMetadata(memories: Memory[]): Memory['metadata'] {
    const metadata: Memory['metadata'] = {};
    
    ['element', 'phase', 'archetype'].forEach(key => {
      const values = new Set(memories.map(m => m.metadata[key]).filter(Boolean));
      if (values.size === 1) {
        metadata[key] = values.values().next().value;
      }
    });

    metadata.confidence = 0.8;
    return metadata;
  }
}