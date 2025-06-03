"use strict";
// oracle-backend/src/routes/memory.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Save a new memory
router.post('/', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { content, timestamp, metadata } = req.body;
    if (!userId || !content)
        throw (0, errorHandler_1.createError)('Missing user ID or content', 400);
    const { data, error } = await server_1.supabase
        .from('oracle_memories')
        .insert([
        {
            client_id: userId,
            content,
            timestamp,
            metadata,
        },
    ])
        .select()
        .single();
    if (error) {
        logger_1.logger.error('Failed to save memory:', error);
        throw (0, errorHandler_1.createError)('Error saving memory', 500);
    }
    res.status(201).json({ message: 'Memory saved', memory: data });
}));
// Get all memories for the user
router.get('/', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { data, error } = await server_1.supabase
        .from('oracle_memories')
        .select('*')
        .eq('client_id', userId)
        .order('timestamp', { ascending: false });
    if (error) {
        logger_1.logger.error('Error fetching memories:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch memories', 500);
    }
    res.json({ memories: data });
}));
// Get a specific memory by ID
router.get('/:id', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const memoryId = req.params.id;
    const userId = req.user?.id;
    const { data, error } = await server_1.supabase
        .from('oracle_memories')
        .select('*')
        .eq('id', memoryId)
        .eq('client_id', userId)
        .single();
    if (error) {
        logger_1.logger.error('Error fetching memory:', error);
        throw (0, errorHandler_1.createError)('Memory not found', 404);
    }
    res.json({ memory: data });
}));
// Delete a memory
router.delete('/:id', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const memoryId = req.params.id;
    const userId = req.user?.id;
    const { error } = await server_1.supabase
        .from('oracle_memories')
        .delete()
        .eq('id', memoryId)
        .eq('client_id', userId);
    if (error) {
        logger_1.logger.error('Error deleting memory:', error);
        throw (0, errorHandler_1.createError)('Failed to delete memory', 500);
    }
    res.json({ message: 'Memory deleted' });
}));
exports.default = router;
