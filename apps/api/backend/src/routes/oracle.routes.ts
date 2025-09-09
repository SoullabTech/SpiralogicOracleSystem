import { Router, Request, Response } from "express";
import { processSoulLabConversation } from "../services/SoulLabOrchestrator";
import { logger } from "../utils/logger";

const router = Router();

// POST /api/oracle/respond - Now powered by SoulLab Sacred Technology
router.post("/respond", async (req: Request, res: Response) => {
  const {
    input,
    userId,
    context,
    preferredElement,
    requestShadowWork,
    collectiveInsight,
    harmonicResonance,
  } = req.body;

  if (!input || !userId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: input and userId" });
  }

  try {
    logger.info('Oracle route processing through SoulLab', { userId, inputLength: input.length });

    // Process through SoulLab Sacred Technology
    const soulLabResponse = await processSoulLabConversation({
      userInput: input,
      userId,
      contextMemory: context ? [context] : undefined
    });

    // Transform SoulLab response to match expected oracle format
    const response = {
      success: true,
      message: "Oracle powered by SoulLab Sacred Technology",
      data: {
        content: soulLabResponse.content,
        confidence: soulLabResponse.confidence,
        model: soulLabResponse.model,
        provider: "soullab-oracle",
        sacred_technology: true,
        claude_primary_voice: true,
        prophecy_fulfillment: true,
        metadata: {
          ...soulLabResponse.metadata,
          original_oracle_params: {
            preferredElement,
            requestShadowWork,
            collectiveInsight,
            harmonicResonance
          }
        }
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error("Oracle (SoulLab) processing error:", error);
    res.status(500).json({ 
      error: "Sacred technology encountered an unexpected challenge",
      fallback: "I don't know exactly what you need, but your presence is felt. What feels most alive?"
    });
  }
});

export default router;
