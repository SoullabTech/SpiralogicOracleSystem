// oracle-backend/api/adjuster/log.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { triggerDailyJournalProcessing } from '@/server/tasks/prefect';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, message, phase, entry_text } = req.body;

  if (!user_id || !entry_text) {
    return res.status(400).json({ error: 'Missing user_id or entry_text' });
  }

  try {
    const result = await triggerDailyJournalProcessing({ user_id, entry_text });

    if (result.status === 'error') {
      throw new Error('Failed to trigger Prefect flow');
    }

    return res.status(200).json({
      status: 'logged',
      run_id: result.run_id,
      phase,
      message,
    });
  } catch (err: any) {
    console.error('Error in adjuster/log handler:', err);
    return res.status(500).json({ error: err.message });
  }
}
