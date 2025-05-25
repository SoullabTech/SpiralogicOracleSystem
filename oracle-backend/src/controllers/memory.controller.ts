// src/controllers/memory.controller.ts

import { Request, Response } from 'express';
import { MemoryService } from '../services/memoryService';
import { memorySchema, sharedSpaceSchema } from '../schemas/memory';
import { z } from 'zod';

const service = new MemoryService();

export async function storeMemory(req: Request, res: Response) {
  try {
    const parse = memorySchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid memory data', details: parse.error.format() });
    }

    const memory = await service.storeMemory(parse.data);
    res.status(200).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to store memory', details: error });
  }
}

export async function getMemories(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const memories = await service.retrieveMemories(userId);
    res.status(200).json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memories', details: error });
  }
}

export async function createSharedSpace(req: Request, res: Response) {
  try {
    const parse = sharedSpaceSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid shared space data', details: parse.error.format() });
    }

    const space = await service.createSharedSpace(parse.data);
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shared space', details: error });
  }
}

export async function listSharedSpaces(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const spaces = await service.listSharedSpaces(userId);
    res.status(200).json(spaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list shared spaces', details: error });
  }
}

// src/controllers/journal.controller.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { logAdjusterInsight, logJournalEntry } from '@lib/logger';
import { z } from 'zod';

const journalSchema = z.object({
  userId: z.string(),
  content: z.string().min(10),
  phase: z.string().optional(),
});

export default async function journalHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parse = journalSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid journal data', details: parse.error.format() });
  }

  const { userId, content, phase } = parse.data;

  try {
    await logJournalEntry({ userId, content });

    const keywords = ['rupture', 'fragmented', 'betrayed', 'confused', 'grief'];
    const triggerDetected = keywords.some((word) =>
      content.toLowerCase().includes(word)
    );

    if (triggerDetected) {
      const adjusterReflection =
        'A resonance shift has been detected. What part of your story feels out of phase right now?';
      await logAdjusterInsight({ userId, content: adjusterReflection, phase });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Journal Handler] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
