import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Create Redis client instance
export const redis = new Redis(redisConfig);

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Rate limiting helpers
export const rateLimitHelpers = {
  // Check if rate limit is exceeded
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const multi = redis.multi();
    const now = Date.now();
    const window = now - windowMs;
    
    // Remove old entries
    multi.zremrangebyscore(key, 0, window);
    
    // Count current entries
    multi.zcard(key);
    
    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    multi.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await multi.exec();
    
    if (!results) {
      return { allowed: true, remaining: limit, resetTime: now + windowMs };
    }
    
    const count = results[1][1] as number;
    const allowed = count < limit;
    
    if (!allowed) {
      // Remove the just-added entry if limit exceeded
      await redis.zremrangebyscore(key, now, now);
    }
    
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      resetTime: now + windowMs,
    };
  },

  // Get rate limit status
  async getRateLimitStatus(key: string, limit: number, windowMs: number): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const window = now - windowMs;
    
    await redis.zremrangebyscore(key, 0, window);
    const count = await redis.zcard(key);
    
    return {
      count,
      remaining: Math.max(0, limit - count),
      resetTime: now + windowMs,
    };
  },

  // Reset rate limit for a key
  async resetRateLimit(key: string): Promise<void> {
    await redis.del(key);
  },
};

// Session management helpers
export const sessionHelpers = {
  // Store session data
  async setSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  },

  // Get session data
  async getSession(sessionId: string): Promise<any | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  },

  // Extend session TTL
  async extendSession(sessionId: string, ttlSeconds: number = 3600): Promise<boolean> {
    return (await redis.expire(`session:${sessionId}`, ttlSeconds)) === 1;
  },
};

// Cache helpers
export const cacheHelpers = {
  // Set cache with TTL
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(`cache:${key}`, ttlSeconds, serialized);
    } else {
      await redis.set(`cache:${key}`, serialized);
    }
  },

  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  },

  // Delete from cache
  async del(key: string): Promise<void> {
    await redis.del(`cache:${key}`);
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    return (await redis.exists(`cache:${key}`)) === 1;
  },

  // Invalidate multiple cache keys by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Distributed lock helpers
export const lockHelpers = {
  // Acquire a distributed lock
  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random()}`;
    const result = await redis.set(
      `lock:${lockKey}`,
      lockId,
      'NX',
      'EX',
      ttlSeconds
    );
    return result === 'OK' ? lockId : null;
  },

  // Release a distributed lock
  async releaseLock(lockKey: string, lockId: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await redis.eval(script, 1, `lock:${lockKey}`, lockId);
    return result === 1;
  },

  // Check if lock exists
  async isLocked(lockKey: string): Promise<boolean> {
    return (await redis.exists(`lock:${lockKey}`)) === 1;
  },
};

export default redis;