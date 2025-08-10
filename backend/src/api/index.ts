// Main API Router - Unified entry point for all API routes
// Implements the standardized response schema across all endpoints

import { Router } from "express";
import { errorResponse } from "../utils/sharedUtilities";
import personalOracleRouter from "./routes/personalOracleRouter";
import ainEngineRouter from "./routes/ainEngineRouter";
import developerRouter from "./routes/developerRouter";
import oracleGatewayRouter from "../routes/oracleGateway";
import healthRouter from "../routes/health.routes";
import { logger } from "../utils/logger";

const router = Router();

// API version prefix
const API_VERSION = "v1";

/**
 * Oracle Gateway - Unified API for elemental agent access
 * Main entry point for agent routing with factory pattern
 */
router.use("/", oracleGatewayRouter);

/**
 * Mount Personal Oracle routes - Main user interaction API
 * This is the primary gateway for all user consultations
 */
router.use(`/${API_VERSION}/personal-oracle`, personalOracleRouter);

/**
 * Mount AIN Engine routes - Public API for third-party developers
 * Provides access to collective insights and archetypal wisdom
 */
router.use(`/${API_VERSION}/ain-engine`, ainEngineRouter);

/**
 * Mount Developer routes - API key management and usage tracking
 * Private endpoints for registered developers
 */
router.use(`/${API_VERSION}/developer`, developerRouter);

/**
 * Health and monitoring endpoints
 */
router.use(`/${API_VERSION}/health`, healthRouter);

/**
 * API root endpoint - provides API information
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "Spiralogic Oracle API",
      version: API_VERSION,
      description:
        "Production-ready API for Personal Oracle Agent consultations",
      endpoints: {
        oracle: `/${API_VERSION}/oracle`,
        personalOracle: `/${API_VERSION}/personal-oracle`,
        ainEngine: `/${API_VERSION}/ain-engine`,
        developer: `/${API_VERSION}/developer`,
        health: `/${API_VERSION}/health`,
      },
      documentation: process.env.API_DOCS_URL || "/docs",
      timestamp: new Date().toISOString(),
    },
    errors: [],
  });
});

/**
 * API version endpoint
 */
router.get(`/${API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    data: {
      version: API_VERSION,
      buildVersion: process.env.BUILD_VERSION || "unknown",
      environment: process.env.NODE_ENV || "development",
      features: [
        "Personal Oracle Agent",
        "AIN Engine Public API",
        "Collective Intelligence",
        "Archetypal Processes",
        "Elemental Routing",
        "Astrology Integration",
        "Journal Integration",
        "Assessment Integration",
        "Rate Limiting",
        "Authentication",
        "Developer SDK",
        "Standardized Responses",
      ],
    },
    errors: [],
  });
});

/**
 * Catch-all for unmatched API routes
 */
router.use("*", (req, res) => {
  logger.warn("API endpoint not found", {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res
    .status(404)
    .json(
      errorResponse([
        "API endpoint not found",
        `Available endpoints: /${API_VERSION}/personal-oracle, /${API_VERSION}/ain-engine, /${API_VERSION}/health`,
      ]),
    );
});

/**
 * Global error handler for API routes
 */
router.use((error: Error, req: any, res: any, next: any) => {
  logger.error("API error", {
    error: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  res
    .status(500)
    .json(
      errorResponse([
        "Internal server error",
        "Please try again or contact support if the issue persists",
      ]),
    );
});

export default router;
