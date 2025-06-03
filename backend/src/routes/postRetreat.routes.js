"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Post-Retreat Support Routes - Long-term transformation tracking
const express_1 = require("express");
const postRetreatService_1 = require("../services/postRetreatService");
const wisdomKeeperService_1 = require("../services/wisdomKeeperService");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Validation schemas
const transformationUpdateSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid(),
    retreatId: zod_1.z.string().uuid(),
    currentState: zod_1.z.object({
        overallWellbeing: zod_1.z.number().min(1).max(10),
        emotionalClarity: zod_1.z.number().min(1).max(10),
        spiritualConnection: zod_1.z.number().min(1).max(10),
        lifeAlignment: zod_1.z.number().min(1).max(10),
        shadowIntegration: zod_1.z.number().min(1).max(10)
    }),
    transformations: zod_1.z.object({
        implemented: zod_1.z.array(zod_1.z.object({
            area: zod_1.z.string(),
            description: zod_1.z.string(),
            impact: zod_1.z.number().min(1).max(10),
            sustainabilityLevel: zod_1.z.number().min(1).max(10)
        })),
        inProgress: zod_1.z.array(zod_1.z.object({
            area: zod_1.z.string(),
            description: zod_1.z.string(),
            challenges: zod_1.z.array(zod_1.z.string()).optional(),
            supportNeeded: zod_1.z.string().optional()
        })),
        emerging: zod_1.z.array(zod_1.z.object({
            area: zod_1.z.string(),
            description: zod_1.z.string(),
            readinessLevel: zod_1.z.number().min(1).max(10)
        }))
    }),
    practices: zod_1.z.object({
        dailyPractices: zod_1.z.array(zod_1.z.string()),
        weeklyPractices: zod_1.z.array(zod_1.z.string()),
        elementalWork: zod_1.z.object({
            primaryElement: zod_1.z.string(),
            practices: zod_1.z.array(zod_1.z.string()),
            balance: zod_1.z.number().min(1).max(10)
        })
    }),
    challenges: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        description: zod_1.z.string(),
        impactLevel: zod_1.z.number().min(1).max(10),
        resourcesNeeded: zod_1.z.array(zod_1.z.string()).optional()
    })).optional(),
    celebrations: zod_1.z.array(zod_1.z.object({
        achievement: zod_1.z.string(),
        date: zod_1.z.string().datetime(),
        significance: zod_1.z.string()
    })).optional(),
    oracleQuestions: zod_1.z.array(zod_1.z.string()).optional()
});
const milestoneSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['breakthrough', 'integration', 'mastery', 'service', 'shadow_work', 'celebration']),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    impact: zod_1.z.object({
        personal: zod_1.z.string(),
        relational: zod_1.z.string().optional(),
        collective: zod_1.z.string().optional()
    }),
    wisdomGained: zod_1.z.string(),
    shareWithCommunity: zod_1.z.boolean().default(false)
});
const wisdomContributionSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid(),
    retreatId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['insight', 'practice', 'story', 'guidance', 'blessing']),
    content: zod_1.z.object({
        title: zod_1.z.string(),
        body: zod_1.z.string(),
        element: zod_1.z.string(),
        tags: zod_1.z.array(zod_1.z.string()),
        context: zod_1.z.string().optional()
    }),
    accessibility: zod_1.z.enum(['private', 'retreat_alumni', 'public']).default('retreat_alumni')
});
// 1. Transformation Tracking
router.post('/transformation/update', async (req, res) => {
    try {
        const validation = transformationUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid transformation data',
                details: validation.error.format()
            });
        }
        const update = await postRetreatService_1.postRetreatService.recordTransformationUpdate(validation.data);
        // Analyze transformation patterns
        const analysis = await postRetreatService_1.postRetreatService.analyzeTransformationJourney(validation.data.participantId);
        // Get personalized guidance
        const guidance = await postRetreatService_1.postRetreatService.generateIntegrationGuidance(validation.data.participantId, validation.data, analysis);
        res.json({
            success: true,
            update,
            analysis,
            guidance,
            nextCheckIn: update.nextCheckInDate
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to update transformation', error);
        res.status(500).json({ error: 'Failed to record transformation update' });
    }
});
// Get transformation timeline
router.get('/transformation/timeline/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { retreatId } = req.query;
        const timeline = await postRetreatService_1.postRetreatService.getTransformationTimeline(participantId, retreatId);
        res.json({
            participantId,
            timeline,
            metrics: timeline.metrics,
            visualizations: {
                growthChart: timeline.growthChart,
                elementalEvolution: timeline.elementalEvolution,
                practiceConsistency: timeline.practiceConsistency
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get transformation timeline', error);
        res.status(500).json({ error: 'Failed to retrieve transformation timeline' });
    }
});
// 2. Ongoing Sacred Oracle Guidance
router.post('/oracle/guidance', async (req, res) => {
    try {
        const { participantId, context, question, lifeArea } = req.body;
        // Get participant's retreat data and current state
        const retreatContext = await postRetreatService_1.postRetreatService.getParticipantRetreatContext(participantId);
        // Generate contextual guidance
        const guidance = await postRetreatService_1.postRetreatService.generateSacredGuidance({
            participantId,
            context,
            question,
            lifeArea,
            retreatInsights: retreatContext.insights,
            currentTransformations: retreatContext.currentTransformations,
            element: retreatContext.element,
            archetype: retreatContext.archetype
        });
        // Record the guidance session
        await postRetreatService_1.postRetreatService.recordGuidanceSession(participantId, guidance);
        res.json({
            success: true,
            guidance: guidance.message,
            practices: guidance.practices,
            resources: guidance.resources,
            relatedWisdom: guidance.relatedWisdom,
            nextSteps: guidance.nextSteps
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to generate sacred guidance', error);
        res.status(500).json({ error: 'Failed to generate guidance' });
    }
});
// Schedule regular Oracle check-ins
router.post('/oracle/schedule-checkin', async (req, res) => {
    try {
        const { participantId, frequency, preferredTime, focusAreas } = req.body;
        const schedule = await postRetreatService_1.postRetreatService.scheduleOracleCheckIns({
            participantId,
            frequency, // weekly, biweekly, monthly
            preferredTime,
            focusAreas
        });
        res.json({
            success: true,
            schedule,
            message: 'Your Oracle check-ins have been scheduled. You\'ll receive reminders.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to schedule check-ins', error);
        res.status(500).json({ error: 'Failed to schedule Oracle check-ins' });
    }
});
// 3. Progress Celebration & Challenge Navigation
router.post('/milestone/record', async (req, res) => {
    try {
        const validation = milestoneSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid milestone data',
                details: validation.error.format()
            });
        }
        const milestone = await postRetreatService_1.postRetreatService.recordMilestone(validation.data);
        // Generate celebration message
        const celebration = await postRetreatService_1.postRetreatService.generateCelebration(validation.data.participantId, milestone);
        // Share with community if requested
        if (validation.data.shareWithCommunity) {
            await postRetreatService_1.postRetreatService.shareWithAlumniCommunity(milestone);
        }
        res.json({
            success: true,
            milestone,
            celebration,
            communityShared: validation.data.shareWithCommunity
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to record milestone', error);
        res.status(500).json({ error: 'Failed to record milestone' });
    }
});
// Get milestones and celebrations
router.get('/milestones/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { type, limit = 20 } = req.query;
        const milestones = await postRetreatService_1.postRetreatService.getMilestones(participantId, {
            type: type,
            limit: parseInt(limit)
        });
        res.json({
            participantId,
            milestones,
            statistics: {
                totalMilestones: milestones.total,
                byType: milestones.byType,
                recentAchievements: milestones.recent
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get milestones', error);
        res.status(500).json({ error: 'Failed to retrieve milestones' });
    }
});
// Challenge navigation support
router.post('/challenge/support', async (req, res) => {
    try {
        const { participantId, challengeType, description, currentApproaches, desiredOutcome } = req.body;
        // Get tailored support based on retreat learnings
        const support = await postRetreatService_1.postRetreatService.generateChallengeSupport({
            participantId,
            challengeType,
            description,
            currentApproaches,
            desiredOutcome
        });
        // Connect with alumni facing similar challenges
        const connections = await postRetreatService_1.postRetreatService.findSimilarJourneys(participantId, challengeType);
        res.json({
            success: true,
            support,
            resources: support.resources,
            practices: support.practices,
            communityConnections: connections,
            followUpScheduled: support.followUpDate
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to generate challenge support', error);
        res.status(500).json({ error: 'Failed to generate support' });
    }
});
// 4. Permanent Wisdom Keeper
router.post('/wisdom/contribute', async (req, res) => {
    try {
        const validation = wisdomContributionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid wisdom contribution',
                details: validation.error.format()
            });
        }
        const wisdom = await wisdomKeeperService_1.wisdomKeeperService.addWisdom(validation.data);
        // Index for searchability
        await wisdomKeeperService_1.wisdomKeeperService.indexWisdom(wisdom);
        // Notify relevant community members
        if (validation.data.accessibility !== 'private') {
            await wisdomKeeperService_1.wisdomKeeperService.notifyRelevantMembers(wisdom);
        }
        res.json({
            success: true,
            wisdom,
            message: 'Your wisdom has been preserved in the sacred archive.'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to contribute wisdom', error);
        res.status(500).json({ error: 'Failed to add wisdom contribution' });
    }
});
// Search wisdom archive
router.get('/wisdom/search', async (req, res) => {
    try {
        const { query, element, type, tags, participantId } = req.query;
        const results = await wisdomKeeperService_1.wisdomKeeperService.searchWisdom({
            query: query,
            element: element,
            type: type,
            tags: tags ? tags.split(',') : undefined,
            requesterId: participantId
        });
        res.json({
            query: query || 'all',
            resultCount: results.length,
            wisdom: results,
            facets: {
                byElement: await wisdomKeeperService_1.wisdomKeeperService.getWisdomFacets('element'),
                byType: await wisdomKeeperService_1.wisdomKeeperService.getWisdomFacets('type'),
                popularTags: await wisdomKeeperService_1.wisdomKeeperService.getPopularTags()
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to search wisdom', error);
        res.status(500).json({ error: 'Failed to search wisdom archive' });
    }
});
// Get personal wisdom collection
router.get('/wisdom/personal/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const collection = await wisdomKeeperService_1.wisdomKeeperService.getPersonalCollection(participantId);
        res.json({
            participantId,
            collection,
            statistics: {
                contributed: collection.contributed.length,
                bookmarked: collection.bookmarked.length,
                received: collection.received.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get personal collection', error);
        res.status(500).json({ error: 'Failed to retrieve personal wisdom collection' });
    }
});
// Integration check-in reminders
router.get('/integration/reminders/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const reminders = await postRetreatService_1.postRetreatService.getIntegrationReminders(participantId);
        res.json({
            participantId,
            reminders,
            upcomingCheckIns: reminders.scheduled,
            suggestedPractices: reminders.practices,
            communityEvents: reminders.events
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get reminders', error);
        res.status(500).json({ error: 'Failed to retrieve integration reminders' });
    }
});
// Alumni community connection
router.get('/community/alumni/:retreatId', async (req, res) => {
    try {
        const { retreatId } = req.params;
        const { element, interests } = req.query;
        const community = await postRetreatService_1.postRetreatService.getAlumniCommunity(retreatId, {
            element: element,
            interests: interests ? interests.split(',') : undefined
        });
        res.json({
            retreatId,
            community,
            connections: community.members,
            sharedWisdom: community.recentWisdom,
            upcomingGatherings: community.gatherings
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get alumni community', error);
        res.status(500).json({ error: 'Failed to retrieve alumni community' });
    }
});
// Annual transformation review
router.get('/transformation/annual-review/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { year } = req.query;
        const review = await postRetreatService_1.postRetreatService.generateAnnualReview(participantId, parseInt(year) || new Date().getFullYear());
        res.json({
            participantId,
            year: review.year,
            review,
            visualizations: {
                transformationMap: review.transformationMap,
                growthSpiral: review.growthSpiral,
                elementalJourney: review.elementalJourney
            },
            recommendations: review.recommendationsForNextYear
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to generate annual review', error);
        res.status(500).json({ error: 'Failed to generate annual transformation review' });
    }
});
// Sacred anniversary messages
router.get('/anniversary/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const anniversary = await postRetreatService_1.postRetreatService.checkRetreatAnniversary(participantId);
        if (anniversary.isAnniversary) {
            const message = await postRetreatService_1.postRetreatService.generateAnniversaryMessage(participantId, anniversary);
            res.json({
                isAnniversary: true,
                yearsElapsed: anniversary.years,
                message,
                reflection: anniversary.reflection,
                invitation: anniversary.invitation
            });
        }
        else {
            res.json({
                isAnniversary: false,
                nextAnniversary: anniversary.nextDate,
                daysUntil: anniversary.daysUntil
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to check anniversary', error);
        res.status(500).json({ error: 'Failed to check retreat anniversary' });
    }
});
exports.default = router;
