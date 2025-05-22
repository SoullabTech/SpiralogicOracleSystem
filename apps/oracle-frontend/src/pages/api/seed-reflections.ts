// pages/api/seed-reflections.ts

import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { error } = await supabase.from('spiralogic_reflections').insert([
    {
      user_id: '2e7208b5-d58d-4c27-a267-5f5a60dc622c',
      petal: 'The Explorer',
      element: 'Fire',
      quote: 'Let the unknown become your fire.',
      note: 'I feel ready to move forward into a new phase of life.',
      mode: 'state',
      created_at: '2025-05-20T10:34:00+00:00',
    },
    {
      user_id: '2e7208b5-d58d-4c27-a267-5f5a60dc622c',
      petal: 'The Fathomer',
      element: 'Water',
      quote: 'Beneath your waters lies your truth.',
      note: 'I’m recognizing a pattern that comes from deep grief.',
      mode: 'phase',
      created_at: '2025-05-20T11:02:00+00:00',
    }
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to seed reflections' });
  }

  return res.status(200).json({ message: 'Seed successful' });
}
