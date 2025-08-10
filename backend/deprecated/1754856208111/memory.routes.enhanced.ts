// ===============================================
// ENHANCED MEMORY ROUTES - SOUL MEMORY INTEGRATED
// Backwards compatible with existing routes + new Soul Memory features
// ===============================================

import express from "express";
import { z } from "zod";
import { memoryService } from "../services/memoryService.js";
import { memoryIntegrationService } from "../services/memoryIntegrationService.js";
import { soulMemoryService } from "../services/soulMemoryService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { AuthenticatedRequest } from "../types/index.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// ─────────────────────────────────────────
// 📑 Enhanced Zod Schemas
const MemorySchema = z.object({
  content: z.string().min(1),
  element: z.string().optional(),
  sourceAgent: z.string().optional(),
  confidence: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  // Soul Memory specific fields
  type: z
    .enum([
      "journal_entry",
      "oracle_exchange",
      "ritual_moment",
      "dream_record",
      "shadow_work",
      "breakthrough",
      "integration",
      "sacred_pause",
      "elemental_shift",
      "archetypal_emergence",
    ])
    .optional(),
  sacredMoment: z.boolean().optional(),
  shadowContent: z.boolean().optional(),
  transformationMarker: z.boolean().optional(),
});

const JournalEntrySchema = z.object({
  content: z.string().min(1),
  symbols: z.array(z.string()).optional(),
  element: z.string().optional(),
  spiralPhase: z.string().optional(),
  shadowContent: z.boolean().optional(),
});

const UnifiedSearchSchema = z.object({
  query: z.string().min(1),
  includeJournals: z.boolean().optional(),
  includeOracleExchanges: z.boolean().optional(),
  includeSacredMoments: z.boolean().optional(),
  limit: z.number().optional(),
});

// ─────────────────────────────────────────
// 🔧 INITIALIZATION ENDPOINT
// ─────────────────────────────────────────

/**
 * POST /api/oracle/memory/initialize
 * Initialize Soul Memory System for user (auto-migration)
 */
router.post(
  "/initialize",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const result = await memoryIntegrationService.initialize(userId);
      res.json({
        success: true,
        ...result,
        message: result.migrationPerformed
          ? "Soul Memory initialized with migration"
          : "Soul Memory initialized",
      });
    } catch (error) {
      logger.error("Error initializing Soul Memory:", error);
      res
        .status(500)
        .json({ error: "Failed to initialize Soul Memory System" });
    }
  }),
);

// ─────────────────────────────────────────
// 📥 ENHANCED MEMORY STORAGE
// ─────────────────────────────────────────

/**
 * POST /api/oracle/memory → Store memory (backwards compatible + enhanced)
 */
router.post(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = MemorySchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      // Store in both traditional memory service and Soul Memory
      const [traditionalMemory, soulMemory] = await Promise.all([
        memoryService.store(
          userId,
          parse.data.content,
          parse.data.element,
          parse.data.sourceAgent,
          parse.data.confidence,
          parse.data.metadata,
        ),
        parse.data.type
          ? soulMemoryService.storeMemory(userId, {
              type: parse.data.type,
              content: parse.data.content,
              element: parse.data.element,
              sacredMoment: parse.data.sacredMoment,
              shadowContent: parse.data.shadowContent,
              transformationMarker: parse.data.transformationMarker,
              metadata: parse.data.metadata,
            })
          : null,
      ]);

      res.json({
        success: true,
        traditionalMemory,
        soulMemory,
        unified: !!soulMemory,
      });
    } catch (error) {
      logger.error("Error storing enhanced memory:", error);
      res.status(500).json({ error: "Failed to store memory" });
    }
  }),
);

/**
 * POST /api/oracle/memory/journal → Store journal entry (integrated)
 */
router.post(
  "/journal",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = JournalEntrySchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const result = await memoryIntegrationService.storeJournalEntryIntegrated(
        userId,
        parse.data.content,
        parse.data.symbols || [],
        {
          element: parse.data.element,
          spiralPhase: parse.data.spiralPhase,
          shadowContent: parse.data.shadowContent,
        },
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error("Error storing integrated journal entry:", error);
      res.status(500).json({ error: "Failed to store journal entry" });
    }
  }),
);

// ─────────────────────────────────────────
// 📤 ENHANCED MEMORY RETRIEVAL
// ─────────────────────────────────────────

/**
 * GET /api/oracle/memory → Get memories (backwards compatible + enhanced)
 */
router.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { enhanced = "true" } = req.query;

    try {
      if (enhanced === "true") {
        // Get unified memories from both systems
        const [traditionalMemories, soulMemories, insights] = await Promise.all(
          [
            memoryService.recall(userId),
            soulMemoryService.getUserMemories(userId, { limit: 50 }),
            soulMemoryService.getUserInsights(userId),
          ],
        );

        res.json({
          success: true,
          memories: {
            traditional: traditionalMemories,
            soul: soulMemories,
            insights,
          },
          unified: true,
        });
      } else {
        // Backwards compatible: traditional memories only
        const memories = await memoryService.recall(userId);
        res.json({ memories });
      }
    } catch (error) {
      logger.error("Error retrieving enhanced memories:", error);
      res.status(500).json({ error: "Failed to retrieve memories" });
    }
  }),
);

