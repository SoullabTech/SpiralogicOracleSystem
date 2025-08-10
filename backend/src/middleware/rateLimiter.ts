// Rate Limiting Middleware with Redis Backend - Emergency Fix
import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

class RedisStore {
  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    try {
      const multi = redis.multi();
      multi.incr(key);
      multi.expire(key, Math.floor(15 * 60)); // 15 minutes TTL
      const results = await multi.exec();
      
      return {
        totalHits: results?.[0]?.[1] as number || 1,
        resetTime: new Date(Date.now() + 15 * 60 * 1000)
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await redis.decr(key);
    } catch (error) {
      logger.error('Redis decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Redis reset error:', error);
    }
  }
}

function createRateLimiter(config: RateLimitConfig) {
  const store = new RedisStore();
  
  return rateLimit({
    ...config,
    store: {
      incr: async (key: string, cb: any) => {
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

export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

export const oracleRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Oracle queries limited. Please pause for sacred reflection.',
  standardHeaders: true,
  legacyHeaders: false
});

export const ainEngineRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'AIN Engine rate limit reached. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

export function bypassRateLimit(req: Request, res: Response, next: NextFunction) {
  const bypassHeader = req.headers['x-bypass-rate-limit'];
  const bypassSecret = process.env.RATE_LIMIT_BYPASS_SECRET;
  
  if (bypassSecret && bypassHeader === bypassSecret) {
    next();
    return;
  }
  
  const healthEndpoints = ['/health', '/ready', '/live', '/metrics'];
  if (healthEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    next();
    return;
  }
  
  defaultRateLimiter(req, res, next);
}

export function dynamicRateLimiter(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return defaultRateLimiter(req, res, next);
  }
  
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
    message: `You have reached your ${userTier} tier rate limit. Please upgrade for higher limits.`,
    keyGenerator: (req: Request) => `user:${user.id}:${userTier}`
  });
  
  return tierLimiter(req, res, next);
}

export default {
  default: defaultRateLimiter,
  auth: authRateLimiter,
  oracle: oracleRateLimiter,
  ainEngine: ainEngineRateLimiter,
  bypass: bypassRateLimit,
  dynamic: dynamicRateLimiter
};