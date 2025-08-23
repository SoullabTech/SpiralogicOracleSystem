/**
 * Redis Infrastructure Adapter
 * Pure infrastructure layer for Redis cache operations
 */

import { redis } from "../../config/redis";

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
}

export interface CachePattern {
  pattern: string;
  keys: string[];
}

/**
 * Pure infrastructure adapter for Redis operations
 * Contains no business logic - only cache access patterns
 */
export class RedisAdapter {
  private redis = redis;

  // === BASIC CACHE OPERATIONS ===
  
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`Redis get failed for key: ${key}`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.warn(`Redis set failed for key: ${key}`, error);
      throw new Error(`Failed to cache value: ${error}`);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.warn(`Redis delete failed for key: ${key}`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      console.warn(`Redis exists check failed for key: ${key}`, error);
      return false;
    }
  }

  // === PATTERN OPERATIONS ===
  
  async getPattern(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.warn(`Redis pattern scan failed for: ${pattern}`, error);
      return [];
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.redis.del(...keys);
    } catch (error) {
      console.warn(`Redis pattern delete failed for: ${pattern}`, error);
      return 0;
    }
  }

  // === HASH OPERATIONS ===
  
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(key, field);
    } catch (error) {
      console.warn(`Redis hget failed for ${key}:${field}`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.redis.hset(key, field, value);
    } catch (error) {
      console.warn(`Redis hset failed for ${key}:${field}`, error);
      throw new Error(`Failed to set hash field: ${error}`);
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redis.hgetall(key);
    } catch (error) {
      console.warn(`Redis hgetall failed for key: ${key}`, error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.redis.hdel(key, field);
      return result > 0;
    } catch (error) {
      console.warn(`Redis hdel failed for ${key}:${field}`, error);
      return false;
    }
  }

  // === LIST OPERATIONS ===
  
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      console.warn(`Redis lpush failed for key: ${key}`, error);
      throw new Error(`Failed to push to list: ${error}`);
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      console.warn(`Redis rpop failed for key: ${key}`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redis.lrange(key, start, stop);
    } catch (error) {
      console.warn(`Redis lrange failed for key: ${key}`, error);
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      console.warn(`Redis llen failed for key: ${key}`, error);
      return 0;
    }
  }

  // === SET OPERATIONS ===
  
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      console.warn(`Redis sadd failed for key: ${key}`, error);
      throw new Error(`Failed to add to set: ${error}`);
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.warn(`Redis smembers failed for key: ${key}`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.warn(`Redis sismember failed for ${key}:${member}`, error);
      return false;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.srem(key, ...members);
    } catch (error) {
      console.warn(`Redis srem failed for key: ${key}`, error);
      return 0;
    }
  }

  // === EXPIRATION OPERATIONS ===
  
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.warn(`Redis expire failed for key: ${key}`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.warn(`Redis ttl failed for key: ${key}`, error);
      return -1;
    }
  }

  // === ATOMIC OPERATIONS ===
  
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.warn(`Redis incr failed for key: ${key}`, error);
      throw new Error(`Failed to increment: ${error}`);
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.redis.decr(key);
    } catch (error) {
      console.warn(`Redis decr failed for key: ${key}`, error);
      throw new Error(`Failed to decrement: ${error}`);
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.redis.incrby(key, increment);
    } catch (error) {
      console.warn(`Redis incrby failed for key: ${key}`, error);
      throw new Error(`Failed to increment by value: ${error}`);
    }
  }

  // === CONNECTION MANAGEMENT ===
  
  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      console.warn('Redis ping failed', error);
      throw new Error(`Redis connection failed: ${error}`);
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.warn('Redis flushdb failed', error);
      throw new Error(`Failed to flush database: ${error}`);
    }
  }

  // === TRANSACTION SUPPORT ===
  
  async multi() {
    return this.redis.multi();
  }

  async pipeline() {
    return this.redis.pipeline();
  }

  // === UTILITY METHODS ===
  
  createKey(...segments: string[]): string {
    return segments.filter(Boolean).join(':');
  }

  createPatternKey(userId: string, element: string): string {
    return this.createKey('pattern', userId, element);
  }

  createSessionKey(sessionId: string): string {
    return this.createKey('session', sessionId);
  }

  createUserKey(userId: string, suffix?: string): string {
    return suffix ? this.createKey('user', userId, suffix) : this.createKey('user', userId);
  }
}