/**
 * GET /api/oracle/memory/journal → Get journal entries (integrated)
 */
router.get(
  "/journal",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const result =
        await memoryIntegrationService.retrieveJournalEntriesIntegrated(userId);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error("Error retrieving integrated journal entries:", error);
      res.status(500).json({ error: "Failed to retrieve journal entries" });
    }
  }),
);

/**
 * GET /api/oracle/memory/sacred-moments → Get sacred moments
 */
router.get(
  "/sacred-moments",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { limit = "10" } = req.query;

    try {
      const sacredMoments = await soulMemoryService.getSacredMoments(
        userId,
        parseInt(limit as string),
      );

      res.json({
        success: true,
        sacredMoments,
        count: sacredMoments.length,
      });
    } catch (error) {
      logger.error("Error retrieving sacred moments:", error);
      res.status(500).json({ error: "Failed to retrieve sacred moments" });
    }
  }),
);

/**
 * GET /api/oracle/memory/transformation-journey → Get transformation journey
 */
router.get(
  "/transformation-journey",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const journey = await soulMemoryService.getTransformationJourney(userId);
      res.json({
        success: true,
        journey,
      });
    } catch (error) {
      logger.error("Error retrieving transformation journey:", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve transformation journey" });
    }
  }),
);

// ─────────────────────────────────────────
// 🔍 UNIFIED SEARCH
// ─────────────────────────────────────────

/**
 * POST /api/oracle/memory/search → Unified memory search
 */
router.post(
  "/search",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = UnifiedSearchSchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const results = await memoryIntegrationService.searchUnifiedMemory(
        userId,
        parse.data.query,
        {
          includeJournals: parse.data.includeJournals,
          includeOracleExchanges: parse.data.includeOracleExchanges,
          includeSacredMoments: parse.data.includeSacredMoments,
          limit: parse.data.limit,
        },
      );

      res.json({
        success: true,
        ...results,
      });
    } catch (error) {
      logger.error("Error in unified memory search:", error);
      res.status(500).json({ error: "Failed to search memories" });
    }
  }),
);

/**
 * POST /api/oracle/memory/oracle-query → Oracle memory query (enhanced)
 */
router.post(
  "/oracle-query",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { query } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthenticated" });
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
      const results = await memoryIntegrationService.processOracleMemoryQuery(
        query,
        userId,
      );
      res.json({
        success: true,
        ...results,
      });
    } catch (error) {
      logger.error("Error processing oracle memory query:", error);
      res.status(500).json({ error: "Failed to process oracle memory query" });
    }
  }),
);

// ─────────────────────────────────────────
// 📊 ENHANCED INSIGHTS
// ─────────────────────────────────────────

/**
 * GET /api/oracle/memory/insights → Enhanced memory insights
 */
router.get(
  "/insights",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const [traditionalInsights, soulInsights] = await Promise.all([
        memoryService.getMemoryInsights(userId),
        soulMemoryService.getUserInsights(userId),
      ]);

      res.json({
        success: true,
        insights: {
          traditional: traditionalInsights,
          soul: soulInsights,
          unified: true,
        },
      });
    } catch (error) {
      logger.error("Error retrieving enhanced insights:", error);
      res.status(500).json({ error: "Failed to retrieve insights" });
    }
  }),
);

/**
 * GET /api/oracle/memory/archetypes → Get archetypal patterns
 */
router.get(
  "/archetypes",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const archetypes = await soulMemoryService.getActiveArchetypes(userId);
      res.json({
        success: true,
        archetypes,
        count: archetypes.length,
      });
    } catch (error) {
      logger.error("Error retrieving archetypes:", error);
      res.status(500).json({ error: "Failed to retrieve archetypes" });
    }
  }),
);

// ─────────────────────────────────────────
// 🔄 MIGRATION & MAINTENANCE
// ─────────────────────────────────────────

/**
 * POST /api/oracle/memory/migrate → Migrate existing data to Soul Memory
 */
router.post(
  "/migrate",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const result =
        await memoryIntegrationService.migrateExistingJournalsToSoulMemory(
          userId,
        );
      res.json({
        success: true,
        ...result,
        message: `Successfully migrated ${result.migrated} journal entries`,
      });
    } catch (error) {
      logger.error("Error during migration:", error);
      res.status(500).json({ error: "Failed to migrate data" });
    }
  }),
);

// ─────────────────────────────────────────
// 📝 BACKWARDS COMPATIBLE ENDPOINTS
// ─────────────────────────────────────────

// Keep original endpoints for backwards compatibility
router.put(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id, content } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const updated = await memoryService.update(id, content, userId);
      res.json({ updated });
    } catch (error) {
      logger.error("Error updating memory:", error);
      res.status(500).json({ error: "Failed to update memory" });
    }
  }),
);

router.delete(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const success = await memoryService.delete(id, userId);
      res.status(success ? 200 : 404).json({ success });
    } catch (error) {
      logger.error("Error deleting memory:", error);
      res.status(500).json({ error: "Failed to delete memory" });
    }
  }),
);

export default router;
