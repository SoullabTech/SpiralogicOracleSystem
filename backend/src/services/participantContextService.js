"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantContextService = void 0;
const supabaseClient_js_1 = require("../lib/supabaseClient.js");
const logger_js_1 = require("../utils/logger.js");
class ParticipantContextService {
    constructor() {
        this.contextCache = new Map();
        this.CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
    }
    async storeParticipantContext(participantId, context, source = 'user_input') {
        try {
            const contextData = {
                participant_id: participantId,
                personal_info: context.personalInfo,
                current_state: context.currentState,
                intentions: context.intentions,
                background: context.background,
                preferences: context.preferences,
                retreat_specific: context.retreatSpecific,
                stored_at: new Date().toISOString(),
                source
            };
            const { data, error } = await supabaseClient_js_1.supabase
                .from('participant_contexts')
                .upsert(contextData, {
                onConflict: 'participant_id',
                ignoreDuplicates: false
            })
                .select('id')
                .single();
            if (error) {
                logger_js_1.logger.error('Failed to store participant context', { participantId, error });
                return { success: false, error: error.message };
            }
            // Update cache
            this.updateCache(participantId, context);
            // Log context storage
            await this.logContextUpdate(participantId, 'full_context_stored', null, context, source);
            logger_js_1.logger.info(`Participant context stored successfully`, {
                participantId,
                contextId: data.id,
                source
            });
            return { success: true, contextId: data.id };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_js_1.logger.error('Error storing participant context', { participantId, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }
    async retrieveParticipantContext(participantId) {
        try {
            // Check cache first
            const cached = this.getCachedContext(participantId);
            if (cached) {
                return {
                    success: true,
                    context: cached.context,
                    lastUpdated: cached.lastFetched
                };
            }
            // Fetch from database
            const { data, error } = await supabaseClient_js_1.supabase
                .from('participant_contexts')
                .select('*')
                .eq('participant_id', participantId)
                .order('stored_at', { ascending: false })
                .limit(1)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    // No context found
                    return { success: false, error: 'No context found for participant' };
                }
                logger_js_1.logger.error('Failed to retrieve participant context', { participantId, error });
                return { success: false, error: error.message };
            }
            const context = {
                personalInfo: data.personal_info,
                currentState: data.current_state,
                intentions: data.intentions,
                background: data.background,
                preferences: data.preferences,
                retreatSpecific: data.retreat_specific
            };
            // Update cache
            this.updateCache(participantId, context);
            return {
                success: true,
                context,
                lastUpdated: new Date(data.stored_at)
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_js_1.logger.error('Error retrieving participant context', { participantId, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }
    async updateParticipantContext(participantId, updates, updatedBy, source = 'oracle_interaction') {
        try {
            // Get current context
            const currentResult = await this.retrieveParticipantContext(participantId);
            if (!currentResult.success || !currentResult.context) {
                return { success: false, error: 'Current context not found' };
            }
            const currentContext = currentResult.context;
            // Apply updates
            const updatedContext = {
                ...currentContext,
                ...updates,
                // Deep merge for nested objects
                personalInfo: { ...currentContext.personalInfo, ...updates.personalInfo },
                currentState: { ...currentContext.currentState, ...updates.currentState },
                intentions: { ...currentContext.intentions, ...updates.intentions },
                background: { ...currentContext.background, ...updates.background },
                preferences: { ...currentContext.preferences, ...updates.preferences },
                retreatSpecific: { ...currentContext.retreatSpecific, ...updates.retreatSpecific }
            };
            // Store updated context
            const storeResult = await this.storeParticipantContext(participantId, updatedContext, source);
            if (storeResult.success) {
                // Log individual field updates
                await this.trackFieldUpdates(participantId, currentContext, updatedContext, updatedBy, source);
            }
            return storeResult;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_js_1.logger.error('Error updating participant context', { participantId, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }
    async buildContextFromParticipant(participant) {
        return {
            personalInfo: {
                firstName: participant.firstName,
                lastName: participant.lastName,
                email: participant.email,
                birthDate: participant.birthDate,
                location: participant.location,
                timezone: participant.timezone || 'UTC'
            },
            currentState: {
                lifePhase: participant.currentLifePhase || 'unknown',
                primaryChallenges: participant.primaryChallenges || [],
                energyLevel: participant.energyLevel || 'medium',
                emotionalState: participant.emotionalState || 'neutral',
                spiritualPractices: participant.spiritualPractices || [],
                recentLifeEvents: participant.recentLifeEvents || []
            },
            intentions: {
                primary: participant.retreatIntentions?.primary || '',
                secondary: participant.retreatIntentions?.secondary || [],
                healingGoals: participant.retreatIntentions?.healingGoals || [],
                growthAreas: participant.retreatIntentions?.growthAreas || []
            },
            background: {
                spiritualBackground: participant.spiritualBackground || '',
                therapeuticExperience: participant.therapeuticExperience || '',
                traumaHistory: participant.traumaHistory || '',
                substanceHistory: participant.substanceHistory || '',
                previousRetreats: participant.previousRetreats || []
            },
            preferences: {
                communicationStyle: participant.communicationPreferences?.style || 'balanced',
                guidanceIntensity: participant.communicationPreferences?.intensity || 'medium',
                boundaryPreferences: participant.communicationPreferences?.boundaries || [],
                triggerWarnings: participant.communicationPreferences?.triggerWarnings || []
            },
            retreatSpecific: {
                arrivalDate: participant.arrivalDate,
                departureDate: participant.departureDate,
                roomingPreferences: participant.roomingPreferences,
                dietaryRestrictions: participant.dietaryRestrictions || [],
                emergencyContact: participant.emergencyContact,
                specialNeeds: participant.specialNeeds || []
            }
        };
    }
    async enrichContextFromInteractions(participantId, oracleInteractions) {
        try {
            const insights = this.extractInsightsFromInteractions(oracleInteractions);
            if (Object.keys(insights).length > 0) {
                await this.updateParticipantContext(participantId, insights, 'system', 'oracle_interaction');
                logger_js_1.logger.info(`Context enriched from ${oracleInteractions.length} interactions`, {
                    participantId,
                    insights: Object.keys(insights)
                });
            }
        }
        catch (error) {
            logger_js_1.logger.error('Error enriching context from interactions', { participantId, error });
        }
    }
    async generateContextSummary(participantId) {
        const contextResult = await this.retrieveParticipantContext(participantId);
        if (!contextResult.success || !contextResult.context) {
            throw new Error('Context not found');
        }
        const context = contextResult.context;
        const completeness = this.calculateContextCompleteness(context);
        const keyInsights = this.extractKeyInsights(context);
        const missingFields = this.identifyMissingFields(context);
        // Get update history count
        const { count } = await supabaseClient_js_1.supabase
            .from('context_update_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('participant_id', participantId);
        return {
            participant: participantId,
            contextCompleteness: completeness,
            lastUpdated: contextResult.lastUpdated || new Date(),
            keyInsights,
            missingFields,
            updateHistory: count || 0
        };
    }
    async getContextUpdateHistory(participantId) {
        const { data, error } = await supabaseClient_js_1.supabase
            .from('context_update_tracking')
            .select('*')
            .eq('participant_id', participantId)
            .order('updated_at', { ascending: false });
        if (error) {
            logger_js_1.logger.error('Failed to retrieve context update history', { participantId, error });
            return [];
        }
        return data.map(record => ({
            participantId: record.participant_id,
            fieldUpdated: record.field_updated,
            previousValue: record.previous_value,
            newValue: record.new_value,
            updatedAt: new Date(record.updated_at),
            updatedBy: record.updated_by,
            source: record.source
        }));
    }
    async clearParticipantContext(participantId) {
        // Remove from cache
        this.contextCache.delete(participantId);
        // Archive in database (don't delete, for audit trail)
        await supabaseClient_js_1.supabase
            .from('participant_contexts')
            .update({ archived: true, archived_at: new Date().toISOString() })
            .eq('participant_id', participantId);
        logger_js_1.logger.info(`Participant context cleared`, { participantId });
    }
    getCachedContext(participantId) {
        const cached = this.contextCache.get(participantId);
        if (!cached)
            return null;
        const now = new Date();
        if (now.getTime() - cached.lastFetched.getTime() > this.CACHE_TTL_MS) {
            this.contextCache.delete(participantId);
            return null;
        }
        return { context: cached.context, lastFetched: cached.lastFetched };
    }
    updateCache(participantId, context) {
        this.contextCache.set(participantId, {
            context,
            lastFetched: new Date(),
            isDirty: false
        });
    }
    extractInsightsFromInteractions(interactions) {
        const insights = {};
        // Analyze interactions for patterns
        interactions.forEach(interaction => {
            // Extract emotional state patterns
            if (interaction.query?.toLowerCase().includes('feeling')) {
                // Update emotional state based on recent expressions
            }
            // Extract growth areas from questions asked
            if (interaction.query?.toLowerCase().includes('help') ||
                interaction.query?.toLowerCase().includes('struggle')) {
                // Update current challenges
            }
            // Extract spiritual interests from topics explored
            if (interaction.query?.toLowerCase().includes('spiritual') ||
                interaction.query?.toLowerCase().includes('meditation')) {
                // Update spiritual practices
            }
        });
        return insights;
    }
    calculateContextCompleteness(context) {
        const fields = [
            context.personalInfo.firstName,
            context.personalInfo.email,
            context.currentState.lifePhase,
            context.intentions.primary,
            context.background.spiritualBackground,
            context.preferences.communicationStyle
        ];
        const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    }
    extractKeyInsights(context) {
        const insights = [];
        if (context.intentions.primary) {
            insights.push(`Primary intention: ${context.intentions.primary}`);
        }
        if (context.currentState.primaryChallenges?.length) {
            insights.push(`Key challenges: ${context.currentState.primaryChallenges.join(', ')}`);
        }
        if (context.background.spiritualBackground) {
            insights.push(`Spiritual background: ${context.background.spiritualBackground}`);
        }
        return insights;
    }
    identifyMissingFields(context) {
        const missing = [];
        if (!context.personalInfo.birthDate)
            missing.push('birthDate');
        if (!context.currentState.energyLevel)
            missing.push('energyLevel');
        if (!context.intentions.secondary?.length)
            missing.push('secondaryIntentions');
        if (!context.background.therapeuticExperience)
            missing.push('therapeuticExperience');
        return missing;
    }
    async trackFieldUpdates(participantId, previous, updated, updatedBy, source = 'oracle_interaction') {
        const updates = [];
        // Compare and track changes
        this.compareAndTrack(updates, participantId, 'personalInfo', previous.personalInfo, updated.personalInfo, updatedBy, source);
        this.compareAndTrack(updates, participantId, 'currentState', previous.currentState, updated.currentState, updatedBy, source);
        this.compareAndTrack(updates, participantId, 'intentions', previous.intentions, updated.intentions, updatedBy, source);
        // Store updates
        if (updates.length > 0) {
            const { error } = await supabaseClient_js_1.supabase
                .from('context_update_tracking')
                .insert(updates.map(update => ({
                participant_id: update.participantId,
                field_updated: update.fieldUpdated,
                previous_value: update.previousValue,
                new_value: update.newValue,
                updated_at: update.updatedAt.toISOString(),
                updated_by: update.updatedBy,
                source: update.source
            })));
            if (error) {
                logger_js_1.logger.error('Failed to track context updates', { participantId, error });
            }
        }
    }
    compareAndTrack(updates, participantId, fieldName, previous, updated, updatedBy, source = 'oracle_interaction') {
        Object.keys(updated).forEach(key => {
            if (previous[key] !== updated[key]) {
                updates.push({
                    participantId,
                    fieldUpdated: `${fieldName}.${key}`,
                    previousValue: previous[key],
                    newValue: updated[key],
                    updatedAt: new Date(),
                    updatedBy,
                    source: source
                });
            }
        });
    }
    async logContextUpdate(participantId, updateType, previousValue, newValue, source) {
        logger_js_1.logger.info('Context update logged', {
            participantId,
            updateType,
            source,
            timestamp: new Date().toISOString()
        });
    }
}
exports.ParticipantContextService = ParticipantContextService;
