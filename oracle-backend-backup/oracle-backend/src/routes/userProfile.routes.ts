import { Router } from "express";
import { authenticate } from "../middleware/authenticate"; // Import the new middleware
import {
  getUserProfile,
  updateUserProfile,
  getProfileStats,
} from "../services/profileService";

const router = Router();

// All profile updates require authentication
router.use(authenticate);

/**
 * POST /update-profile
 * Body should include:
 *   { userId, fire, water, earth, air, aether, crystal_focus }
 */
router.post("/update-profile", async (req, res) => {
  try {
    // Access the userId from the authenticated request user
    const userId = req.user?.id; // Now using the authenticated user from Supabase

    if (!userId) {
      return res.status(400).json({ message: "No user found in token" });
    }

    const { fire, water, earth, air, aether, crystal_focus } = req.body;

    // Validate the data
    if (
      [fire, water, earth, air, aether].some(
        (n) => typeof n !== "number" || n < 0 || n > 100
      )
    ) {
      return res.status(400).json({ message: "Profile validation failed" });
    }

    const updatedProfile = await updateUserProfile(userId, {
      user_id: userId,
      fire,
      water,
      earth,
      air,
      aether,
      crystal_focus,
      updated_at: new Date().toISOString(),
    });

    res.status(200).json(updatedProfile);
  } catch (err: any) {
    console.error("❌ Error in /update-profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
