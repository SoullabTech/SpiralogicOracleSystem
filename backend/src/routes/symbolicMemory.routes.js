import { Router } from 'express';
import memoryModule from '../utils/memoryModule';
import { authenticateToken } from '../middleware/authenticateToken';
const router = Router();
// POST /symbolic-tags
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { symbol, agent, metadata } = req.body;
    if (!symbol || !agent) {
        return res.status(400).json({ error: 'Missing symbol or agent' });
    }
    try {
        await memoryModule.storeTag({ userId, symbol, agent, metadata });
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('❌ Error storing tag:', err);
        res.status(500).json({ error: 'Failed to store tag' });
    }
});
// GET /symbolic-tags
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tags = await memoryModule.getAllSymbolicTags(req.user.id);
        res.json({ tags });
    }
    catch (err) {
        console.error('❌ Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to retrieve symbolic tags' });
    }
});
export default router;
