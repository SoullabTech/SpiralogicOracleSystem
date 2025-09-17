// lib/services/memoryService.ts
// Memory service for elemental agents

"use strict";

export interface MemoryItem {
  id?: string;
  userId: string;
  content: string;
  type: string;
  element?: string;
  energy?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// In-memory storage for now (can be replaced with database)
const memoryStore: Map<string, MemoryItem[]> = new Map();

/**
 * Store a memory item
 */
export async function storeMemoryItem(memory: MemoryItem): Promise<void> {
  const userId = memory.userId;
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, []);
  }

  const userMemories = memoryStore.get(userId)!;
  userMemories.push({
    ...memory,
    id: memory.id || generateId(),
    timestamp: memory.timestamp || new Date(),
  });

  // Keep only recent memories (last 100)
  if (userMemories.length > 100) {
    memoryStore.set(userId, userMemories.slice(-100));
  }
}

/**
 * Get relevant memories for a user
 */
export async function getRelevantMemories(
  userId: string,
  query?: string,
  limit: number = 10
): Promise<MemoryItem[]> {
  const userMemories = memoryStore.get(userId) || [];

  if (!query) {
    // Return most recent memories
    return userMemories.slice(-limit);
  }

  // Simple relevance scoring based on content matching
  const queryLower = query.toLowerCase();
  const scoredMemories = userMemories.map(memory => {
    let score = 0;

    // Check content match
    if (memory.content.toLowerCase().includes(queryLower)) {
      score += 2;
    }

    // Check element match if specified
    if (memory.element && query.includes(memory.element)) {
      score += 1;
    }

    // Recency bonus (newer memories get slight preference)
    const ageHours = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) score += 0.5;
    if (ageHours < 1) score += 1;

    return { memory, score };
  });

  // Sort by score and return top results
  return scoredMemories
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.memory);
}

/**
 * Get memories by element
 */
export async function getMemoriesByElement(
  userId: string,
  element: string,
  limit: number = 10
): Promise<MemoryItem[]> {
  const userMemories = memoryStore.get(userId) || [];

  return userMemories
    .filter(memory => memory.element === element)
    .slice(-limit);
}

/**
 * Clear user memories
 */
export async function clearUserMemories(userId: string): Promise<void> {
  memoryStore.delete(userId);
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}