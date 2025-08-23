/**
 * Cached Oracle Service - Application Layer
 * Uses infrastructure adapters for caching operations
 */

import { CacheAdapter } from "../infrastructure/adapters/CacheAdapter";
import { RedisAdapter } from "../infrastructure/adapters/RedisAdapter";

// Initialize adapters
const redisAdapter = new RedisAdapter();
const cacheAdapter = new CacheAdapter(redisAdapter);

/**
 * Get cached pattern or compute it using provided function
 */
export async function getCachedPattern(
  userId: string,
  element: string,
  computeFn: () => Promise<any>,
): Promise<any> {
  const key = redisAdapter.createPatternKey(userId, element);
  
  return await cacheAdapter.getOrCompute(key, computeFn, { ttlSeconds: 3600 });
}

/**
 * Process multiple elements in parallel with caching
 */
export async function processElementsInParallel(
  userId: string,
  query: string,
  elements: string[],
): Promise<any[]> {
  const { AgentRegistry } = await import("../core/factories/AgentRegistry");
  const registry = new AgentRegistry();

  const promises = elements.map(async (element) => {
    return getCachedPattern(userId, element, async () => {
      const agent = registry.createAgent(element);
      return await agent.processQuery(query);
    });
  });

  return await Promise.all(promises);
}

/**
 * Clear cached patterns for a user
 */
export async function clearUserPatterns(userId: string): Promise<number> {
  const pattern = redisAdapter.createKey('pattern', userId, '*');
  return await cacheAdapter.deletePattern(pattern);
}

/**
 * Get cache health status
 */
export async function getCacheHealthStatus() {
  return await cacheAdapter.getHealthStatus();
}
