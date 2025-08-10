import { Router } from "express";
import { elementalProfileSchema } from "@lib/schemas/elemental";

const router = Router();

router.post("/submit-profile", async (req, res) => {
  const parsed = elementalProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  // Safe to use parsed.data
  const profile = parsed.data;

  // TODO: insert into Supabase here
  return res.status(200).json({ message: "Profile submitted", profile });
});

export default router;
