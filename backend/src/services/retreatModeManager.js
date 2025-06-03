"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetreatModeManager = void 0;
const personalizedOracleAgent_js_1 = require("../core/agents/personalizedOracleAgent.js");
const logger_js_1 = require("../utils/logger.js");
const supabaseClient_js_1 = require("../lib/supabaseClient.js");
class RetreatModeManager {
    constructor() {
        this.activeOracles = new Map();
        this.modeStatuses = new Map();
    }
    async activateRetreatMode(participant, oracleMatch, mode, activatedBy, sessionContext) {
        try {
            // Create or retrieve Oracle agent
            let oracleAgent = this.activeOracles.get(participant.id);
            if (!oracleAgent) {
                oracleAgent = new personalizedOracleAgent_js_1.PersonalizedOracleAgent({
                    match: oracleMatch,
                    participant,
                    retreatMode: mode,
                    sessionContext
                });
                this.activeOracles.set(participant.id, oracleAgent);
            }
            // Activate the specific retreat mode
            await oracleAgent.activateRetreatMode(mode);
            // Record activation
            const activation = {
                participantId: participant.id,
                oracleId: oracleMatch.oraclePersonality.name,
                mode,
                activatedAt: new Date(),
                activatedBy,
                sessionContext
            };
            await this.recordModeActivation(activation);
            // Update status tracking
            await this.updateModeStatus(participant.id, mode, oracleAgent, activation);
            // Log successful activation
            logger_js_1.logger.info(`Retreat mode ${mode} activated for ${participant.firstName}`, {
                participantId: participant.id,
                oracleName: oracleMatch.oraclePersonality.name,
                activatedBy,
                sessionContext
            });
            return oracleAgent;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to activate retreat mode', {
                participantId: participant.id,
                mode,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async deactivateRetreatMode(participantId) {
        const oracleAgent = this.activeOracles.get(participantId);
        if (oracleAgent) {
            // Graceful shutdown - allow final interactions
            await this.performGracefulShutdown(participantId, oracleAgent);
            // Remove from active tracking
            this.activeOracles.delete(participantId);
            // Update status
            const status = this.modeStatuses.get(participantId);
            if (status) {
                status.currentMode = 'inactive';
                status.oracleAgent = undefined;
            }
            logger_js_1.logger.info(`Retreat mode deactivated for participant ${participantId}`);
        }
    }
    async transitionMode(participantId, newMode, transitionedBy) {
        const oracleAgent = this.activeOracles.get(participantId);
        if (!oracleAgent) {
            throw new Error(`No active Oracle found for participant ${participantId}`);
        }
        const currentStatus = this.modeStatuses.get(participantId);
        const previousMode = currentStatus?.currentMode;
        // Perform transition
        await oracleAgent.activateRetreatMode(newMode);
        // Record transition
        const activation = {
            participantId,
            oracleId: (await oracleAgent.getPersonalizationInsights()).primaryElement,
            mode: newMode,
            activatedAt: new Date(),
            activatedBy: transitionedBy
        };
        await this.recordModeActivation(activation);
        await this.updateModeStatus(participantId, newMode, oracleAgent, activation);
        logger_js_1.logger.info(`Mode transition completed`, {
            participantId,
            previousMode,
            newMode,
            transitionedBy
        });
    }
    async getActiveOracleAgent(participantId) {
        return this.activeOracles.get(participantId) || null;
    }
    async getModeStatus(participantId) {
        return this.modeStatuses.get(participantId) || null;
    }
    async getAllActiveModes() {
        return Array.from(this.modeStatuses.values()).filter(status => status.currentMode !== 'inactive');
    }
    async processOracleInteraction(participantId, query, sessionContext) {
        const oracleAgent = this.activeOracles.get(participantId);
        if (!oracleAgent) {
            throw new Error(`No active Oracle found for participant ${participantId}`);
        }
        // Process the query through personalized Oracle
        const response = await oracleAgent.processQuery(query, sessionContext);
        // Update interaction count
        const status = this.modeStatuses.get(participantId);
        if (status) {
            status.totalInteractions++;
        }
        return response;
    }
    async updateParticipantContext(participantId, contextUpdates) {
        const oracleAgent = this.activeOracles.get(participantId);
        if (oracleAgent) {
            await oracleAgent.updateParticipantContext(contextUpdates);
            logger_js_1.logger.info(`Participant context updated`, {
                participantId,
                updates: Object.keys(contextUpdates)
            });
        }
    }
    async emergencyDeactivation(participantId, reason, deactivatedBy) {
        const oracleAgent = this.activeOracles.get(participantId);
        if (oracleAgent) {
            // Immediate shutdown without graceful closure
            this.activeOracles.delete(participantId);
            // Update status with emergency flag
            const status = this.modeStatuses.get(participantId);
            if (status) {
                status.currentMode = 'inactive';
                status.oracleAgent = undefined;
            }
            // Log emergency deactivation
            await this.logEmergencyDeactivation(participantId, reason, deactivatedBy);
            logger_js_1.logger.warn(`Emergency deactivation completed`, {
                participantId,
                reason,
                deactivatedBy
            });
        }
    }
    async scheduleAutomaticTransitions() {
        // Pre-retreat to retreat-active (based on retreat start date)
        // Retreat-active to post-retreat (based on retreat end date)
        // Post-retreat timeout (after integration period)
        const activeStatuses = await this.getAllActiveModes();
        for (const status of activeStatuses) {
            await this.checkAndPerformScheduledTransitions(status);
        }
    }
    async recordModeActivation(activation) {
        try {
            const { error } = await supabaseClient_js_1.supabase
                .from('retreat_mode_activations')
                .insert({
                participant_id: activation.participantId,
                oracle_id: activation.oracleId,
                mode: activation.mode,
                activated_at: activation.activatedAt.toISOString(),
                activated_by: activation.activatedBy,
                session_context: activation.sessionContext || {}
            });
            if (error) {
                logger_js_1.logger.error('Failed to record mode activation', error);
            }
        }
        catch (error) {
            logger_js_1.logger.error('Database error recording mode activation', error);
        }
    }
    async updateModeStatus(participantId, mode, oracleAgent, activation) {
        const currentStatus = this.modeStatuses.get(participantId) || {
            participantId,
            currentMode: 'inactive',
            activeSessions: [],
            totalInteractions: 0,
            modeHistory: []
        };
        currentStatus.currentMode = mode;
        currentStatus.oracleAgent = oracleAgent;
        currentStatus.lastActivation = activation.activatedAt;
        currentStatus.modeHistory.push(activation);
        this.modeStatuses.set(participantId, currentStatus);
    }
    async performGracefulShutdown(participantId, oracleAgent) {
        try {
            // Allow final interaction or closing message
            const insights = await oracleAgent.getPersonalizationInsights();
            logger_js_1.logger.info(`Graceful shutdown completed for Oracle ${insights.primaryElement}`, {
                participantId,
                finalPhase: insights.currentPhase
            });
        }
        catch (error) {
            logger_js_1.logger.error('Error during graceful shutdown', error);
        }
    }
    async logEmergencyDeactivation(participantId, reason, deactivatedBy) {
        try {
            const { error } = await supabaseClient_js_1.supabase
                .from('retreat_emergency_deactivations')
                .insert({
                participant_id: participantId,
                reason,
                deactivated_by: deactivatedBy,
                deactivated_at: new Date().toISOString()
            });
            if (error) {
                logger_js_1.logger.error('Failed to log emergency deactivation', error);
            }
        }
        catch (error) {
            logger_js_1.logger.error('Database error logging emergency deactivation', error);
        }
    }
    async checkAndPerformScheduledTransitions(status) {
        // Implementation for automatic transitions based on retreat schedule
        // This would integrate with retreat scheduling system
        const now = new Date();
        // Example logic - would need actual retreat dates
        if (status.currentMode === 'pre-retreat') {
            // Check if retreat has started
            // await this.transitionMode(status.participantId, 'retreat-active', 'system');
        }
        else if (status.currentMode === 'retreat-active') {
            // Check if retreat has ended
            // await this.transitionMode(status.participantId, 'post-retreat', 'system');
        }
        else if (status.currentMode === 'post-retreat') {
            // Check if integration period has ended
            // await this.deactivateRetreatMode(status.participantId);
        }
    }
    async generateModeReport(participantId) {
        const status = this.modeStatuses.get(participantId);
        const oracleAgent = this.activeOracles.get(participantId);
        if (!status) {
            throw new Error(`No mode status found for participant ${participantId}`);
        }
        const oracleInsights = oracleAgent ? await oracleAgent.getPersonalizationInsights() : undefined;
        return {
            participant: participantId,
            currentMode: status.currentMode,
            totalActivations: status.modeHistory.length,
            totalInteractions: status.totalInteractions,
            modeHistory: status.modeHistory,
            oracleInsights
        };
    }
}
exports.RetreatModeManager = RetreatModeManager;
