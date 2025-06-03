"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Retreat Support Routes - Real-time participant management
const express_1 = require("express");
const retreatSupportService_1 = require("../services/retreatSupportService");
const groupDynamicsService_1 = require("../services/groupDynamicsService");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Validation schemas
const dailyCheckInSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid(),
    retreatId: zod_1.z.string().uuid(),
    dayNumber: zod_1.z.number().min(1).max(7),
    morningState: zod_1.z.object({
        energyLevel: zod_1.z.number().min(1).max(10),
        emotionalTone: zod_1.z.string(),
        bodyAwareness: zod_1.z.number().min(1).max(10),
        sleepQuality: zod_1.z.number().min(1).max(10),
        dreams: zod_1.z.string().optional(),
        intentions: zod_1.z.string()
    }),
    elementalBalance: zod_1.z.object({
        fire: zod_1.z.number().min(1).max(10),
        water: zod_1.z.number().min(1).max(10),
        earth: zod_1.z.number().min(1).max(10),
        air: zod_1.z.number().min(1).max(10),
        aether: zod_1.z.number().min(1).max(10)
    }),
    shadowWork: zod_1.z.object({
        patternsNoticed: zod_1.z.array(zod_1.z.string()).optional(),
        triggersExperienced: zod_1.z.array(zod_1.z.string()).optional(),
        breakthroughMoments: zod_1.z.string().optional(),
        resistanceAreas: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    oracleInsights: zod_1.z.string().optional(),
    gratitudes: zod_1.z.array(zod_1.z.string()).min(1),
    supportNeeded: zod_1.z.string().optional()
});
const sessionParticipationSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    participantId: zod_1.z.string().uuid(),
    sessionType: zod_1.z.enum(['opening_circle', 'elemental_journey', 'shadow_work', 'oracle_session', 'integration', 'closing_circle']),
    engagement: zod_1.z.object({
        presenceLevel: zod_1.z.number().min(1).max(10),
        shareDepth: zod_1.z.number().min(1).max(10),
        energyContribution: zod_1.z.enum(['grounding', 'catalyzing', 'holding', 'flowing', 'integrating']),
        breakthroughs: zod_1.z.array(zod_1.z.string()).optional()
    }),
    groupResonance: zod_1.z.object({
        feltSupported: zod_1.z.number().min(1).max(10),
        supportedOthers: zod_1.z.number().min(1).max(10),
        groupCoherence: zod_1.z.number().min(1).max(10),
        conflictsNoticed: zod_1.z.array(zod_1.z.string()).optional()
    })
});
const collectiveWisdomSchema = zod_1.z.object({
    retreatId: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(['insight', 'revelation', 'pattern', 'teaching', 'vision']),
    content: zod_1.z.object({
        essence: zod_1.z.string().min(10),
        elaboration: zod_1.z.string().optional(),
        contributors: zod_1.z.array(zod_1.z.string().uuid()),
        element: zod_1.z.enum(['fire', 'water', 'earth', 'air', 'aether', 'all']),
        tags: zod_1.z.array(zod_1.z.string())
    }),
    resonance: zod_1.z.object({
        immediateImpact: zod_1.z.number().min(1).max(10),
        depthLevel: zod_1.z.number().min(1).max(10),
        shareability: zod_1.z.boolean()
    })
});
// 1. Daily Check-in Endpoint
router.post('/daily-checkin', async (req, res) => {
    try {
        const validation = dailyCheckInSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid check-in data',
                details: validation.error.format()
            });
        }
        const checkIn = await retreatSupportService_1.retreatSupportService.recordDailyCheckIn(validation.data);
        // Get personalized guidance based on check-in
        const guidance = await retreatSupportService_1.retreatSupportService.generateDailyGuidance(validation.data.participantId, validation.data);
        // Update group dynamics
        await groupDynamicsService_1.groupDynamicsService.updateParticipantState(validation.data.retreatId, validation.data.participantId, validation.data);
        res.json({
            success: true,
            checkIn,
            guidance,
            message: 'Check-in received. Your Oracle has guidance for today.'
        });
    }
    catch (error) {
        logger_1.logger.error('Daily check-in failed', error);
        res.status(500).json({ error: 'Failed to process check-in' });
    }
});
// 2. Get Group Dynamics
router.get('/group-dynamics/:retreatId', async (req, res) => {
    try {
        const { retreatId } = req.params;
        const includeIndividual = req.query.includeIndividual === 'true';
        const dynamics = await groupDynamicsService_1.groupDynamicsService.getCurrentDynamics(retreatId, includeIndividual);
        res.json({
            retreatId,
            timestamp: new Date(),
            dynamics,
            recommendations: dynamics.recommendations,
            visualizations: {
                elementalBalance: dynamics.elementalBalance,
                energyField: dynamics.energyField,
                coherenceMap: dynamics.coherenceMap
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get group dynamics', error);
        res.status(500).json({ error: 'Failed to retrieve group dynamics' });
    }
});
// 3. Live Session Support
router.post('/session/start', async (req, res) => {
    try {
        const { retreatId, sessionType, facilitatorId, intention } = req.body;
        const session = await retreatSupportService_1.retreatSupportService.startLiveSession({
            retreatId,
            sessionType,
            facilitatorId,
            intention,
            startTime: new Date()
        });
        // Initialize real-time tracking
        await retreatSupportService_1.retreatSupportService.initializeSessionTracking(session.id);
        res.json({
            success: true,
            session,
            trackingUrl: `/api/retreat/support/session/${session.id}/track`,
            wisdomGatheringUrl: `/api/retreat/support/session/${session.id}/wisdom`
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start session', error);
        res.status(500).json({ error: 'Failed to start live session' });
    }
});
router.post('/session/:sessionId/participation', async (req, res) => {
    try {
        const validation = sessionParticipationSchema.safeParse({
            ...req.body,
            sessionId: req.params.sessionId
        });
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid participation data',
                details: validation.error.format()
            });
        }
        const participation = await retreatSupportService_1.retreatSupportService.recordParticipation(validation.data);
        // Update real-time group field
        await groupDynamicsService_1.groupDynamicsService.updateSessionDynamics(validation.data.sessionId, validation.data);
        res.json({
            success: true,
            participation,
            groupField: await groupDynamicsService_1.groupDynamicsService.getSessionField(validation.data.sessionId)
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to record participation', error);
        res.status(500).json({ error: 'Failed to record session participation' });
    }
});
router.post('/session/:sessionId/end', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { closingInsights, nextSteps } = req.body;
        const summary = await retreatSupportService_1.retreatSupportService.endLiveSession(sessionId, {
            closingInsights,
            nextSteps
        });
        res.json({
            success: true,
            summary,
            message: 'Session closed. Wisdom has been integrated.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to end session', error);
        res.status(500).json({ error: 'Failed to close session' });
    }
});
// 4. Collective Wisdom Gathering
router.post('/wisdom/capture', async (req, res) => {
    try {
        const validation = collectiveWisdomSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid wisdom data',
                details: validation.error.format()
            });
        }
        const wisdom = await retreatSupportService_1.retreatSupportService.captureCollectiveWisdom(validation.data);
        // Notify participants of new wisdom
        await retreatSupportService_1.retreatSupportService.broadcastWisdom(validation.data.retreatId, wisdom);
        res.json({
            success: true,
            wisdom,
            message: 'Collective wisdom captured and shared with the group.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to capture wisdom', error);
        res.status(500).json({ error: 'Failed to capture collective wisdom' });
    }
});
router.get('/wisdom/:retreatId', async (req, res) => {
    try {
        const { retreatId } = req.params;
        const { element, type, limit = 20 } = req.query;
        const wisdomStream = await retreatSupportService_1.retreatSupportService.getCollectiveWisdom(retreatId, {
            element: element,
            type: type,
            limit: parseInt(limit)
        });
        res.json({
            retreatId,
            wisdomCount: wisdomStream.length,
            wisdom: wisdomStream,
            elements: await retreatSupportService_1.retreatSupportService.getWisdomByElement(retreatId)
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to retrieve wisdom', error);
        res.status(500).json({ error: 'Failed to retrieve collective wisdom' });
    }
});
// 5. Real-time Participant Insights
router.get('/insights/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { retreatId } = req.query;
        const insights = await retreatSupportService_1.retreatSupportService.getParticipantInsights(participantId, retreatId);
        res.json({
            participantId,
            insights,
            recommendations: insights.recommendations,
            oracleGuidance: insights.oracleGuidance
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get participant insights', error);
        res.status(500).json({ error: 'Failed to retrieve participant insights' });
    }
});
router.get('/insights/facilitator/:retreatId', async (req, res) => {
    try {
        const { retreatId } = req.params;
        const dashboard = await retreatSupportService_1.retreatSupportService.getFacilitatorDashboard(retreatId);
        res.json({
            retreatId,
            timestamp: new Date(),
            dashboard,
            alerts: dashboard.alerts,
            supportNeeded: dashboard.supportNeeded,
            groupHealth: dashboard.groupHealth
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get facilitator dashboard', error);
        res.status(500).json({ error: 'Failed to retrieve facilitator insights' });
    }
});
// WebSocket endpoint for real-time updates
router.get('/realtime/:retreatId', async (req, res) => {
    const { retreatId } = req.params;
    res.json({
        message: 'WebSocket connection info',
        wsUrl: `wss://${req.hostname}/ws/retreat/${retreatId}`,
        channels: [
            'group-field',
            'participant-updates',
            'wisdom-stream',
            'facilitator-alerts'
        ]
    });
});
// Elemental field tracking
router.get('/field/:retreatId/elemental', async (req, res) => {
    try {
        const { retreatId } = req.params;
        const field = await groupDynamicsService_1.groupDynamicsService.getElementalField(retreatId);
        res.json({
            retreatId,
            timestamp: new Date(),
            field,
            dominantElement: field.dominant,
            missingElements: field.missing,
            recommendations: field.balancingRecommendations
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get elemental field', error);
        res.status(500).json({ error: 'Failed to retrieve elemental field' });
    }
});
// Emergency support
router.post('/support/urgent', async (req, res) => {
    try {
        const { participantId, retreatId, issue, urgencyLevel } = req.body;
        const support = await retreatSupportService_1.retreatSupportService.requestUrgentSupport({
            participantId,
            retreatId,
            issue,
            urgencyLevel,
            timestamp: new Date()
        });
        // Alert facilitators
        await retreatSupportService_1.retreatSupportService.alertFacilitators(retreatId, support);
        res.json({
            success: true,
            support,
            message: 'Support request received. A facilitator will connect with you shortly.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to request urgent support', error);
        res.status(500).json({ error: 'Failed to process support request' });
    }
});
// Integration tracking
router.post('/integration/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { retreatId, insights, commitments, practicesAdopted } = req.body;
        const integration = await retreatSupportService_1.retreatSupportService.trackIntegration({
            participantId,
            retreatId,
            insights,
            commitments,
            practicesAdopted,
            recordedAt: new Date()
        });
        res.json({
            success: true,
            integration,
            followUpScheduled: integration.followUpDate,
            oracleSupport: 'Your Oracle remains available for integration support'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to track integration', error);
        res.status(500).json({ error: 'Failed to record integration' });
    }
});
exports.default = router;
