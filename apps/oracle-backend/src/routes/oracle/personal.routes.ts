// 📁 File: /routes/oracle/personal.routes.ts

import express from 'express';
import { personalOracle } from '@/core/agents/personalOracleAgent';

const router = express.Router();

// 🔮 POST /api/oracle/personal/query
// Request body: { userId: string, input: string, context?: any }
router.post('/query', async (req, res) => {
  const { userId, input, context } = req.body;

  if (!userId || !input) {
    return res.status(400).json({ error: 'Missing userId or input' });
  }

  try {
    const response = await personalOracle.process({ userId, input, context });
    res.status(200).json(response);
  } catch (err) {
    console.error('[PersonalOracle Route Error]', err);
    res.status(500).json({ error: 'Failed to process Oracle response', details: err });
  }
});

export default router;
