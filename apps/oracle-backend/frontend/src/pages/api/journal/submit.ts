// /pages/api/journal/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createEntry } from '@/controllers/journal.controller';
import { logJournalEntry } from '@lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, content, phase, emotion_tag, symbols, sourceAgent } = req.body;

    if (!userId || !content || !phase) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await createEntry({
      userId,
      content,
      phase,
      emotion_tag,
      symbols,
      sourceAgent: sourceAgent || 'User',
    });

    await logJournalEntry({
      userId,
      content,
      phase,
      emotion_tag,
      symbols,
      sourceAgent: sourceAgent || 'User',
    });

    res.status(200).json({ message: 'Journal entry submitted', data: result });
  } catch (error) {
    console.error('[Journal Submit Error]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}