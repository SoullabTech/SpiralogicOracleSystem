// Rate Limiting Middleware with Redis Backend
import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { Request, Response } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * Redis-based store for rate limiting
 */
class RedisStore {
  prefix: string;

  constructor(prefix = 'rl:') {
    this.prefix = prefix;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      const current = await redis.incr(redisKey);
      
      if (current === 1) {
        // First request in window, set expiration
        await redis.expire(redisKey, Math.ceil(60000 / 1000)); // 1 minute default
      }
      
      const ttl = await redis.ttl(redisKey);
      const resetTime = new Date(Date.now() + ttl * 1000);
      
      return {
        totalHits: current,
        resetTime
      };
    } catch (error) {
      logger.error('Redis rate limit store error', { error, key });
      // Fallback to allowing request if Redis is down
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      await redis.decr(redisKey);
    } catch (error) {
      logger.error('Redis rate limit decrement error', { error, key });
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    try {
      await redis.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit reset error', { error, key });
    }
  }
}

/**
 * Create rate limiter with Redis store
 */
function createRateLimiter(config: RateLimitConfig) {
  const store = new RedisStore();
  
  return rateLimit({
    ...config,
    store: {
      incr: async (key: string, cb: (error: any, result?: { totalHits: number; resetTime?: Date }) => void) => {
        try {
          const result = await store.increment(key);
          cb(null, result);
        } catch (error) {
          cb(error);
        }
      },
      decrement: async (key: string) => {
        await store.decrement(key);
      },
      resetKey: async (key: string) => {
        await store.resetKey(key);
      }
    }
  });
}

/**
 * Default rate limiter for general API endpoints
 */
export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for sensitive operations like authentication
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'You have made too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Oracle-specific rate limiter - more generous for paying users
 */
export const oracleRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each user to 20 oracle requests per minute
  message: {
    error: 'Oracle Rate Limit Exceeded',
    message: 'You have reached the oracle consultation limit. Please wait before making another request.',
    retryAfter: '1 minute'
  },
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise fall back to IP
    const user = (req as any).user;
    return user ? `user:${user.id}` : `ip:${req.ip}`;
  },
});

/**
 * Administrative rate limiter - very strict for admin operations
 */
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each admin to 10 requests per minute
  message: {
    error: 'Administrative Rate Limit Exceeded',
    message: 'You have exceeded the administrative rate limit.',
    retryAfter: '1 minute'
  },
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user ? `admin:${user.id}` : `ip:${req.ip}`;
  },
});

/**
 * Create a custom rate limiter for specific endpoints
 */
export function createCustomRateLimiter(
  windowMinutes: number, 
  maxRequests: number, 
  identifier: string = 'custom'
) {
  return createRateLimiter({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      error: 'Rate Limit Exceeded',
      message: `You have exceeded the rate limit for ${identifier}. Please try again later.`,
      retryAfter: `${windowMinutes} minutes`
    }
  });
}

/**
 * Rate limit bypass for internal services or health checks
 */
export function bypassRateLimit(req: Request, res: Response, next: Function) {
  const bypassHeader = req.headers['x-bypass-rate-limit'];
  const bypassSecret = process.env.RATE_LIMIT_BYPASS_SECRET;
  
  if (bypassSecret && bypassHeader === bypassSecret) {
    logger.info('Rate limit bypassed', { ip: req.ip, path: req.path });
    next();
    return;
  }
  
  // Check for health check endpoints
  const healthEndpoints = ['/health', '/ready', '/live', '/metrics'];
  if (healthEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    next();
    return;
  }
  
  // Apply default rate limiting
  defaultRateLimiter(req, res, next);
}

/**
 * Dynamic rate limiter based on user subscription tier
 */
export function dynamicRateLimiter(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  
  if (!user) {
    // Non-authenticated users get basic rate limiting
    return defaultRateLimiter(req, res, next);
  }
  
  // Adjust rate limits based on user role/subscription
  const userTier = user.subscription_tier || 'free';
  
  const tierLimits = {
    free: { windowMs: 60 * 1000, max: 10 },
    basic: { windowMs: 60 * 1000, max: 30 },
    premium: { windowMs: 60 * 1000, max: 100 },
    enterprise: { windowMs: 60 * 1000, max: 500 }
  };
  
  const limits = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.free;
  
  const tierLimiter = createRateLimiter({
    ...limits,
    message: {
      error: 'Rate Limit Exceeded',
      message: `You have reached your ${userTier} tier rate limit. Please upgrade for higher limits.`,
      retryAfter: '1 minute'
    },
    keyGenerator: (req: Request) => `user:${user.id}:${userTier}`
  });
  
  return tierLimiter(req, res, next);
}

export default {
  default: defaultRateLimiter,
  auth: authRateLimiter,
  oracle: oracleRateLimiter,
  admin: adminRateLimiter,
  bypass: bypassRateLimit,
  dynamic: dynamicRateLimiter,
  custom: createCustomRateLimiter
};