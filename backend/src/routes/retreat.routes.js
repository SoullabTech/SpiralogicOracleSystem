"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Switzerland Retreat Onboarding Routes
const express_1 = require("express");
const retreatOnboardingService_1 = require("../services/retreatOnboardingService");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Validation schemas
const registrationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    preferredName: zod_1.z.string().optional(),
    retreatId: zod_1.z.string().uuid(),
    arrivalDate: zod_1.z.string().datetime(),
    departureDate: zod_1.z.string().datetime(),
    dietaryRestrictions: zod_1.z.array(zod_1.z.string()).optional(),
    specialNeeds: zod_1.z.array(zod_1.z.string()).optional()
});
const currentStateSchema = zod_1.z.object({
    emotionalTone: zod_1.z.string().min(1),
    energyLevel: zod_1.z.number().min(1).max(10),
    primaryChallenge: zod_1.z.string().optional(),
    seekingGuidanceOn: zod_1.z.array(zod_1.z.string()).optional()
});
const intentionsSchema = zod_1.z.object({
    primaryIntention: zod_1.z.string().min(10),
    secondaryIntentions: zod_1.z.array(zod_1.z.string()).optional(),
    desiredOutcomes: zod_1.z.array(zod_1.z.string()).min(1),
    openToExploring: zod_1.z.array(zod_1.z.string()).optional()
});
// Register for retreat
router.post('/register', async (req, res) => {
    try {
        const validation = registrationSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid registration data',
                details: validation.error.format()
            });
        }
        const data = validation.data;
        const participant = await retreatOnboardingService_1.retreatOnboardingService.initializeOnboarding(data.email, data.firstName, data.lastName, data.retreatId, new Date(data.arrivalDate), new Date(data.departureDate));
        res.status(201).json({
            success: true,
            participant: {
                id: participant.id,
                firstName: participant.firstName,
                onboardingStatus: participant.onboardingStatus
            },
            message: 'Welcome to the sacred journey. Check your messages for a personal welcome from Kelly.',
            nextStep: '/api/retreat/overview'
        });
    }
    catch (error) {
        logger_1.logger.error('Retreat registration failed', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'Please try again or contact support'
        });
    }
});
// Get retreat overview
router.get('/overview/:retreatId', async (req, res) => {
    try {
        const retreat = await retreatOnboardingService_1.retreatOnboardingService.getRetreatOverview(req.params.retreatId);
        if (!retreat) {
            return res.status(404).json({ error: 'Retreat not found' });
        }
        res.json({
            retreat,
            message: 'Welcome to your transformational journey'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get retreat overview', error);
        res.status(500).json({ error: 'Failed to load retreat details' });
    }
});
// Submit current state assessment
router.post('/:participantId/current-state', async (req, res) => {
    try {
        const validation = currentStateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid state data',
                details: validation.error.format()
            });
        }
        await retreatOnboardingService_1.retreatOnboardingService.captureCurrentState(req.params.participantId, validation.data);
        res.json({
            success: true,
            message: 'Thank you for sharing where you are. This helps us prepare the perfect container for your transformation.',
            nextStep: '/api/retreat/intentions'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to capture current state', error);
        res.status(500).json({ error: 'Failed to save your current state' });
    }
});
// Submit retreat intentions
router.post('/:participantId/intentions', async (req, res) => {
    try {
        const validation = intentionsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid intentions data',
                details: validation.error.format()
            });
        }
        await retreatOnboardingService_1.retreatOnboardingService.captureIntentions(req.params.participantId, validation.data);
        res.json({
            success: true,
            message: 'Your intentions have been witnessed and woven into the retreat container. Kelly has a personal reflection waiting for you.',
            nextStep: '/api/retreat/oracle-assignment'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to capture intentions', error);
        res.status(500).json({ error: 'Failed to save your intentions' });
    }
});
// Assign Personal Oracle
router.post('/:participantId/assign-oracle', async (req, res) => {
    try {
        const assignment = await retreatOnboardingService_1.retreatOnboardingService.assignPersonalOracle(req.params.participantId);
        res.json({
            success: true,
            oracle: assignment,
            message: `Your Personal Oracle has been assigned! Meet your ${assignment.element} guide: ${assignment.archetype}. Kelly has prepared a special introduction for you.`,
            nextStep: '/api/retreat/complete'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to assign Personal Oracle', error);
        res.status(500).json({ error: 'Failed to assign your Personal Oracle' });
    }
});
// Complete onboarding
router.post('/:participantId/complete', async (req, res) => {
    try {
        await retreatOnboardingService_1.retreatOnboardingService.completeOnboarding(req.params.participantId);
        res.json({
            success: true,
            message: 'Your preparation is complete! The mountains are calling, and we cannot wait to meet you in person.',
            resources: {
                oracleChat: '/api/oracle/personal',
                retreatInfo: '/api/retreat/info',
                communitySpace: '/api/community/retreat'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to complete onboarding', error);
        res.status(500).json({ error: 'Failed to complete onboarding' });
    }
});
// Get participant progress
router.get('/:participantId/progress', async (req, res) => {
    try {
        const progress = await retreatOnboardingService_1.retreatOnboardingService.getParticipantProgress(req.params.participantId);
        res.json({
            participant: progress.participant,
            onboarding: progress.onboardingFlow,
            messages: progress.messages,
            percentComplete: calculateProgressPercentage(progress.onboardingFlow)
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get participant progress', error);
        res.status(500).json({ error: 'Failed to load progress' });
    }
});
// Daily guidance from Kelly
router.get('/:participantId/daily-guidance/:day', async (req, res) => {
    try {
        const { participantId, day } = req.params;
        const dayNumber = parseInt(day);
        // Get participant
        const progress = await retreatOnboardingService_1.retreatOnboardingService.getParticipantProgress(participantId);
        if (!progress.participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }
        // Get daily theme (would come from retreat schedule in production)
        const dailyThemes = [
            'Arrival and Sacred Opening',
            'Elemental Assessment and Integration',
            'Shadow Work and Transformation',
            'Vision Quest and Future Self',
            'Integration and Sacred Closing'
        ];
        const theme = dailyThemes[dayNumber - 1] || 'Deep Presence';
        // Get guidance from founder
        const { soullabFounderAgent } = await Promise.resolve().then(() => __importStar(require('../core/agents/soullabFounderAgent')));
        const guidance = await soullabFounderAgent.offerDailyGuidance(progress.participant, dayNumber, theme);
        res.json({
            day: dayNumber,
            theme,
            guidance: guidance.content,
            participant: {
                name: progress.participant.preferredName || progress.participant.firstName,
                element: progress.participant.oracleElement
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get daily guidance', error);
        res.status(500).json({ error: 'Failed to get daily guidance' });
    }
});
// Helper function to calculate progress
function calculateProgressPercentage(flow) {
    const totalSteps = 7;
    const completedSteps = flow?.completedSteps?.length || 0;
    return Math.round((completedSteps / totalSteps) * 100);
}
exports.default = router;
