// /pages/api/beta-invite.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const { data, error } = await supabase
    .from('beta_invites')
    .insert([{ email }]);

  if (error) {
    console.error('Beta invite error:', error);
    return res.status(500).json({ error: 'Failed to save invite' });
  }

  return res.status(200).json({ message: 'Invite received' });
}