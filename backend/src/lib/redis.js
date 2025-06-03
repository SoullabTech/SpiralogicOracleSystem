"use strict";
// ===============================================
// REDIS CONFIGURATION FOR SOUL MEMORY
// Production-ready caching and memory system
// ===============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = exports.WebSocketRedis = exports.RateLimiter = exports.CacheManager = exports.SoulMemoryRedis = exports.subClient = exports.pubClient = exports.redis = void 0;
exports.checkRedisHealth = checkRedisHealth;
const ioredis_1 = __importDefault(require("ioredis"));
exports.Redis = ioredis_1.default;
const logger_js_1 = require("../utils/logger.js");
// ===============================================
// REDIS CLIENT CONFIGURATION
// ===============================================
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    lazyConnect: true,
    // TLS for production
    ...(process.env.REDIS_TLS_URL && {
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
    })
};
// Create Redis client with connection URL if available
exports.redis = process.env.REDIS_URL
    ? new ioredis_1.default(process.env.REDIS_URL)
    : new ioredis_1.default(redisConfig);
// Create separate client for pub/sub
exports.pubClient = exports.redis.duplicate();
exports.subClient = exports.redis.duplicate();
// ===============================================
// CONNECTION MANAGEMENT
// ===============================================
exports.redis.on('connect', () => {
    logger_js_1.logger.info('Redis client connected successfully');
});
exports.redis.on('error', (error) => {
    logger_js_1.logger.error('Redis connection error:', error);
});
exports.redis.on('ready', () => {
    logger_js_1.logger.info('Redis client ready for commands');
});
exports.redis.on('reconnecting', () => {
    logger_js_1.logger.warn('Redis client reconnecting...');
});
// ===============================================
// SOUL MEMORY OPERATIONS
// ===============================================
class SoulMemoryRedis {
    // Store memory with optional TTL
    static async storeMemory(userId, memoryId, memoryData, ttl) {
        try {
            const key = `${this.MEMORY_PREFIX}${userId}:${memoryId}`;
            const serialized = JSON.stringify(memoryData);
            if (ttl) {
                await exports.redis.setex(key, ttl, serialized);
            }
            else {
                await exports.redis.setex(key, this.DEFAULT_TTL, serialized);
            }
            // Add to user's memory index
            await exports.redis.sadd(`${this.MEMORY_PREFIX}${userId}:index`, memoryId);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to store memory in Redis:', error);
            return false;
        }
    }
    // Retrieve memory
    static async getMemory(userId, memoryId) {
        try {
            const key = `${this.MEMORY_PREFIX}${userId}:${memoryId}`;
            const data = await exports.redis.get(key);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to retrieve memory from Redis:', error);
            return null;
        }
    }
    // Get all memory IDs for a user
    static async getUserMemoryIds(userId) {
        try {
            const indexKey = `${this.MEMORY_PREFIX}${userId}:index`;
            const memoryIds = await exports.redis.smembers(indexKey);
            return memoryIds;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get user memory IDs:', error);
            return [];
        }
    }
    // Store session data
    static async storeSession(sessionId, sessionData, ttl = 3600 // 1 hour default
    ) {
        try {
            const key = `${this.SESSION_PREFIX}${sessionId}`;
            await exports.redis.setex(key, ttl, JSON.stringify(sessionData));
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to store session:', error);
            return false;
        }
    }
    // Get session data
    static async getSession(sessionId) {
        try {
            const key = `${this.SESSION_PREFIX}${sessionId}`;
            const data = await exports.redis.get(key);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get session:', error);
            return null;
        }
    }
    // Store vector embedding for semantic search
    static async storeVector(vectorId, vector, metadata) {
        try {
            const key = `${this.VECTOR_PREFIX}${vectorId}`;
            const data = {
                vector,
                metadata,
                timestamp: Date.now()
            };
            await exports.redis.set(key, JSON.stringify(data));
            // Add to vector index (for batch processing)
            await exports.redis.sadd(`${this.VECTOR_PREFIX}index`, vectorId);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to store vector:', error);
            return false;
        }
    }
    // Store memory thread relationships
    static async storeThread(userId, threadId, memoryIds) {
        try {
            const key = `${this.THREAD_PREFIX}${userId}:${threadId}`;
            await exports.redis.set(key, JSON.stringify({
                memoryIds,
                created: Date.now(),
                updated: Date.now()
            }));
            // Add to user's thread index
            await exports.redis.sadd(`${this.THREAD_PREFIX}${userId}:index`, threadId);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to store thread:', error);
            return false;
        }
    }
    // Batch operations for performance
    static async batchGetMemories(userId, memoryIds) {
        try {
            const pipeline = exports.redis.pipeline();
            const keys = memoryIds.map(id => `${this.MEMORY_PREFIX}${userId}:${id}`);
            keys.forEach(key => pipeline.get(key));
            const results = await pipeline.exec();
            const memoryMap = new Map();
            results?.forEach((result, index) => {
                if (result && result[1]) {
                    const memoryId = memoryIds[index];
                    memoryMap.set(memoryId, JSON.parse(result[1]));
                }
            });
            return memoryMap;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to batch get memories:', error);
            return new Map();
        }
    }
    // Clear user's memory cache (for GDPR compliance)
    static async clearUserMemory(userId) {
        try {
            // Get all memory IDs
            const memoryIds = await this.getUserMemoryIds(userId);
            if (memoryIds.length === 0) {
                return true;
            }
            // Delete all memories
            const pipeline = exports.redis.pipeline();
            memoryIds.forEach(id => {
                pipeline.del(`${this.MEMORY_PREFIX}${userId}:${id}`);
            });
            // Delete index
            pipeline.del(`${this.MEMORY_PREFIX}${userId}:index`);
            // Delete threads
            const threadIds = await exports.redis.smembers(`${this.THREAD_PREFIX}${userId}:index`);
            threadIds.forEach(id => {
                pipeline.del(`${this.THREAD_PREFIX}${userId}:${id}`);
            });
            pipeline.del(`${this.THREAD_PREFIX}${userId}:index`);
            await pipeline.exec();
            logger_js_1.logger.info(`Cleared all Redis memory for user: ${userId}`);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to clear user memory:', error);
            return false;
        }
    }
}
exports.SoulMemoryRedis = SoulMemoryRedis;
SoulMemoryRedis.MEMORY_PREFIX = 'soul:memory:';
SoulMemoryRedis.SESSION_PREFIX = 'soul:session:';
SoulMemoryRedis.VECTOR_PREFIX = 'soul:vector:';
SoulMemoryRedis.THREAD_PREFIX = 'soul:thread:';
SoulMemoryRedis.DEFAULT_TTL = 2592000; // 30 days
// ===============================================
// CACHING UTILITIES
// ===============================================
class CacheManager {
    // Generic cache operations with TTL
    static async set(key, value, ttl = 3600) {
        try {
            await exports.redis.setex(key, ttl, JSON.stringify(value));
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Cache set failed:', error);
            return false;
        }
    }
    static async get(key) {
        try {
            const value = await exports.redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            logger_js_1.logger.error('Cache get failed:', error);
            return null;
        }
    }
    static async del(key) {
        try {
            await exports.redis.del(key);
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Cache delete failed:', error);
            return false;
        }
    }
    // Pattern-based cache invalidation
    static async invalidatePattern(pattern) {
        try {
            const keys = await exports.redis.keys(pattern);
            if (keys.length === 0)
                return 0;
            const result = await exports.redis.del(...keys);
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('Pattern invalidation failed:', error);
            return 0;
        }
    }
    // Cache with automatic refresh
    static async getOrSet(key, factory, ttl = 3600) {
        try {
            // Try to get from cache
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            // Generate new value
            const value = await factory();
            await this.set(key, value, ttl);
            return value;
        }
        catch (error) {
            logger_js_1.logger.error('Cache getOrSet failed:', error);
            return null;
        }
    }
}
exports.CacheManager = CacheManager;
// ===============================================
// RATE LIMITING
// ===============================================
class RateLimiter {
    static async checkLimit(identifier, maxRequests = 100, windowSeconds = 900 // 15 minutes
    ) {
        const key = `rate:${identifier}`;
        const now = Date.now();
        const window = now - (windowSeconds * 1000);
        try {
            // Remove old entries
            await exports.redis.zremrangebyscore(key, '-inf', window);
            // Count requests in current window
            const count = await exports.redis.zcard(key);
            if (count < maxRequests) {
                // Add current request
                await exports.redis.zadd(key, now, `${now}-${Math.random()}`);
                await exports.redis.expire(key, windowSeconds);
                return {
                    allowed: true,
                    remaining: maxRequests - count - 1,
                    resetAt: now + (windowSeconds * 1000)
                };
            }
            // Get oldest entry to determine reset time
            const oldestEntries = await exports.redis.zrange(key, 0, 0, 'WITHSCORES');
            const resetAt = oldestEntries.length > 1
                ? parseInt(oldestEntries[1]) + (windowSeconds * 1000)
                : now + (windowSeconds * 1000);
            return {
                allowed: false,
                remaining: 0,
                resetAt
            };
        }
        catch (error) {
            logger_js_1.logger.error('Rate limit check failed:', error);
            // Fail open in case of Redis issues
            return { allowed: true, remaining: 1, resetAt: now + windowSeconds * 1000 };
        }
    }
}
exports.RateLimiter = RateLimiter;
// ===============================================
// WEBSOCKET SUPPORT
// ===============================================
class WebSocketRedis {
    // Publish message to channel
    static async publish(channel, message) {
        try {
            await exports.pubClient.publish(channel, JSON.stringify(message));
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to publish message:', error);
            return false;
        }
    }
    // Subscribe to channel
    static async subscribe(channel, handler) {
        await exports.subClient.subscribe(channel);
        exports.subClient.on('message', (receivedChannel, message) => {
            if (receivedChannel === channel) {
                try {
                    const parsed = JSON.parse(message);
                    handler(parsed);
                }
                catch (error) {
                    logger_js_1.logger.error('Failed to parse message:', error);
                }
            }
        });
    }
    // Unsubscribe from channel
    static async unsubscribe(channel) {
        await exports.subClient.unsubscribe(channel);
    }
}
exports.WebSocketRedis = WebSocketRedis;
// ===============================================
// HEALTH CHECK
// ===============================================
async function checkRedisHealth() {
    const start = Date.now();
    try {
        await exports.redis.ping();
        const info = await exports.redis.info();
        return {
            connected: true,
            latency: Date.now() - start,
            info: info.split('\n').reduce((acc, line) => {
                const [key, value] = line.split(':');
                if (key && value) {
                    acc[key.trim()] = value.trim();
                }
                return acc;
            }, {})
        };
    }
    catch (error) {
        return {
            connected: false,
            latency: -1
        };
    }
}
exports.default = exports.redis;
