import express from 'express';
import { supabase } from '../server';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get oracle chat history
router.get('/chat/history', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { limit = 50, offset = 0 } = req.query;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const { data, error } = await supabase
    .from('oracle_chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) {
    logger.error('Error fetching chat history:', error);
    throw createError('Failed to fetch chat history', 500);
  }

  res.json({
    chats: data || [],
    total: data?.length || 0,
  });
}));

// Save oracle chat message
router.post('/chat/message', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { message, response, oracle_type, session_id } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  if (!message || !response) {
    throw createError('Message and response are required', 400);
  }

  const { data, error } = await supabase
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
    logger.error('Error saving chat message:', error);
    throw createError('Failed to save chat message', 500);
  }

  res.status(201).json({
    message: 'Chat message saved successfully',
    chat: data,
  });
}));

// Get oracle readings
router.get('/readings', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { type, limit = 20, offset = 0 } = req.query;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  let query = supabase
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
    logger.error('Error fetching oracle readings:', error);
    throw createError('Failed to fetch oracle readings', 500);
  }

  res.json({
    readings: data || [],
    total: data?.length || 0,
  });
}));

// Create oracle reading
router.post('/readings', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { reading_type, question, cards_drawn, interpretation, metadata } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  if (!reading_type || !question) {
    throw createError('Reading type and question are required', 400);
  }

  const { data, error } = await supabase
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
    logger.error('Error creating oracle reading:', error);
    throw createError('Failed to create oracle reading', 500);
  }

  res.status(201).json({
    message: 'Oracle reading created successfully',
    reading: data,
  });
}));

// Get oracle card decks
router.get('/decks', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('oracle_decks')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    logger.error('Error fetching oracle decks:', error);
    throw createError('Failed to fetch oracle decks', 500);
  }

  res.json({
    decks: data || [],
  });
}));

export default router;