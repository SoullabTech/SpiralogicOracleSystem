import { Router, Request, Response } from "express";
// import { oracle } from "@/core/agents/mainOracleAgent"; // Temporarily disabled - module deleted

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
    // Temporary placeholder response since oracle module is deleted
    const response = {
      success: true,
      message: "Oracle service temporarily disabled during development setup",
      data: {
        input,
        userId,
        placeholder: true
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("AIN Respond Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
