import { BaseAgent } from './baseAgent.js';
import { logger } from '../../utils/logger.js';
export class PersonalizedOracleAgent extends BaseAgent {
    constructor(config) {
        super({
            name: config.match.oraclePersonality.name,
            role: `Personal Oracle for ${config.participant.firstName}`,
            systemPrompt: config.match.personalizationRules.customPrompts.systemPrompt,
            model: 'gpt-4-turbo'
        });
        this.config = config;
        this.personality = config.match.oraclePersonality;
        this.context = config.match.participantContext;
        this.assessment = config.match.elementalAssessment;
    }
    async activateRetreatMode(mode) {
        this.config.retreatMode = mode;
        switch (mode) {
            case 'pre-retreat':
                await this.initializePreRetreatMode();
                break;
            case 'retreat-active':
                await this.activateRetreatActiveMode();
                break;
            case 'post-retreat':
                await this.activatePostRetreatMode();
                break;
        }
        logger.info(`Oracle ${this.personality.name} activated in ${mode} mode for participant ${this.config.participant.firstName}`);
    }
    async initializePreRetreatMode() {
        // Pre-retreat preparation mode
        this.systemPrompt = this.buildSystemPrompt('pre-retreat');
        // Schedule preparation sessions
        const preRetreatPlan = this.config.match.lifecyclePlanning.preRetreat;
        // Log preparation initiation
        logger.info(`Pre-retreat preparation initiated for ${this.config.participant.firstName}`, {
            preparationAreas: preRetreatPlan.preparationAreas,
            expectedChallenges: preRetreatPlan.expectedChallenges,
            supportNeeds: preRetreatPlan.supportNeeds
        });
    }
    async activateRetreatActiveMode() {
        // Full retreat mode activation
        this.systemPrompt = this.buildSystemPrompt('retreat-active');
        const retreatConfig = this.config.match.lifecyclePlanning.retreatMode;
        // Enhanced sensitivity for retreat environment
        this.enableRetreatSensitivity();
        logger.info(`Retreat mode activated for ${this.config.participant.firstName}`, {
            focusAreas: retreatConfig.focusAreas,
            intensityLevel: retreatConfig.intensityLevel,
            supportStyle: retreatConfig.supportStyle
        });
    }
    async activatePostRetreatMode() {
        // Post-retreat integration mode
        this.systemPrompt = this.buildSystemPrompt('post-retreat');
        const postRetreatPlan = this.config.match.lifecyclePlanning.postRetreat;
        logger.info(`Post-retreat integration mode activated for ${this.config.participant.firstName}`, {
            integrationSupport: postRetreatPlan.integrationSupport,
            followUpSchedule: postRetreatPlan.followUpSchedule
        });
    }
    buildSystemPrompt(mode) {
        const basePrompt = this.config.match.personalizationRules.customPrompts.systemPrompt;
        const modeSpecificPrompt = this.config.match.personalizationRules.customPrompts.contextualPrompts[mode] || '';
        return `${basePrompt}\n\n=== RETREAT MODE: ${mode.toUpperCase()} ===\n${modeSpecificPrompt}\n\n=== PERSONALITY CONTEXT ===\nName: ${this.personality.name}\nCore Traits: ${this.personality.coreTraits.join(', ')}\nCommunication Style: ${this.personality.communicationStyle}\nVoice Profile: ${JSON.stringify(this.personality.voiceProfile)}\n\n=== PARTICIPANT CONTEXT ===\nName: ${this.context.personalInfo.firstName}\nPrimary Element: ${this.getPrimaryElement()}\nCurrent Life Phase: ${this.context.currentState.lifePhase}\nIntentions: ${this.context.intentions.primary}\n\n=== PERSONALIZATION RULES ===\n${this.config.match.personalizationRules.adaptationRules.map(rule => `- ${rule.condition}: ${rule.adaptation}`).join('\n')}`;
    }
    enableRetreatSensitivity() {
        // Enhanced emotional sensitivity during retreat
        this.config.match.personalizationRules.safetyProtocols.forEach(protocol => {
            if (protocol.triggerConditions.includes('heightened_sensitivity') ||
                protocol.triggerConditions.includes('ceremony_state')) {
                logger.debug(`Safety protocol activated: ${protocol.protocolName}`);
            }
        });
    }
    async processQuery(query, sessionContext) {
        // Apply personalization filters before processing
        const filteredQuery = await this.applyPersonalizationFilters(query);
        // Get base response
        const baseResponse = await super.processQuery(filteredQuery, {
            ...sessionContext,
            personalityContext: this.personality,
            participantContext: this.context,
            retreatMode: this.config.retreatMode
        });
        // Apply post-processing personalization
        const personalizedResponse = await this.personalizeResponse(baseResponse, query);
        // Log interaction for learning
        await this.logInteraction(query, personalizedResponse);
        return personalizedResponse;
    }
    async applyPersonalizationFilters(query) {
        // Apply sensitivity filters
        const safetyChecks = this.config.match.personalizationRules.safetyProtocols;
        for (const protocol of safetyChecks) {
            if (this.checkTriggerConditions(query, protocol.triggerConditions)) {
                logger.info(`Safety protocol triggered: ${protocol.protocolName}`);
                // Apply appropriate response modifications
            }
        }
        return query;
    }
    async personalizeResponse(response, originalQuery) {
        const personalityRules = this.config.match.personalizationRules;
        // Apply elemental coloring
        const elementallyColored = this.applyElementalColoring(response);
        // Apply communication style adjustments
        const styleAdjusted = this.applyCommunicationStyle(elementallyColored);
        // Apply relationship dynamics
        const relationshipAdjusted = this.applyRelationshipDynamics(styleAdjusted, originalQuery);
        return relationshipAdjusted;
    }
    applyElementalColoring(response) {
        const primaryElement = this.getPrimaryElement();
        const elementalProfile = this.assessment.elementalScores[primaryElement];
        // Apply elemental metaphors and language patterns
        switch (primaryElement) {
            case 'fire':
                return this.addFireLanguagePatterns(response);
            case 'water':
                return this.addWaterLanguagePatterns(response);
            case 'earth':
                return this.addEarthLanguagePatterns(response);
            case 'air':
                return this.addAirLanguagePatterns(response);
            case 'aether':
                return this.addAetherLanguagePatterns(response);
            default:
                return response;
        }
    }
    applyCommunicationStyle(response) {
        const style = this.personality.communicationStyle;
        switch (style) {
            case 'direct':
                return this.makeMoreDirect(response);
            case 'nurturing':
                return this.makeMoreNurturing(response);
            case 'mystical':
                return this.makeMoreMystical(response);
            case 'analytical':
                return this.makeMoreAnalytical(response);
            case 'playful':
                return this.makeMorePlayful(response);
            default:
                return response;
        }
    }
    applyRelationshipDynamics(response, query) {
        const dynamics = this.config.match.relationshipDynamics;
        // Apply connection approach
        if (dynamics.connectionApproach === 'gradual_trust_building') {
            return this.addTrustBuildingElements(response);
        }
        else if (dynamics.connectionApproach === 'immediate_intimacy') {
            return this.addIntimacyElements(response);
        }
        return response;
    }
    checkTriggerConditions(query, conditions) {
        // Simple keyword-based trigger checking
        const lowerQuery = query.toLowerCase();
        return conditions.some(condition => {
            switch (condition) {
                case 'trauma_indicators':
                    return /trauma|abuse|hurt|pain|wounded/i.test(lowerQuery);
                case 'overwhelm_signals':
                    return /overwhelmed|too much|can't handle|breaking/i.test(lowerQuery);
                case 'spiritual_emergency':
                    return /losing myself|can't ground|spinning|dissolving/i.test(lowerQuery);
                case 'substance_concerns':
                    return /drunk|high|substances|alcohol|drugs/i.test(lowerQuery);
                default:
                    return false;
            }
        });
    }
    getPrimaryElement() {
        const scores = this.assessment.elementalScores;
        return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    }
    // Elemental language pattern methods
    addFireLanguagePatterns(response) {
        // Add fire metaphors: ignition, passion, transformation through heat
        return response.replace(/\bchange\b/g, 'transformation')
            .replace(/\benergy\b/g, 'sacred fire')
            .replace(/\bpower\b/g, 'inner flame');
    }
    addWaterLanguagePatterns(response) {
        // Add water metaphors: flow, depth, cleansing, tides
        return response.replace(/\bprocess\b/g, 'flow')
            .replace(/\bhealing\b/g, 'cleansing')
            .replace(/\bemotion\b/g, 'inner tide');
    }
    addEarthLanguagePatterns(response) {
        // Add earth metaphors: grounding, growth, stability, roots
        return response.replace(/\bstability\b/g, 'deep roots')
            .replace(/\bgrowth\b/g, 'organic unfolding')
            .replace(/\bfoundation\b/g, 'sacred ground');
    }
    addAirLanguagePatterns(response) {
        // Add air metaphors: clarity, breath, perspective, freedom
        return response.replace(/\bthinking\b/g, 'mental clarity')
            .replace(/\bunderstanding\b/g, 'clear seeing')
            .replace(/\bfreedom\b/g, 'boundless sky');
    }
    addAetherLanguagePatterns(response) {
        // Add aether metaphors: unity, transcendence, cosmic connection
        return response.replace(/\bconnection\b/g, 'cosmic unity')
            .replace(/\bwisdom\b/g, 'divine knowing')
            .replace(/\bpurpose\b/g, 'sacred calling');
    }
    // Communication style methods
    makeMoreDirect(response) {
        return response.replace(/perhaps|maybe|might/g, 'will')
            .replace(/I think|I believe/g, 'I know')
            .replace(/could be/g, 'is');
    }
    makeMoreNurturing(response) {
        return `Beloved ${this.context.personalInfo.firstName}, ${response.toLowerCase()}`
            .replace(/\./g, ', dear one.')
            .replace(/you/g, 'your precious self');
    }
    makeMoreMystical(response) {
        return response.replace(/journey/g, 'sacred pilgrimage')
            .replace(/experience/g, 'mystical encounter')
            .replace(/insight/g, 'divine revelation');
    }
    makeMoreAnalytical(response) {
        return response.replace(/feeling/g, 'observing')
            .replace(/sense/g, 'analyze')
            .replace(/intuition/g, 'pattern recognition');
    }
    makeMorePlayful(response) {
        return response.replace(/serious/g, 'delightfully intense')
            .replace(/important/g, 'wonderfully significant')
            .replace(/work/g, 'play');
    }
    // Relationship dynamic methods
    addTrustBuildingElements(response) {
        const trustPhrases = [
            "I'm here when you're ready",
            "Take your time with this",
            "You're safe to explore this at your own pace"
        ];
        const randomPhrase = trustPhrases[Math.floor(Math.random() * trustPhrases.length)];
        return `${response}\n\n${randomPhrase}`;
    }
    addIntimacyElements(response) {
        return `${this.context.personalInfo.firstName}, I see you deeply. ${response}`;
    }
    async logInteraction(query, response) {
        logger.info('Personalized Oracle Interaction', {
            participantId: this.config.participant.id,
            oracleName: this.personality.name,
            retreatMode: this.config.retreatMode,
            primaryElement: this.getPrimaryElement(),
            queryLength: query.length,
            responseLength: response.length,
            timestamp: new Date().toISOString()
        });
    }
    async updateParticipantContext(updates) {
        this.context = { ...this.context, ...updates };
        // Rebuild system prompt with updated context
        this.systemPrompt = this.buildSystemPrompt(this.config.retreatMode);
        logger.info(`Context updated for participant ${this.config.participant.firstName}`, updates);
    }
    async getPersonalizationInsights() {
        return {
            primaryElement: this.getPrimaryElement(),
            communicationStyle: this.personality.communicationStyle,
            currentPhase: this.config.retreatMode,
            adaptations: this.config.match.personalizationRules.adaptationRules.map(rule => `${rule.condition}: ${rule.adaptation}`),
            safetyProtocols: this.config.match.personalizationRules.safetyProtocols.map(protocol => protocol.protocolName)
        };
    }
}
