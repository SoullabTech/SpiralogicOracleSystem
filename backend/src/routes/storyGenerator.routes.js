"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elementalOracleService_1 = require("../services/elementalOracleService");
const oracleLogger_1 = require("../utils/oracleLogger");
const authenticate_1 = require("../middleware/authenticate");
const profileService_1 = require("../services/profileService");
const memoryService_1 = require("../services/memoryService");
const router = (0, express_1.Router)();
// 🔒 All routes below require authentication
router.use(authenticate_1.authenticate);
/**
 * POST /api/oracle/story-generator
 * Generates a symbolic narrative based on user's elemental profile and memories.
 */
router.post('/', async (req, res) => {
    try {
        const { userId, elementalTheme, archetype, focusArea = 'personal growth', depthLevel = 3, } = req.body;
        // Step 1: Validate inputs
        if (!userId || !elementalTheme || !archetype) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        // Step 2: Fetch user profile
        const profile = await (0, profileService_1.getUserProfile)(userId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found.' });
        }
        // Step 3: Fetch symbolic memories
        const memories = await (0, memoryService_1.getRelevantMemories)(userId, elementalTheme, 5);
        // Step 4: Build generation context
        const context = {
            userId,
            elementalProfile: {
                fire: profile.fire,
                water: profile.water,
                earth: profile.earth,
                air: profile.air,
                aether: profile.aether,
            },
            crystalFocus: profile.crystal_focus ?? {},
            memories,
            phase: 'story',
        };
        // Step 5: Generate story via Oracle engine
        const story = await elementalOracleService_1.elementalOracle.generateStory({ elementalTheme, archetype, focusArea, depthLevel }, context);
        // Step 6: Format story output
        const content = [
            story.narrative.trim(),
            '\nReflections:',
            ...story.reflections.map(r => `- ${r}`),
            '\nSymbols:',
            ...story.symbols.map(s => `- ${s}`),
        ].join('\n');
        const response = {
            content,
            provider: 'elemental-oracle',
            model: 'gpt-4',
            confidence: 0.9,
            metadata: {
                archetype,
                focusArea,
                depthLevel,
                reflections: story.reflections,
                symbols: story.symbols,
                element: elementalTheme,
                phase: 'story',
            },
        };
        // Step 7: Persist in memory log
        await (0, memoryService_1.storeMemoryItem)({
            content,
            element: elementalTheme,
            sourceAgent: 'elemental-oracle',
            clientId: userId,
            confidence: 0.9,
            metadata: response.metadata,
        });
        // Step 8: Log in insight history
        await (0, oracleLogger_1.logOracleInsight)({
            userId,
            insightType: 'story_generation',
            content,
            metadata: response.metadata,
        });
        return res.json({ success: true, response });
    }
    catch (err) {
        console.error('❌ Error in story-generator:', err.message || err);
        return res.status(500).json({ error: 'Failed to generate story.' });
    }
});
exports.default = router;
