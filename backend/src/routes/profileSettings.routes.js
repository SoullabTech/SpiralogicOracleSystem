"use strict";
// src/routes/profileSettings.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authenticateToken_1 = require("../middleware/authenticateToken");
const supabaseClient_1 = require("../lib/supabaseClient");
const router = (0, express_1.Router)();
// Zod schema for settings
const settingsSchema = zod_1.z.object({
    personal_guide_name: zod_1.z.string().min(2).max(100),
    voice_id: zod_1.z.string().min(10),
    guide_gender: zod_1.z.enum(['male', 'female', 'nonbinary']),
    guide_language: zod_1.z.string().min(2).max(10),
});
// PUT /api/profile/settings
router.put('/', authenticateToken_1.authenticateToken, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const parseResult = settingsSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Invalid profile settings',
            details: parseResult.error.format(),
        });
    }
    const { personal_guide_name, voice_id, guide_gender, guide_language } = parseResult.data;
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from('profiles')
            .update({
            personal_guide_name,
            voice_id,
            guide_gender,
            guide_language,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId)
            .select()
            .single();
        if (error || !data) {
            return res.status(500).json({ error: 'Failed to update profile settings' });
        }
        return res.status(200).json({ success: true, profile: data });
    }
    catch (err) {
        console.error('[Profile Settings] Update error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
