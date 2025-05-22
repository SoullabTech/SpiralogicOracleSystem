// src/routes/memoryRoutes.ts

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';  // For authentication middleware
import { validate } from '../middleware/validate'; // For validation
import { memoryService } from '../services/memoryService'; // Memory service with necessary functions
import type { AuthenticatedRequest } from '../types'; // For typing
import logger from '../utils/logger'; // Logger for debugging

const router = Router();

// 🔒 All memory routes require authentication
router.use(authenticateToken);

/**
 * POST /api/oracle/memory
 * Body: { content, element, sourceAgent, confidence, metadata }
 * Stores a new memory
 */
router.post('/', async (req, res) => {
  try {
    const { content, element, sourceAgent, confidence, metadata } = req.body;
    const clientId = req.user?.id;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required.' });
    }

    // Store memory via memoryService
    const memory = await memoryService.store(clientId, content, element, sourceAgent, confidence, metadata);
    res.json({ success: true, memory });
  } catch (error) {
    logger.error('❌ Failed to store memory', { error });
    res.status(500).json({ success: false, error: 'Failed to store memory' });
  }
});

/**
 * GET /api/oracle/memory
 * Returns all memories for the current user
 */
router.get('/', async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required.' });
    }

    // Retrieve all memories via memoryService
    const memories = await memoryService.recall(clientId);
    res.json({ success: true, memories });
  } catch (error) {
    logger.error('❌ Error fetching memories:', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch memories.' });
  }
});

/**
 * PUT /api/oracle/memory/:id
 * Body: { content }
 * Updates an existing memory
 */
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const memoryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const updatedMemory = await memoryService.update(memoryId, content, userId);
    res.json({ success: true, memory: updatedMemory });
  } catch (error) {
    logger.error('❌ Error updating memory:', { error });
    res.status(500).json({ success: false, error: 'Failed to update memory.' });
  }
});

/**
 * DELETE /api/oracle/memory/:id
 * Deletes a memory
 */
router.delete('/:id', async (req, res) => {
  try {
    const memoryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const success = await memoryService.delete(memoryId, userId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Memory not found' });
    }
  } catch (error) {
    logger.error('❌ Error deleting memory:', { error });
    res.status(500).json({ success: false, error: 'Failed to delete memory.' });
  }
});

/**
 * GET /api/oracle/memory/by-symbol?symbol=fire&userId=abc123
 * Fetch memories by symbol (filter memories based on a symbol, e.g., "fire")
 */
router.get('/by-symbol', async (req, res) => {
  try {
    const symbol = req.query.symbol as string;
    const userId = req.query.userId as string;

    if (!symbol || !userId) {
      return res.status(400).json({ error: 'Missing symbol or userId in query.' });
    }

    // Stubbed logic for filtering by symbol
    const results = await memoryService.recall(userId).filter(m => m.content.includes(symbol));
    res.status(200).json({ memories: results });
  } catch (error) {
    logger.error('❌ Error fetching memories by symbol', { error });
    res.status(500).json({ error: 'Server error retrieving symbolic memories.' });
  }
});

/**
 * GET /api/oracle/memory/insights
 * Returns insights based on the user's memory data
 */
router.get('/insights', async (req, res) => {
  try {
    const insights = await memoryService.getMemoryInsights(req.user?.id);
    res.json({ success: true, insights });
  } catch (err: any) {
    console.error('❌ Error generating memory insights:', err);
    res.status(500).json({ success: false, error: 'Failed to generate insights.' });
  }
});

export default router;
