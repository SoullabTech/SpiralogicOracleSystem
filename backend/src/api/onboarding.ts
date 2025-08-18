import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { supabase } from "../utils/supabase";
import { logger } from "../utils/logger";
import { mockAuthMiddleware } from "../utils/auth";

const router = Router();

interface OnboardingRequest extends Request {
  body: {
    persona: "mentor" | "shaman" | "analyst";
    intention: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

// POST /api/onboarding - Save user persona and intention
router.post(
  "/",
  mockAuthMiddleware,
  [
    body("persona")
      .isIn(["mentor", "shaman", "analyst"])
      .withMessage("Persona must be mentor, shaman, or analyst"),
    body("intention")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Intention must be between 1 and 1000 characters"),
  ],
  async (req: OnboardingRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { persona, intention } = req.body;

      const userId = req.user?.id;

      // Save to database
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: userId,
          persona,
          intention,
          onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error("Error saving onboarding data", { error, userId });
        return res.status(500).json({
          success: false,
          message: "Failed to save onboarding data",
        });
      }

      logger.info("User onboarding completed", {
        userId,
        persona,
        intentionLength: intention.length,
      });

      res.json({
        success: true,
        message: "Onboarding completed successfully",
        data: {
          persona,
          intention,
          onboarded: true,
        },
      });
    } catch (error) {
      logger.error("Onboarding endpoint error", { error });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// GET /api/onboarding - Get user onboarding status
router.get("/", mockAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("persona, intention, onboarded")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      logger.error("Error fetching onboarding data", { error, userId });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch onboarding data",
      });
    }

    res.json({
      success: true,
      data: data || {
        persona: null,
        intention: null,
        onboarded: false,
      },
    });
  } catch (error) {
    logger.error("Get onboarding endpoint error", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;