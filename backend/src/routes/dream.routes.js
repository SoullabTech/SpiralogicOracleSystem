"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dreamOracleAgent_1 = require("@/core/agents/dreamOracleAgent");
const router = express_1.default.Router();
// POST /api/oracle/dream/query
router.post('/query', async (req, res) => {
    const { userId, dreamDescription, context } = req.body;
    if (!userId || !dreamDescription) {
        return res.status(400).json({ error: 'Missing userId or dreamDescription' });
    }
    try {
        const result = await dreamOracleAgent_1.dreamOracle.process({ userId, dreamDescription, context });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('[DreamOracle Route Error]', err);
        res.status(500).json({ error: 'Dream Oracle processing failed', details: err });
    }
});
exports.default = router;
