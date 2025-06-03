"use strict";
// oracle-backend/src/routes/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Sign up
router.post('/signup', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, userData } = req.body;
    if (!email || !password)
        throw (0, errorHandler_1.createError)('Email and password are required', 400);
    const { data, error } = await server_1.supabase.auth.signUp({
        email,
        password,
        options: { data: userData },
    });
    if (error) {
        logger_1.logger.error('Signup error:', error);
        throw (0, errorHandler_1.createError)(error.message, 400);
    }
    res.status(201).json({ message: 'User created', user: data.user, session: data.session });
}));
// Sign in
router.post('/signin', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw (0, errorHandler_1.createError)('Email and password are required', 400);
    const { data, error } = await server_1.supabase.auth.signInWithPassword({ email, password });
    if (error) {
        logger_1.logger.error('Signin error:', error);
        throw (0, errorHandler_1.createError)(error.message, 401);
    }
    res.json({ message: 'Signed in', user: data.user, session: data.session });
}));
// Sign out
router.post('/signout', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const { error } = await server_1.supabase.auth.signOut();
    if (error)
        throw (0, errorHandler_1.createError)(error.message, 400);
    res.json({ message: 'Signed out' });
}));
// Magic link
router.post('/magic-link', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw (0, errorHandler_1.createError)('Email is required', 400);
    const { error } = await server_1.supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
    });
    if (error)
        throw (0, errorHandler_1.createError)(error.message, 400);
    res.json({ message: 'Magic link sent' });
}));
// Refresh token
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token)
        throw (0, errorHandler_1.createError)('Refresh token is required', 400);
    const { data, error } = await server_1.supabase.auth.refreshSession({ refresh_token });
    if (error)
        throw (0, errorHandler_1.createError)(error.message, 401);
    res.json({ message: 'Token refreshed', session: data.session });
}));
// Get profile
router.get('/profile', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw (0, errorHandler_1.createError)('User not found', 404);
    const { data: profile, error } = await server_1.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116')
        throw (0, errorHandler_1.createError)('Failed to fetch profile', 500);
    res.json({ user: req.user, profile: profile || null });
}));
// Update profile
router.put('/profile', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw (0, errorHandler_1.createError)('User not found', 404);
    const updates = req.body;
    const { data, error } = await server_1.supabase
        .from('user_profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date() })
        .select()
        .single();
    if (error)
        throw (0, errorHandler_1.createError)('Failed to update profile', 500);
    res.json({ message: 'Profile updated', profile: data });
}));
// Reset password
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw (0, errorHandler_1.createError)('Email is required', 400);
    const { error } = await server_1.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
    });
    if (error)
        throw (0, errorHandler_1.createError)(error.message, 400);
    res.json({ message: 'Password reset link sent' });
}));
// Update password
router.post('/update-password', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { password } = req.body;
    if (!password)
        throw (0, errorHandler_1.createError)('New password is required', 400);
    const { error } = await server_1.supabase.auth.updateUser({ password });
    if (error)
        throw (0, errorHandler_1.createError)(error.message, 400);
    res.json({ message: 'Password updated' });
}));
exports.default = router;
