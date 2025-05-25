// /pages/api/adjuster/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, message, context, phase } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ error: 'Missing required fields: user_id and message' });
  }

  try {
    const { data, error } = await supabase.from('adjuster_logs').insert([
      {
        user_id,
        message,
        context: context || null,
        phase: phase || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Adjuster Log Error]', err);
    res.status(500).json({ error: 'Failed to log AdjusterAgent message.' });
  }
}
