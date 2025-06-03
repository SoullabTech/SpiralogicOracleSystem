"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elementalAssessmentService_js_1 = require("../services/elementalAssessmentService.js");
const oraclePersonalizationEngine_js_1 = require("../services/oraclePersonalizationEngine.js");
const retreatModeManager_js_1 = require("../services/retreatModeManager.js");
const participantContextService_js_1 = require("../services/participantContextService.js");
const retreatOnboardingService_js_1 = require("../services/retreatOnboardingService.js");
const authenticateToken_js_1 = require("../middleware/authenticateToken.js");
const logger_js_1 = require("../utils/logger.js");
const router = (0, express_1.Router)();
// Initialize services
const assessmentService = new elementalAssessmentService_js_1.ElementalAssessmentService();
const personalizationEngine = new oraclePersonalizationEngine_js_1.OraclePersonalizationEngine();
const retreatModeManager = new retreatModeManager_js_1.RetreatModeManager();
const contextService = new participantContextService_js_1.ParticipantContextService();
const onboardingService = new retreatOnboardingService_js_1.RetreatOnboardingService();
// Apply authentication to all routes
router.use(authenticateToken_js_1.authenticateToken);
// Get elemental assessment for participant
router.post('/assessment/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const additionalData = req.body;
        // Get participant data
        const participant = await onboardingService.getParticipant(participantId);
        if (!participant.success || !participant.participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }
        // Perform elemental assessment
        const assessment = await assessmentService.assessParticipant(participant.participant, additionalData);
        logger_js_1.logger.info(`Elemental assessment completed for ${participantId}`, {
            primaryElement: Object.entries(assessment.elementalScores)
                .reduce((a, b) => assessment.elementalScores[a[0]] > assessment.elementalScores[b[0]] ? a : b)[0],
            crystallizationLevel: assessment.crystallizationLevel
        });
        res.json({
            success: true,
            assessment,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Assessment endpoint error', error);
        res.status(500).json({
            error: 'Failed to complete assessment',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Create personalized Oracle match
router.post('/match/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { additionalContext } = req.body;
        // Get participant data
        const participant = await onboardingService.getParticipant(participantId);
        if (!participant.success || !participant.participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }
        // Create personalized Oracle match
        const oracleMatch = await personalizationEngine.createPersonalizedOracle(participant.participant, additionalContext);
        // Store the context
        await contextService.storeParticipantContext(participantId, oracleMatch.participantContext, 'oracle_matching');
        logger_js_1.logger.info(`Oracle match created for ${participantId}`, {
            oracleName: oracleMatch.oraclePersonality.name,
            primaryElement: Object.entries(oracleMatch.elementalAssessment.elementalScores)
                .reduce((a, b) => oracleMatch.elementalAssessment.elementalScores[a[0]] > oracleMatch.elementalAssessment.elementalScores[b[0]] ? a : b)[0]
        });
        res.json({
            success: true,
            oracleMatch,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Oracle matching endpoint error', error);
        res.status(500).json({
            error: 'Failed to create Oracle match',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Activate retreat mode for participant's Oracle
router.post('/activate/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { mode, sessionContext, activatedBy } = req.body;
        if (!['pre-retreat', 'retreat-active', 'post-retreat'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid retreat mode' });
        }
        // Get participant and Oracle match
        const participant = await onboardingService.getParticipant(participantId);
        if (!participant.success || !participant.participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }
        // Get or create Oracle match
        let oracleMatch;
        try {
            // Try to get existing match first
            const contextResult = await contextService.retrieveParticipantContext(participantId);
            if (contextResult.success && contextResult.context) {
                // Recreation from stored context - would need to rebuild match
                oracleMatch = await personalizationEngine.createPersonalizedOracle(participant.participant, contextResult.context);
            }
            else {
                // Create new match
                oracleMatch = await personalizationEngine.createPersonalizedOracle(participant.participant);
                await contextService.storeParticipantContext(participantId, oracleMatch.participantContext, 'retreat_activation');
            }
        }
        catch (error) {
            logger_js_1.logger.error('Error getting/creating Oracle match for activation', error);
            return res.status(500).json({ error: 'Failed to prepare Oracle for activation' });
        }
        // Activate retreat mode
        const oracleAgent = await retreatModeManager.activateRetreatMode(participant.participant, oracleMatch, mode, activatedBy || 'api', sessionContext);
        const insights = await oracleAgent.getPersonalizationInsights();
        res.json({
            success: true,
            message: `Retreat mode '${mode}' activated successfully`,
            oracleInsights: insights,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Retreat activation endpoint error', error);
        res.status(500).json({
            error: 'Failed to activate retreat mode',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Transition retreat mode
router.post('/transition/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { newMode, transitionedBy } = req.body;
        if (!['pre-retreat', 'retreat-active', 'post-retreat'].includes(newMode)) {
            return res.status(400).json({ error: 'Invalid retreat mode' });
        }
        await retreatModeManager.transitionMode(participantId, newMode, transitionedBy || 'api');
        res.json({
            success: true,
            message: `Transitioned to ${newMode} mode`,
            participantId,
            newMode
        });
    }
    catch (error) {
        logger_js_1.logger.error('Mode transition endpoint error', error);
        res.status(500).json({
            error: 'Failed to transition mode',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Deactivate retreat mode
router.post('/deactivate/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        await retreatModeManager.deactivateRetreatMode(participantId);
        res.json({
            success: true,
            message: 'Retreat mode deactivated',
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Deactivation endpoint error', error);
        res.status(500).json({
            error: 'Failed to deactivate retreat mode',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Emergency deactivation
router.post('/emergency-deactivate/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { reason, deactivatedBy } = req.body;
        if (!reason) {
            return res.status(400).json({ error: 'Reason required for emergency deactivation' });
        }
        await retreatModeManager.emergencyDeactivation(participantId, reason, deactivatedBy || 'api');
        res.json({
            success: true,
            message: 'Emergency deactivation completed',
            participantId,
            reason
        });
    }
    catch (error) {
        logger_js_1.logger.error('Emergency deactivation endpoint error', error);
        res.status(500).json({
            error: 'Failed to perform emergency deactivation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Process Oracle interaction
router.post('/interact/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { query, sessionContext } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        const response = await retreatModeManager.processOracleInteraction(participantId, query, sessionContext);
        res.json({
            success: true,
            response,
            participantId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger_js_1.logger.error('Oracle interaction endpoint error', error);
        if (error instanceof Error && error.message.includes('No active Oracle')) {
            return res.status(404).json({
                error: 'No active Oracle found for participant',
                message: 'Please activate retreat mode first'
            });
        }
        res.status(500).json({
            error: 'Failed to process Oracle interaction',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get Oracle status
router.get('/status/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const status = await retreatModeManager.getModeStatus(participantId);
        if (!status) {
            return res.status(404).json({
                error: 'No Oracle status found for participant'
            });
        }
        // Get Oracle insights if active
        let oracleInsights;
        if (status.oracleAgent) {
            oracleInsights = await status.oracleAgent.getPersonalizationInsights();
        }
        res.json({
            success: true,
            status: {
                ...status,
                oracleAgent: undefined // Don't serialize the agent object
            },
            oracleInsights,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Status endpoint error', error);
        res.status(500).json({
            error: 'Failed to get Oracle status',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Update participant context
router.put('/context/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { contextUpdates, updatedBy } = req.body;
        const result = await contextService.updateParticipantContext(participantId, contextUpdates, updatedBy, 'api_update');
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        // Update Oracle agent context if active
        await retreatModeManager.updateParticipantContext(participantId, contextUpdates);
        res.json({
            success: true,
            message: 'Context updated successfully',
            contextId: result.contextId,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Context update endpoint error', error);
        res.status(500).json({
            error: 'Failed to update context',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get participant context
router.get('/context/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const result = await contextService.retrieveParticipantContext(participantId);
        if (!result.success) {
            return res.status(404).json({ error: result.error });
        }
        res.json({
            success: true,
            context: result.context,
            lastUpdated: result.lastUpdated,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Context retrieval endpoint error', error);
        res.status(500).json({
            error: 'Failed to retrieve context',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get context summary
router.get('/context-summary/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const summary = await contextService.generateContextSummary(participantId);
        res.json({
            success: true,
            summary,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Context summary endpoint error', error);
        res.status(500).json({
            error: 'Failed to generate context summary',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get all active Oracle modes
router.get('/active-modes', async (req, res) => {
    try {
        const activeModes = await retreatModeManager.getAllActiveModes();
        res.json({
            success: true,
            activeModes: activeModes.map(mode => ({
                ...mode,
                oracleAgent: undefined // Don't serialize agent objects
            })),
            count: activeModes.length
        });
    }
    catch (error) {
        logger_js_1.logger.error('Active modes endpoint error', error);
        res.status(500).json({
            error: 'Failed to get active modes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Generate mode report
router.get('/report/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const report = await retreatModeManager.generateModeReport(participantId);
        res.json({
            success: true,
            report,
            participantId
        });
    }
    catch (error) {
        logger_js_1.logger.error('Mode report endpoint error', error);
        res.status(500).json({
            error: 'Failed to generate mode report',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get context update history
router.get('/context-history/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const history = await contextService.getContextUpdateHistory(participantId);
        res.json({
            success: true,
            history,
            participantId,
            count: history.length
        });
    }
    catch (error) {
        logger_js_1.logger.error('Context history endpoint error', error);
        res.status(500).json({
            error: 'Failed to get context history',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Bulk operations for retreat management
router.post('/bulk/activate', async (req, res) => {
    try {
        const { participantIds, mode, activatedBy, sessionContext } = req.body;
        if (!Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({ error: 'participantIds array is required' });
        }
        const results = [];
        for (const participantId of participantIds) {
            try {
                const participant = await onboardingService.getParticipant(participantId);
                if (participant.success && participant.participant) {
                    const oracleMatch = await personalizationEngine.createPersonalizedOracle(participant.participant);
                    const oracleAgent = await retreatModeManager.activateRetreatMode(participant.participant, oracleMatch, mode, activatedBy, sessionContext);
                    results.push({
                        participantId,
                        success: true,
                        oracleName: oracleMatch.oraclePersonality.name
                    });
                }
                else {
                    results.push({
                        participantId,
                        success: false,
                        error: 'Participant not found'
                    });
                }
            }
            catch (error) {
                results.push({
                    participantId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        res.json({
            success: true,
            message: `Activated ${successCount}/${participantIds.length} Oracle sessions`,
            results,
            summary: {
                total: participantIds.length,
                successful: successCount,
                failed: participantIds.length - successCount
            }
        });
    }
    catch (error) {
        logger_js_1.logger.error('Bulk activation endpoint error', error);
        res.status(500).json({
            error: 'Failed to perform bulk activation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
