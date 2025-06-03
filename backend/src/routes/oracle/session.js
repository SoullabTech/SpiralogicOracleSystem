"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseClient_1 = require("@/lib/supabaseClient");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { userId, tone, archetype } = req.body;
    const { error } = await supabaseClient_1.supabase
        .from('oracle_sessions')
        .upsert([{ user_id: userId, tone, archetype }], { onConflict: ['user_id'] });
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'saved' });
});
exports.default = router;
