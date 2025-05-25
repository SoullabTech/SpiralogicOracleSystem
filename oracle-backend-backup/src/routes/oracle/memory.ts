// oracle-backend/routes/oracle/memory.ts

import express from 'express';
import { supabase } from '@/lib/supabaseClient';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, type, content, element, source } = req.body;

  if (!userId || !type || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase.from('oracle_memories').insert([
    {
      user_id: userId,
      type,
      content,
      element,
      source,
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ status: 'memory logged' });
});

export default router;
