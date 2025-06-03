// ✅ 1. BACKEND API ROUTE - Create `/backend/server/routes/journal.routes.ts`

import { Router } from 'express';
import { supabase } from '@/lib/supabaseClient';

const router = Router();

// GET /journal?userId=xyz
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// POST /journal/create
router.post('/create', async (req, res) => {
  const { userId, content, mood, elemental_tag, archetype_tag, petalSnapshot } = req.body;
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ user_id: userId, content, mood, elemental_tag, archetype_tag, metadata: { petalSnapshot } }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

export default router;