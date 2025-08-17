"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elemental_1 = require("@lib/schemas/elemental");
const router = (0, express_1.Router)();
router.post("/submit-profile", async (req, res) => {
    const parsed = elemental_1.elementalProfileSchema.safeParse(req.body);
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
exports.default = router;
