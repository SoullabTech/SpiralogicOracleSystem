import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// ===============================================
// AUTOMATION WEBHOOK VALIDATION MIDDLEWARE
// Secures n8n webhook endpoints
// ===============================================

interface AuthenticatedRequest extends Request {
  webhookData?: {
    signature: string;
    timestamp: string;
    source: string;
  };
}

/**
 * Validates n8n webhook signatures and prevents replay attacks
 */
export const validateAutomationWebhook = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    const source = req.headers["user-agent"] as string;

    // Check for required headers
    if (!signature) {
      return res.status(401).json({
        error: "Missing webhook signature",
        code: "WEBHOOK_SIGNATURE_MISSING",
      });
    }

    // Check webhook secret is configured
    if (!process.env.N8N_WEBHOOK_SECRET) {
      console.error("N8N_WEBHOOK_SECRET environment variable not configured");
      return res.status(500).json({
        error: "Webhook validation not configured",
        code: "WEBHOOK_CONFIG_MISSING",
      });
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", process.env.N8N_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const receivedSignature = signature.replace("sha256=", "");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(receivedSignature, "hex"),
      )
    ) {
      console.warn("Invalid webhook signature received", {
        endpoint: req.path,
        source: source,
        timestamp: new Date().toISOString(),
      });

      return res.status(401).json({
        error: "Invalid webhook signature",
        code: "WEBHOOK_SIGNATURE_INVALID",
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
          error: "Webhook timestamp too old",
          code: "WEBHOOK_TIMESTAMP_EXPIRED",
        });
      }
    }

    // Validate source (basic check)
    if (source && !source.includes("n8n") && !source.includes("Soullab")) {
      console.warn("Suspicious webhook source:", source);
    }

    // Add webhook metadata to request
    req.webhookData = {
      signature: receivedSignature,
      timestamp: timestamp || new Date().toISOString(),
      source: source || "unknown",
    };

    next();
  } catch (error) {
    console.error("Webhook validation error:", error);
    res.status(500).json({
      error: "Webhook validation failed",
      code: "WEBHOOK_VALIDATION_ERROR",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Rate limiting for webhook endpoints
 */
const webhookRateLimits = new Map<
  string,
  { count: number; resetTime: number }
>();

export const rateLimitWebhook = (
  maxRequests: number = 100,
  windowMs: number = 60000,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || "unknown";
    const now = Date.now();

    // Clean up expired entries
    const limit = webhookRateLimits.get(clientId);
    if (limit && now > limit.resetTime) {
      webhookRateLimits.delete(clientId);
    }

    // Check current limit
    const currentLimit = webhookRateLimits.get(clientId) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (currentLimit.count >= maxRequests) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        code: "WEBHOOK_RATE_LIMIT_EXCEEDED",
        resetTime: new Date(currentLimit.resetTime).toISOString(),
      });
    }

    // Update count
    currentLimit.count++;
    webhookRateLimits.set(clientId, currentLimit);

    next();
  };
};

/**
 * Webhook logging for debugging and monitoring
 */
export const logWebhookActivity = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  // Log incoming webhook
  console.log(`📥 Webhook received: ${req.method} ${req.path}`, {
    source: req.webhookData?.source || req.headers["user-agent"],
    timestamp: new Date().toISOString(),
    bodySize: JSON.stringify(req.body).length,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(`📤 Webhook response: ${res.statusCode} ${req.path}`, {
      duration: `${duration}ms`,
      success: res.statusCode < 400,
    });
  });

  next();
};

/**
 * Webhook error handler
 */
export const handleWebhookError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Webhook error:", {
    endpoint: req.path,
    error: error.message,
    stack: error.stack,
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors to webhook callers
  res.status(500).json({
    error: "Internal webhook processing error",
    code: "WEBHOOK_PROCESSING_ERROR",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Complete webhook protection middleware stack
 */
export const protectWebhook = [
  rateLimitWebhook(50, 60000), // 50 requests per minute
  validateAutomationWebhook,
  logWebhookActivity,
];
