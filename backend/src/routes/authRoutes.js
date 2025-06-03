"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = require("../config/index"); // Corrected import path
const validate_1 = require("../middleware/validate"); // Correct import path
const auth_1 = require("../schemas/auth"); // Correct import path
const logger_1 = __importDefault(require("../utils/logger")); // Correct import path
const router = (0, express_1.Router)();
const supabase = (0, supabase_js_1.createClient)(index_1.config.supabase.url, index_1.config.supabase.anonKey);
router.post('/login', (0, validate_1.validate)(auth_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error || !user || !session) {
            return res.status(401).json({ error: error?.message || 'Authentication failed' });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email
            },
            session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login failed', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Login failed'
        });
    }
});
router.post('/refresh', (0, validate_1.validate)(auth_1.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const { data: { session }, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });
        if (error || !session) {
            return res.status(401).json({ error: error?.message || 'Invalid refresh token' });
        }
        res.json({
            session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token
            }
        });
    }
    catch (error) {
        logger_1.default.error('Token refresh failed', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Token refresh failed'
        });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        logger_1.default.error('Logout failed', { error });
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Logout failed'
        });
    }
});
exports.default = router;
