// src/routes/auth.routes.ts
import { Router } from 'express';
import { initializeUserIfNeeded } from '@/services/userService';

const router = Router();

router.post('/auth/initialize', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  await initializeUserIfNeeded(user_id);
  res.json({ success: true });
});

export default router;
