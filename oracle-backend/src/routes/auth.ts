import express from 'express';
import { supabase } from '../server';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Sign up with email/password
router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, userData } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) {
    logger.error('Signup error:', error);
    throw createError(error.message, 400);
  }

  res.status(201).json({
    message: 'User created successfully',
    user: data.user,
    session: data.session,
  });
}));

// Sign in with email/password
router.post('/signin', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.error('Signin error:', error);
    throw createError(error.message, 401);
  }

  res.json({
    message: 'Signed in successfully',
    user: data.user,
    session: data.session,
  });
}));

// Sign out
router.post('/signout', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error('Signout error:', error);
    throw createError(error.message, 400);
  }

  res.json({ message: 'Signed out successfully' });
}));

// Send magic link
router.post('/magic-link', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
    },
  });

  if (error) {
    logger.error('Magic link error:', error);
    throw createError(error.message, 400);
  }

  res.json({ message: 'Magic link sent successfully' });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw createError('Refresh token is required', 400);
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token,
  });

  if (error) {
    logger.error('Token refresh error:', error);
    throw createError(error.message, 401);
  }

  res.json({
    message: 'Token refreshed successfully',
    session: data.session,
  });
}));

// Get current user profile
router.get('/profile', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not found', 404);
  }

  // Get user profile from your custom table if you have one
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Profile fetch error:', error);
    throw createError('Failed to fetch profile', 500);
  }

  res.json({
    user: req.user,
    profile: profile || null,
  });
}));

// Update user profile
router.put('/profile', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const updates = req.body;

  if (!userId) {
    throw createError('User not found', 404);
  }

  // Update user profile in your custom table
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date() })
    .select()
    .single();

  if (error) {
    logger.error('Profile update error:', error);
    throw createError('Failed to update profile', 500);
  }

  res.json({
    message: 'Profile updated successfully',
    profile: data,
  });
}));

// Reset password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw createError('Email is required', 400);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
  });

  if (error) {
    logger.error('Password reset error:', error);
    throw createError(error.message, 400);
  }

  res.json({ message: 'Password reset email sent successfully' });
}));

// Update password
router.post('/update-password', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { password } = req.body;

  if (!password) {
    throw createError('New password is required', 400);
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    logger.error('Password update error:', error);
    throw createError(error.message, 400);
  }

  res.json({ message: 'Password updated successfully' });
}));

export default router;