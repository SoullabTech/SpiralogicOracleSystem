"use strict";
// 📁 File: src/routes/fieldpulse.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const summarizeCollectiveField_1 = __importDefault(require("../services/summarizeCollectiveField"));
const router = express_1.default.Router();
// Endpoint to get today's summary
router.get('/today', async (req, res) => {
    try {
        const summary = await (0, summarizeCollectiveField_1.default)();
        res.json(summary);
    }
    catch (error) {
        console.error('[FieldPulse] Error fetching field summary:', error);
        res.status(500).json({ error: 'Failed to generate field summary' });
    }
});
exports.default = router;
