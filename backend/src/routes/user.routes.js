"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("@/lib/supabaseClient");
const router = (0, express_1.Router)();
router.get('/profile', async (req, res) => {
    const userId = req.headers['x-user-id']; // you’ll adapt this per auth
    if (!userId)
        return res.status(400).json({ error: 'Missing userId' });
    const { data, error } = await supabaseClient_1.supabase
        .from('profiles')
        .select('assignedGuide, spiralPhase, name')
        .eq('id', userId)
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
exports.default = router;
