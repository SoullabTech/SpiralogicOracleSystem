// 📁 File: src/routes/userProfile.routes.ts

import express, { Request, Response } from 'express';
import { profileService, UserProfile } from '../services/profileService';

const router = express.Router();

// GET /api/profile/:userId
router.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const profile = profileService.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  return res.status(200).json(profile);
});

// POST /api/profile/:userId
router.post('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates: Partial<UserProfile> = req.body;

  const updated = profileService.updateProfile(userId, updates);

  if (!updated) {
    return res.status(404).json({ error: 'Failed to update profile. User not found.' });
  }

  return res.status(200).json(updated);
});

export default router;
