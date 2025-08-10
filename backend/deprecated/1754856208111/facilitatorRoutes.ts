// src/routes/facilitator.routes.ts

import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

const router = Router();

/**
 * POST /api/facilitator/guide
 * Responds with facilitator guidance based on the provided query
 */
router.post(
  "/guide",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { query } = req.body;
      const userId = req.user?.id;

      if (!query || !userId) {
        return res.status(400).json({ error: "Missing query or userId" });
      }

      // 🌀 TODO: Replace with dynamic facilitator insight system
      const response = {
        guidance: `Facilitator response for: "${query}"`,
        userId,
      };

      return res.status(200).json(response);
    } catch (error) {
      logger.error("💬 Facilitator processing error", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
