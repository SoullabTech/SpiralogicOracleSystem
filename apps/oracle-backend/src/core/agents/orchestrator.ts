// backend/src/core/agents/orchestrator.ts

import express, { Request, Response } from 'express';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import axios from 'axios';
import { runLangChain, triggerPrefectFlow } from '../../services/langchainService';

const router = express.Router();

// Use Express's built-in JSON parser
router.use(express.json());

/**
 * Health check endpoint.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Chat endpoint: takes { query } in body and returns an oracle response.
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query must be a non-empty string.' });
  }

  try {
    // Use the LangChain service to generate a thoughtful response
    const text = await runLangChain(query);

    // Optionally trigger a Prefect flow for logging or side-effects
    // await triggerPrefectFlow({ query, response: text });

    res.json({ text });
  } catch (err) {
    console.error('❌ /chat error:', err);
    res.status(500).json({ error: 'Failed to generate oracle response.' });
  }
});

/**
 * Proxy to an external RESTful pipeline (e.g. Prefect).
 */
router.post('/flow', async (req: Request, res: Response) => {
  try {
    const result = await triggerPrefectFlow(req.body);
    res.json(result);
  } catch (err) {
    console.error('❌ /flow error:', err);
    res.status(500).json({ error: 'Failed to trigger Prefect flow.' });
  }
});

export default router;
