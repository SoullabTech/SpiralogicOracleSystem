import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index"; // Corrected import path
import { validate } from "../middleware/validate"; // Correct import path
import { loginSchema, refreshTokenSchema } from "../schemas/auth"; // Correct import path
import logger from "../utils/logger"; // Correct import path

const router = Router();
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user || !session) {
      return res
        .status(401)
        .json({ error: error?.message || "Authentication failed" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    });
  } catch (error) {
    logger.error("Login failed", { error });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
});

router.post("/refresh", validate(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !session) {
      return res
        .status(401)
        .json({ error: error?.message || "Invalid refresh token" });
    }

    res.json({
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    });
  } catch (error) {
    logger.error("Token refresh failed", { error });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Token refresh failed",
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout failed", { error });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Logout failed",
    });
  }
});

export default router;
