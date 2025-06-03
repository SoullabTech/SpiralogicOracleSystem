"use strict";
// ===============================================
// PERFORMANCE OPTIMIZATION MIDDLEWARE
// Intelligent caching for Sacred Technology
// ===============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceBundle = exports.queryOptimizationMiddleware = exports.performanceMiddleware = exports.etagMiddleware = exports.compressionMiddleware = exports.cacheInvalidationMiddleware = exports.cacheMiddleware = void 0;
const redis_js_1 = require("../lib/redis.js");
const logger_js_1 = require("../utils/logger.js");
const crypto_1 = __importDefault(require("crypto"));
const cacheConfigs = {
    // Oracle responses - shorter TTL for dynamic content
    '/api/oracle/response': {
        ttl: 300, // 5 minutes
        keyPrefix: 'oracle:response',
        varyBy: ['userId', 'oracleMode'],
        invalidateOn: ['POST', 'PUT', 'DELETE']
    },
    // User profiles - longer TTL
    '/api/user/profile': {
        ttl: 3600, // 1 hour
        keyPrefix: 'user:profile',
        varyBy: ['userId']
    },
    // Holoflower states - medium TTL
    '/api/holoflower/state': {
        ttl: 600, // 10 minutes
        keyPrefix: 'holoflower:state',
        varyBy: ['userId']
    },
    // Available oracle modes - long TTL (static content)
    '/api/oracle/available-modes': {
        ttl: 86400, // 24 hours
        keyPrefix: 'oracle:modes'
    },
    // Transformation metrics - medium TTL
    '/api/analytics/transformation': {
        ttl: 1800, // 30 minutes
        keyPrefix: 'analytics:transformation',
        varyBy: ['userId', 'timeRange']
    }
};
// ===============================================
// CACHE KEY GENERATION
// ===============================================
function generateCacheKey(req, config) {
    const parts = [config.keyPrefix];
    // Add varied parameters
    if (config.varyBy) {
        config.varyBy.forEach(param => {
            const value = req.params[param] ||
                req.query[param] ||
                req.user?.[param] ||
                req.body?.[param];
            if (value) {
                parts.push(`${param}:${value}`);
            }
        });
    }
    // Add query string hash for complex queries
    if (Object.keys(req.query).length > 0) {
        const queryHash = crypto_1.default
            .createHash('md5')
            .update(JSON.stringify(req.query))
            .digest('hex')
            .substring(0, 8);
        parts.push(`q:${queryHash}`);
    }
    return parts.join(':');
}
// ===============================================
// CACHE MIDDLEWARE
// ===============================================
const cacheMiddleware = (configKey) => {
    return async (req, res, next) => {
        // Skip caching for non-GET requests by default
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }
        // Get cache configuration
        const config = configKey
            ? cacheConfigs[configKey]
            : cacheConfigs[req.path];
        if (!config) {
            return next(); // No cache config, proceed without caching
        }
        // Check condition if specified
        if (config.condition && !config.condition(req)) {
            return next();
        }
        // Generate cache key
        const cacheKey = generateCacheKey(req, config);
        try {
            // Try to get from cache
            const cached = await redis_js_1.CacheManager.get(cacheKey);
            if (cached) {
                // Cache hit
                logger_js_1.logger.debug(`Cache hit: ${cacheKey}`);
                // Set cache headers
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);
                // Restore cached headers
                Object.entries(cached.headers).forEach(([key, value]) => {
                    res.set(key, value);
                });
                // Send cached response
                return res.status(cached.statusCode).json(cached.data);
            }
            // Cache miss - intercept response
            logger_js_1.logger.debug(`Cache miss: ${cacheKey}`);
            const originalJson = res.json;
            const originalStatus = res.status;
            let statusCode = 200;
            // Override status to capture it
            res.status = function (code) {
                statusCode = code;
                return originalStatus.call(this, code);
            };
            // Override json to cache the response
            res.json = function (data) {
                // Only cache successful responses
                if (statusCode >= 200 && statusCode < 300) {
                    // Prepare cache data
                    const cacheData = {
                        data,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Cache-Time': new Date().toISOString()
                        },
                        statusCode
                    };
                    // Store in cache (async, don't wait)
                    redis_js_1.CacheManager.set(cacheKey, cacheData, config.ttl)
                        .then(() => logger_js_1.logger.debug(`Cached response: ${cacheKey}`))
                        .catch(err => logger_js_1.logger.error('Cache storage failed:', err));
                }
                // Set cache headers
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);
                // Call original json method
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger_js_1.logger.error('Cache middleware error:', error);
            // Continue without caching on error
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
// ===============================================
// CACHE INVALIDATION MIDDLEWARE
// ===============================================
const cacheInvalidationMiddleware = () => {
    return async (req, res, next) => {
        // Only process invalidation for write operations
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            return next();
        }
        // Find configs that should be invalidated
        const pathsToInvalidate = Object.entries(cacheConfigs)
            .filter(([path, config]) => {
            return config.invalidateOn?.includes(req.method) &&
                req.path.startsWith(path.split(':')[0]); // Handle parameterized paths
        })
            .map(([_, config]) => config.keyPrefix);
        if (pathsToInvalidate.length > 0) {
            // Invalidate cache patterns after response
            const originalJson = res.json;
            res.json = function (data) {
                // Invalidate related caches
                pathsToInvalidate.forEach(prefix => {
                    redis_js_1.CacheManager.invalidatePattern(`${prefix}:*`)
                        .then(count => logger_js_1.logger.debug(`Invalidated ${count} cache entries for ${prefix}`))
                        .catch(err => logger_js_1.logger.error('Cache invalidation failed:', err));
                });
                return originalJson.call(this, data);
            };
        }
        next();
    };
};
exports.cacheInvalidationMiddleware = cacheInvalidationMiddleware;
// ===============================================
// RESPONSE COMPRESSION
// ===============================================
const compression_1 = __importDefault(require("compression"));
exports.compressionMiddleware = (0, compression_1.default)({
    filter: (req, res) => {
        // Don't compress if already compressed
        if (res.getHeader('Content-Encoding')) {
            return false;
        }
        // Use compression for text-based responses
        return compression_1.default.filter(req, res);
    },
    level: 6, // Balance between speed and compression ratio
    threshold: 1024 // Only compress responses > 1KB
});
// ===============================================
// ETAGs FOR CACHE VALIDATION
// ===============================================
const etagMiddleware = () => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            // Generate ETag
            const content = JSON.stringify(data);
            const etag = crypto_1.default
                .createHash('md5')
                .update(content)
                .digest('hex');
            res.set('ETag', `"${etag}"`);
            // Check if client has matching ETag
            const clientEtag = req.get('If-None-Match');
            if (clientEtag === `"${etag}"`) {
                res.status(304).end();
                return res;
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.etagMiddleware = etagMiddleware;
// ===============================================
// PERFORMANCE MONITORING
// ===============================================
const performanceMiddleware = () => {
    return (req, res, next) => {
        const start = process.hrtime.bigint();
        // Monitor response time
        res.on('finish', () => {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1e6; // Convert to milliseconds
            // Log slow requests
            if (duration > 1000) { // > 1 second
                logger_js_1.logger.warn('Slow request detected', {
                    method: req.method,
                    path: req.path,
                    duration: `${duration.toFixed(2)}ms`,
                    statusCode: res.statusCode
                });
            }
            // Set response time header
            res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
            // Track metrics (could send to monitoring service)
            if (process.env.ENABLE_METRICS === 'true') {
                // Example: send to metrics collector
                logger_js_1.logger.debug('Request metrics', {
                    method: req.method,
                    path: req.path,
                    duration,
                    statusCode: res.statusCode,
                    cacheHit: res.get('X-Cache') === 'HIT'
                });
            }
        });
        next();
    };
};
exports.performanceMiddleware = performanceMiddleware;
const queryOptimizationMiddleware = () => {
    return (req, res, next) => {
        // Parse query optimizations
        const optimizations = {
            limit: req.query.limit ? parseInt(req.query.limit) : 50,
            offset: req.query.offset ? parseInt(req.query.offset) : 0,
            fields: req.query.fields ? req.query.fields.split(',') : undefined,
            includes: req.query.include ? req.query.include.split(',') : undefined,
            sort: req.query.sort ? parseSort(req.query.sort) : undefined
        };
        // Attach to request for use in handlers
        req.optimizations = optimizations;
        next();
    };
};
exports.queryOptimizationMiddleware = queryOptimizationMiddleware;
function parseSort(sortString) {
    return sortString.split(',').map(s => {
        const descending = s.startsWith('-');
        return {
            field: descending ? s.substring(1) : s,
            order: descending ? 'desc' : 'asc'
        };
    });
}
// ===============================================
// EXPORT PERFORMANCE BUNDLE
// ===============================================
exports.performanceBundle = [
    (0, exports.performanceMiddleware)(),
    exports.compressionMiddleware,
    (0, exports.etagMiddleware)(),
    (0, exports.cacheMiddleware)(),
    (0, exports.cacheInvalidationMiddleware)(),
    (0, exports.queryOptimizationMiddleware)()
];
