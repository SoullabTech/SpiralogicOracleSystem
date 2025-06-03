"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
// Get oracle chat history
router.get('/chat/history', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { limit = 50, offset = 0 } = req.query;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401);
    }
    const { data, error } = await server_1.supabase
        .from('oracle_chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (error) {
        logger_1.logger.error('Error fetching chat history:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch chat history', 500);
    }
    res.json({
        chats: data || [],
        total: data?.length || 0,
    });
}));
// Save oracle chat message
router.post('/chat/message', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { message, response, oracle_type, session_id } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401);
    }
    if (!message || !response) {
        throw (0, errorHandler_1.createError)('Message and response are required', 400);
    }
    const { data, error } = await server_1.supabase
        .from('oracle_chats')
        .insert({
        user_id: userId,
        message,
        response,
        oracle_type: oracle_type || 'general',
        session_id: session_id || null,
        created_at: new Date(),
    })
        .select()
        .single();
    if (error) {
        logger_1.logger.error('Error saving chat message:', error);
        throw (0, errorHandler_1.createError)('Failed to save chat message', 500);
    }
    res.status(201).json({
        message: 'Chat message saved successfully',
        chat: data,
    });
}));
// Get oracle readings
router.get('/readings', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { type, limit = 20, offset = 0 } = req.query;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401);
    }
    let query = server_1.supabase
        .from('oracle_readings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (type) {
        query = query.eq('reading_type', type);
    }
    const { data, error } = await query;
    if (error) {
        logger_1.logger.error('Error fetching oracle readings:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch oracle readings', 500);
    }
    res.json({
        readings: data || [],
        total: data?.length || 0,
    });
}));
// Create oracle reading
router.post('/readings', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { reading_type, question, cards_drawn, interpretation, metadata } = req.body;
    if (!userId) {
        throw (0, errorHandler_1.createError)('User not authenticated', 401);
    }
    if (!reading_type || !question) {
        throw (0, errorHandler_1.createError)('Reading type and question are required', 400);
    }
    const { data, error } = await server_1.supabase
        .from('oracle_readings')
        .insert({
        user_id: userId,
        reading_type,
        question,
        cards_drawn: cards_drawn || [],
        interpretation: interpretation || '',
        metadata: metadata || {},
        created_at: new Date(),
    })
        .select()
        .single();
    if (error) {
        logger_1.logger.error('Error creating oracle reading:', error);
        throw (0, errorHandler_1.createError)('Failed to create oracle reading', 500);
    }
    res.status(201).json({
        message: 'Oracle reading created successfully',
        reading: data,
    });
}));
// Get oracle card decks
router.get('/decks', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { data, error } = await server_1.supabase
        .from('oracle_decks')
        .select('*')
        .eq('active', true)
        .order('name');
    if (error) {
        logger_1.logger.error('Error fetching oracle decks:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch oracle decks', 500);
    }
    res.json({
        decks: data || [],
    });
}));
exports.default = router;
