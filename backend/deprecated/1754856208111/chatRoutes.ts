// src/routes/chat.routes.ts

import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

const router = Router();

/**
 * POST /api/chat
 * Secured endpoint to process user chat input.
 */
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid message" });
    }

    // 🧠 Placeholder for Oracle chat agent processing logic
    const reply = `🧠 Oracle received: "${message}"`;

    res.status(200).json({ reply, userId });
  } catch (error: any) {
    logger.error("❌ Chat processing error", { error: error.message || error });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
