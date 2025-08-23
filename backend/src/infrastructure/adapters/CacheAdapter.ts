/**
 * Cache Infrastructure Adapter
 * Refactored from CachedOracleService to pure infrastructure layer
 */

import { RedisAdapter } from "./RedisAdapter";

export interface CacheOptions {
  ttlSeconds?: number;
  pattern?: string;
}

/**
 * High-level cache operations built on RedisAdapter
 * Contains domain-agnostic caching patterns
 */
export class CacheAdapter {
  constructor(private redisAdapter: RedisAdapter) {}

  /**
   * Get cached value or compute and cache it
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.redisAdapter.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute the value
    const result = await computeFn();

    // Cache the result
    await this.redisAdapter.set(key, result, options.ttlSeconds);

    return result;
  }

  /**
   * Cache a value with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.redisAdapter.set(key, value, ttlSeconds);
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.redisAdapter.get<T>(key);
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    return await this.redisAdapter.delete(key);
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    return await this.redisAdapter.exists(key);
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    return await this.redisAdapter.deletePattern(pattern);
  }

  /**
   * Get all keys matching pattern
   */
  async getKeysForPattern(pattern: string): Promise<string[]> {
    return await this.redisAdapter.getPattern(pattern);
  }

  /**
   * Cache user-specific data
   */
  async setUserData<T>(userId: string, dataType: string, value: T, ttlSeconds?: number): Promise<void> {
    const key = this.redisAdapter.createUserKey(userId, dataType);
    await this.redisAdapter.set(key, value, ttlSeconds);
  }

  /**
   * Get user-specific cached data
   */
  async getUserData<T>(userId: string, dataType: string): Promise<T | null> {
    const key = this.redisAdapter.createUserKey(userId, dataType);
    return await this.redisAdapter.get<T>(key);
  }

  /**
   * Clear all user data
   */
  async clearUserData(userId: string): Promise<number> {
    const pattern = this.redisAdapter.createUserKey(userId, '*');
    return await this.redisAdapter.deletePattern(pattern);
  }

  /**
   * Cache session data
   */
  async setSession<T>(sessionId: string, data: T, ttlSeconds: number = 3600): Promise<void> {
    const key = this.redisAdapter.createSessionKey(sessionId);
    await this.redisAdapter.set(key, data, ttlSeconds);
  }

  /**
   * Get session data
   */
  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = this.redisAdapter.createSessionKey(sessionId);
    return await this.redisAdapter.get<T>(key);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const key = this.redisAdapter.createSessionKey(sessionId);
    return await this.redisAdapter.delete(key);
  }

  /**
   * Increment counter (for rate limiting, metrics, etc.)
   */
  async incrementCounter(counterKey: string): Promise<number> {
    return await this.redisAdapter.incr(counterKey);
  }

  /**
   * Set counter with expiration
   */
  async setCounterWithExpiry(counterKey: string, value: number, ttlSeconds: number): Promise<void> {
    await this.redisAdapter.set(counterKey, value, ttlSeconds);
  }

  /**
   * Add item to a list (for queues, logs, etc.)
   */
  async addToList(listKey: string, item: string): Promise<number> {
    return await this.redisAdapter.lpush(listKey, item);
  }

  /**
   * Get items from list
   */
  async getFromList(listKey: string, start: number = 0, end: number = -1): Promise<string[]> {
    return await this.redisAdapter.lrange(listKey, start, end);
  }

  /**
   * Add to set (for unique collections)
   */
  async addToSet(setKey: string, ...members: string[]): Promise<number> {
    return await this.redisAdapter.sadd(setKey, ...members);
  }

  /**
   * Get all set members
   */
  async getSetMembers(setKey: string): Promise<string[]> {
    return await this.redisAdapter.smembers(setKey);
  }

  /**
   * Check if member exists in set
   */
  async isInSet(setKey: string, member: string): Promise<boolean> {
    return await this.redisAdapter.sismember(setKey, member);
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{ status: 'healthy' | 'unhealthy'; ping?: string }> {
    try {
      const ping = await this.redisAdapter.ping();
      return { status: 'healthy', ping };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }

  /**
   * Clear entire cache (use with caution)
   */
  async flush(): Promise<void> {
    await this.redisAdapter.flushdb();
  }
}