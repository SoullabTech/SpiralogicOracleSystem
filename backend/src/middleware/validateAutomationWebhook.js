"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectWebhook = exports.handleWebhookError = exports.logWebhookActivity = exports.rateLimitWebhook = exports.validateAutomationWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Validates n8n webhook signatures and prevents replay attacks
 */
const validateAutomationWebhook = (req, res, next) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const source = req.headers['user-agent'];
        // Check for required headers
        if (!signature) {
            return res.status(401).json({
                error: 'Missing webhook signature',
                code: 'WEBHOOK_SIGNATURE_MISSING'
            });
        }
        // Check webhook secret is configured
        if (!process.env.N8N_WEBHOOK_SECRET) {
            console.error('N8N_WEBHOOK_SECRET environment variable not configured');
            return res.status(500).json({
                error: 'Webhook validation not configured',
                code: 'WEBHOOK_CONFIG_MISSING'
            });
        }
        // Verify signature
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.N8N_WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');
        const receivedSignature = signature.replace('sha256=', '');
        if (!crypto_1.default.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(receivedSignature, 'hex'))) {
            console.warn('Invalid webhook signature received', {
                endpoint: req.path,
                source: source,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({
                error: 'Invalid webhook signature',
                code: 'WEBHOOK_SIGNATURE_INVALID'
            });
        }
        // Prevent replay attacks (if timestamp provided)
        if (timestamp) {
            const webhookTime = new Date(timestamp);
            const now = new Date();
            const timeDiff = now.getTime() - webhookTime.getTime();
            const fiveMinutes = 5 * 60 * 1000;
            if (timeDiff > fiveMinutes) {
                return res.status(401).json({
                    error: 'Webhook timestamp too old',
                    code: 'WEBHOOK_TIMESTAMP_EXPIRED'
                });
            }
        }
        // Validate source (basic check)
        if (source && !source.includes('n8n') && !source.includes('Soullab')) {
            console.warn('Suspicious webhook source:', source);
        }
        // Add webhook metadata to request
        req.webhookData = {
            signature: receivedSignature,
            timestamp: timestamp || new Date().toISOString(),
            source: source || 'unknown'
        };
        next();
    }
    catch (error) {
        console.error('Webhook validation error:', error);
        res.status(500).json({
            error: 'Webhook validation failed',
            code: 'WEBHOOK_VALIDATION_ERROR',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.validateAutomationWebhook = validateAutomationWebhook;
/**
 * Rate limiting for webhook endpoints
 */
const webhookRateLimits = new Map();
const rateLimitWebhook = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const clientId = req.ip || 'unknown';
        const now = Date.now();
        // Clean up expired entries
        const limit = webhookRateLimits.get(clientId);
        if (limit && now > limit.resetTime) {
            webhookRateLimits.delete(clientId);
        }
        // Check current limit
        const currentLimit = webhookRateLimits.get(clientId) || { count: 0, resetTime: now + windowMs };
        if (currentLimit.count >= maxRequests) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
                resetTime: new Date(currentLimit.resetTime).toISOString()
            });
        }
        // Update count
        currentLimit.count++;
        webhookRateLimits.set(clientId, currentLimit);
        next();
    };
};
exports.rateLimitWebhook = rateLimitWebhook;
/**
 * Webhook logging for debugging and monitoring
 */
const logWebhookActivity = (req, res, next) => {
    const startTime = Date.now();
    // Log incoming webhook
    console.log(`📥 Webhook received: ${req.method} ${req.path}`, {
        source: req.webhookData?.source || req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        bodySize: JSON.stringify(req.body).length
    });
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`📤 Webhook response: ${res.statusCode} ${req.path}`, {
            duration: `${duration}ms`,
            success: res.statusCode < 400
        });
    });
    next();
};
exports.logWebhookActivity = logWebhookActivity;
/**
 * Webhook error handler
 */
const handleWebhookError = (error, req, res, next) => {
    console.error('Webhook error:', {
        endpoint: req.path,
        error: error.message,
        stack: error.stack,
        body: req.body,
        timestamp: new Date().toISOString()
    });
    // Don't expose internal errors to webhook callers
    res.status(500).json({
        error: 'Internal webhook processing error',
        code: 'WEBHOOK_PROCESSING_ERROR',
        timestamp: new Date().toISOString()
    });
};
exports.handleWebhookError = handleWebhookError;
/**
 * Complete webhook protection middleware stack
 */
exports.protectWebhook = [
    (0, exports.rateLimitWebhook)(50, 60000), // 50 requests per minute
    exports.validateAutomationWebhook,
    exports.logWebhookActivity
];
