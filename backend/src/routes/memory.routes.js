"use strict";
// 📄 oracle-backend/src/routes/memory.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const memoryService_1 = require("../services/memoryService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// ─────────────────────────────────────────
// 📑 Zod Schemas
const MemorySchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    element: zod_1.z.string().optional(),
    sourceAgent: zod_1.z.string().optional(),
    confidence: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
const UpdateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    content: zod_1.z.string().min(1),
});
const DeleteSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
// ─────────────────────────────────────────
// 📥 POST /api/oracle/memory → Store a memory
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parse = MemorySchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const memory = await memoryService_1.memoryService.store(userId, parse.data.content, parse.data.element, parse.data.sourceAgent, parse.data.confidence, parse.data.metadata);
    res.status(200).json({ memory });
}));
// 📤 GET /api/oracle/memory → Get all user memories
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const memories = await memoryService_1.memoryService.recall(userId);
    res.status(200).json({ memories });
}));
// 📝 PUT /api/oracle/memory → Update memory
router.put('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parse = UpdateSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const updated = await memoryService_1.memoryService.update(parse.data.id, parse.data.content, userId);
    res.status(200).json({ updated });
}));
// ❌ DELETE /api/oracle/memory → Delete memory
router.delete('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parse = DeleteSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.format() });
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const success = await memoryService_1.memoryService.delete(parse.data.id, userId);
    res.status(success ? 200 : 404).json({ success });
}));
// 📊 GET /api/oracle/memory/insights → Get memory usage insights
router.get('/insights', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: 'Unauthenticated' });
    const insights = await memoryService_1.memoryService.getMemoryInsights(userId);
    res.status(200).json({ insights });
}));
exports.default = router;
