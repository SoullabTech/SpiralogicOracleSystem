import { Router, Request, Response } from "express";
import { oracle } from "@/core/agents/mainOracleAgent";

const router = Router();

// POST /api/oracle/respond
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
    const response = await oracle.processQuery({
      input,
      userId,
      context,
      preferredElement,
      requestShadowWork,
      collectiveInsight,
      harmonicResonance,
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error("AIN Respond Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
