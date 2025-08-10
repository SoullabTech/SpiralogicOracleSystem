import { Router } from "express";
import { oracle } from "../../services/MainOracleAgent"; // Adjust path if needed
import type { QueryInput } from "../../services/MainOracleAgent";

const router = Router();

/**
 * POST /api/oracle
 * Handles Oracle query requests with optional contextual metadata.
 */
router.post("/", async (req, res) => {
  try {
    const { query, userId, context } = req.body;

    if (!query || !userId) {
      return res.status(400).json({
        error: "Missing required fields: query and userId are required.",
      });
    }

    const input: QueryInput = {
      input: query,
      userId,
      context: context || {},
    };

    const response = await oracle.processQuery(input);

    res.status(200).json(response);
  } catch (error: any) {
    console.error("❌ Oracle processing failed:", error);
    res.status(500).json({
      error: "Oracle failed to process the query.",
      detail: error?.message || "Unknown error",
    });
  }
});

export default router;
