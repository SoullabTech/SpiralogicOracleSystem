import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { authenticateToken } from "../../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../../types/index";
import logger from "../../utils/logger";

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/oracle/extract-symbols
 * Authenticated route to extract symbolic keywords from dream text
 */
router.post(
  "/extract-symbols",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing dream text" });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a dream symbol interpreter. Extract key symbolic objects, archetypes, animals, places, or patterns from the user's dream. Respond ONLY with an array of 3–10 symbolic keywords, no explanation.",
          },
          { role: "user", content: text },
        ],
        temperature: 0.7,
      });

      const raw = completion.choices[0].message.content || "";
      const symbols = raw
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 1);

      logger.info("🌙 Symbols extracted", { userId: req.user?.id, symbols });

      return res.json({ symbols });
    } catch (err) {
      logger.error("❌ Symbol extraction failed", { error: err });
      return res.status(500).json({ error: "Failed to extract symbols" });
    }
  },
);

export default router;
