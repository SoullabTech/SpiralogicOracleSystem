"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const profileService_1 = require("../services/profileService");
const router = (0, express_1.Router)();
// Public route for basic health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Spiralogic Oracle backend is running',
        timestamp: new Date().toISOString(),
    });
});
// All routes below this require authentication
router.use(authenticate_1.authenticate);
/**
 * POST /update-profile
 * Body: { fire, water, earth, air, aether, crystal_focus }
 */
router.post('/update-profile', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'No user found in token' });
        }
        const { fire, water, earth, air, aether, crystal_focus } = req.body;
        if ([fire, water, earth, air, aether].some((n) => typeof n !== 'number' || n < 0 || n > 100)) {
            return res.status(400).json({ message: 'Profile validation failed' });
        }
        const updatedProfile = await (0, profileService_1.updateUserProfile)(userId, {
            user_id: userId,
            fire,
            water,
            earth,
            air,
            aether,
            crystal_focus,
            updated_at: new Date().toISOString(),
        });
        res.status(200).json(updatedProfile);
    }
    catch (err) {
        console.error('❌ Error in /update-profile:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
/**
 * GET /profile → Get current user profile
 */
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthenticated' });
        }
        const profile = await (0, profileService_1.getUserProfile)(userId);
        res.status(200).json(profile);
    }
    catch (err) {
        console.error('❌ Error fetching profile:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
/**
 * GET /profile/stats → Get elemental stats for visualization
 */
router.get('/profile/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthenticated' });
        }
        const stats = await (0, profileService_1.getProfileStats)(userId);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error fetching profile stats:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
