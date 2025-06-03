"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRetreatService = exports.PostRetreatService = void 0;
// Post-Retreat Service - Long-term transformation support
const uuid_1 = require("uuid");
const supabaseClient_1 = require("../lib/supabaseClient");
const logger_1 = require("../utils/logger");
const soullabFounderAgent_1 = require("../core/agents/soullabFounderAgent");
class PostRetreatService {
    // Record transformation update
    async recordTransformationUpdate(update) {
        try {
            const updateId = (0, uuid_1.v4)();
            // Store transformation update
            const { data, error } = await supabaseClient_1.supabase
                .from('transformation_updates')
                .insert({
                id: updateId,
                participant_id: update.participantId,
                retreat_id: update.retreatId,
                current_state: update.currentState,
                transformations: update.transformations,
                practices: update.practices,
                challenges: update.challenges,
                celebrations: update.celebrations,
                oracle_questions: update.oracleQuestions,
                created_at: new Date()
            });
            if (error)
                throw error;
            // Update participant's integration status
            await this.updateIntegrationStatus(update.participantId, update);
            // Calculate next check-in date
            const nextCheckInDate = this.calculateNextCheckIn(update);
            logger_1.logger.info('Transformation update recorded', {
                participantId: update.participantId,
                updateId
            });
            return {
                id: updateId,
                ...update,
                nextCheckInDate
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to record transformation update', error);
            throw error;
        }
    }
    // Analyze transformation journey
    async analyzeTransformationJourney(participantId) {
        try {
            // Get all transformation updates
            const { data: updates } = await supabaseClient_1.supabase
                .from('transformation_updates')
                .select('*')
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true });
            if (!updates || updates.length === 0) {
                return this.getDefaultAnalysis();
            }
            // Analyze progress over time
            const overallProgress = this.calculateOverallProgress(updates);
            const growthTrajectory = this.determineGrowthTrajectory(updates);
            const strengths = this.identifyStrengths(updates);
            const edges = this.identifyGrowthEdges(updates);
            const patterns = this.identifyPatterns(updates);
            const recommendations = this.generateRecommendations(updates[updates.length - 1], patterns, growthTrajectory);
            return {
                overallProgress,
                growthTrajectory,
                strengths,
                edges,
                patterns,
                recommendations
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to analyze transformation journey', error);
            throw error;
        }
    }
    // Generate integration guidance
    async generateIntegrationGuidance(participantId, currentUpdate, analysis) {
        try {
            // Get participant's retreat data
            const retreatContext = await this.getParticipantRetreatContext(participantId);
            // Generate personalized guidance
            const guidance = await this.createPersonalizedGuidance(retreatContext, currentUpdate, analysis);
            // Get relevant practices
            const practices = this.selectIntegrationPractices(retreatContext.element, currentUpdate, analysis);
            // Find relevant wisdom from community
            const communityWisdom = await this.findRelevantCommunityWisdom(currentUpdate.challenges, currentUpdate.transformations.inProgress);
            return {
                oracleMessage: guidance.message,
                keyInsights: guidance.insights,
                practices,
                resources: guidance.resources,
                communityWisdom,
                nextFocus: this.determineNextFocus(analysis, currentUpdate)
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate integration guidance', error);
            throw error;
        }
    }
    // Get transformation timeline
    async getTransformationTimeline(participantId, retreatId) {
        try {
            let query = supabaseClient_1.supabase
                .from('transformation_updates')
                .select('*')
                .eq('participant_id', participantId)
                .order('created_at', { ascending: true });
            if (retreatId) {
                query = query.eq('retreat_id', retreatId);
            }
            const { data: updates } = await query;
            if (!updates || updates.length === 0) {
                return { timeline: [], metrics: {}, growthChart: [], elementalEvolution: [], practiceConsistency: [] };
            }
            // Build timeline
            const timeline = updates.map(update => ({
                date: update.created_at,
                overallWellbeing: update.current_state.overallWellbeing,
                keyTransformations: update.transformations.implemented,
                challenges: update.challenges,
                celebrations: update.celebrations
            }));
            // Calculate metrics
            const metrics = this.calculateTimelineMetrics(updates);
            // Generate visualizations data
            const growthChart = this.generateGrowthChart(updates);
            const elementalEvolution = this.generateElementalEvolution(updates);
            const practiceConsistency = this.generatePracticeConsistency(updates);
            return {
                timeline,
                metrics,
                growthChart,
                elementalEvolution,
                practiceConsistency
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get transformation timeline', error);
            throw error;
        }
    }
    // Get participant retreat context
    async getParticipantRetreatContext(participantId) {
        try {
            // Get participant data
            const { data: participant } = await supabaseClient_1.supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single();
            // Get retreat insights
            const { data: insights } = await supabaseClient_1.supabase
                .from('retreat_insights')
                .select('*')
                .eq('participant_id', participantId);
            // Get latest transformation
            const { data: latestUpdate } = await supabaseClient_1.supabase
                .from('transformation_updates')
                .select('*')
                .eq('participant_id', participantId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            return {
                element: participant?.oracleElement || 'aether',
                archetype: participant?.oracleArchetype || 'Soul Guide',
                insights: insights || [],
                currentTransformations: latestUpdate?.transformations || {},
                retreatIntentions: participant?.retreatIntentions || {},
                shadowWork: participant?.shadowWork || {}
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get retreat context', error);
            throw error;
        }
    }
    // Generate sacred guidance
    async generateSacredGuidance(params) {
        try {
            // Use Personal Oracle for guidance
            const oracleResponse = await this.invokePersonalOracle(params);
            // Get relevant practices
            const practices = this.selectGuidancePractices(params.element, params.lifeArea, params.context);
            // Find related wisdom
            const relatedWisdom = await this.findRelatedWisdom(params.question, params.lifeArea, params.element);
            // Generate next steps
            const nextSteps = this.generateNextSteps(params, oracleResponse, practices);
            return {
                message: oracleResponse,
                practices,
                resources: this.selectResources(params.lifeArea, params.currentTransformations),
                relatedWisdom,
                nextSteps
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate sacred guidance', error);
            throw error;
        }
    }
    // Record guidance session
    async recordGuidanceSession(participantId, guidance) {
        try {
            await supabaseClient_1.supabase
                .from('guidance_sessions')
                .insert({
                participant_id: participantId,
                guidance,
                created_at: new Date()
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to record guidance session', error);
        }
    }
    // Schedule Oracle check-ins
    async scheduleOracleCheckIns(params) {
        try {
            const schedule = {
                participantId: params.participantId,
                frequency: params.frequency,
                preferredTime: params.preferredTime,
                focusAreas: params.focusAreas,
                nextCheckIn: this.calculateNextScheduledCheckIn(params.frequency),
                reminders: this.generateReminderSchedule(params.frequency)
            };
            // Store schedule
            await supabaseClient_1.supabase
                .from('oracle_checkin_schedules')
                .upsert({
                participant_id: params.participantId,
                ...schedule,
                created_at: new Date()
            });
            return schedule;
        }
        catch (error) {
            logger_1.logger.error('Failed to schedule check-ins', error);
            throw error;
        }
    }
    // Record milestone
    async recordMilestone(milestoneData) {
        try {
            const milestone = {
                id: (0, uuid_1.v4)(),
                participantId: milestoneData.participantId,
                type: milestoneData.type,
                title: milestoneData.title,
                description: milestoneData.description,
                impact: milestoneData.impact,
                wisdomGained: milestoneData.wisdomGained,
                date: new Date(),
                shareWithCommunity: milestoneData.shareWithCommunity
            };
            // Store milestone
            await supabaseClient_1.supabase
                .from('milestones')
                .insert(milestone);
            // Update participant stats
            await this.updateMilestoneStats(milestone.participantId, milestone.type);
            logger_1.logger.info('Milestone recorded', {
                milestoneId: milestone.id,
                type: milestone.type
            });
            return milestone;
        }
        catch (error) {
            logger_1.logger.error('Failed to record milestone', error);
            throw error;
        }
    }
    // Generate celebration
    async generateCelebration(participantId, milestone) {
        try {
            // Get participant info
            const { data: participant } = await supabaseClient_1.supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single();
            // Generate personalized celebration message
            const message = await soullabFounderAgent_1.soullabFounderAgent.generateCelebrationMessage(participant, milestone);
            // Create celebration ritual
            const ritual = this.createCelebrationRitual(participant?.oracleElement, milestone.type);
            // Get community celebration if shared
            let communityCelebration = null;
            if (milestone.shareWithCommunity) {
                communityCelebration = await this.createCommunityCelebration(milestone);
            }
            return {
                personalMessage: message,
                ritual,
                communityCelebration,
                wisdomKeeper: `This ${milestone.type} has been recorded in your sacred journey archive.`
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate celebration', error);
            throw error;
        }
    }
    // Share with alumni community
    async shareWithAlumniCommunity(milestone) {
        try {
            await supabaseClient_1.supabase
                .from('community_shares')
                .insert({
                type: 'milestone',
                content: milestone,
                shared_by: milestone.participantId,
                visibility: 'alumni',
                created_at: new Date()
            });
            // Notify community members
            await this.notifyAlumniOfShare(milestone);
        }
        catch (error) {
            logger_1.logger.error('Failed to share with community', error);
        }
    }
    // Get milestones
    async getMilestones(participantId, filters) {
        try {
            let query = supabaseClient_1.supabase
                .from('milestones')
                .select('*')
                .eq('participant_id', participantId)
                .order('date', { ascending: false });
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            const { data: milestones, count } = await query;
            // Get statistics
            const stats = await this.getMilestoneStatistics(participantId);
            return {
                milestones: milestones || [],
                total: count || 0,
                byType: stats.byType,
                recent: milestones?.slice(0, 5) || []
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get milestones', error);
            throw error;
        }
    }
    // Generate challenge support
    async generateChallengeSupport(params) {
        try {
            // Get participant context
            const context = await this.getParticipantRetreatContext(params.participantId);
            // Analyze challenge pattern
            const challengeAnalysis = this.analyzeChallengePattern(params.challengeType, params.description, context);
            // Generate support strategy
            const support = await this.createSupportStrategy(params, context, challengeAnalysis);
            // Get relevant resources
            const resources = await this.gatherChallengeResources(params.challengeType, context.element);
            // Create practice recommendations
            const practices = this.createChallengePractices(params.challengeType, context.element, challengeAnalysis);
            // Schedule follow-up
            const followUpDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
            return {
                analysis: challengeAnalysis,
                strategy: support,
                resources,
                practices,
                followUpDate
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate challenge support', error);
            throw error;
        }
    }
    // Find similar journeys
    async findSimilarJourneys(participantId, challengeType) {
        try {
            // Get participants with similar challenges
            const { data: similarParticipants } = await supabaseClient_1.supabase
                .from('transformation_updates')
                .select('participant_id')
                .contains('challenges', [{ type: challengeType }])
                .neq('participant_id', participantId)
                .limit(10);
            if (!similarParticipants || similarParticipants.length === 0) {
                return [];
            }
            // Get their successful transformations
            const connections = await Promise.all(similarParticipants.map(async (p) => {
                const { data: participant } = await supabaseClient_1.supabase
                    .from('retreat_participants')
                    .select('firstName, oracleElement')
                    .eq('id', p.participant_id)
                    .single();
                const { data: successes } = await supabaseClient_1.supabase
                    .from('transformation_updates')
                    .select('transformations')
                    .eq('participant_id', p.participant_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                return {
                    participantId: p.participant_id,
                    name: participant?.firstName || 'Fellow Journeyer',
                    element: participant?.oracleElement,
                    sharedChallenge: challengeType,
                    insights: successes?.transformations?.implemented || []
                };
            }));
            return connections;
        }
        catch (error) {
            logger_1.logger.error('Failed to find similar journeys', error);
            return [];
        }
    }
    // Get integration reminders
    async getIntegrationReminders(participantId) {
        try {
            // Get scheduled check-ins
            const { data: schedule } = await supabaseClient_1.supabase
                .from('oracle_checkin_schedules')
                .select('*')
                .eq('participant_id', participantId)
                .single();
            // Get upcoming milestones
            const upcomingMilestones = await this.predictUpcomingMilestones(participantId);
            // Get suggested practices
            const practices = await this.getSuggestedPractices(participantId);
            // Get community events
            const events = await this.getUpcomingCommunityEvents(participantId);
            return {
                scheduled: schedule?.reminders || [],
                practices,
                events,
                upcomingMilestones
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get integration reminders', error);
            throw error;
        }
    }
    // Get alumni community
    async getAlumniCommunity(retreatId, filters) {
        try {
            // Get alumni members
            let query = supabaseClient_1.supabase
                .from('retreat_participants')
                .select('*')
                .eq('retreat_id', retreatId);
            if (filters.element) {
                query = query.eq('oracleElement', filters.element);
            }
            const { data: members } = await query;
            // Get recent shared wisdom
            const { data: recentWisdom } = await supabaseClient_1.supabase
                .from('community_shares')
                .select('*')
                .eq('visibility', 'alumni')
                .order('created_at', { ascending: false })
                .limit(10);
            // Get upcoming gatherings
            const { data: gatherings } = await supabaseClient_1.supabase
                .from('community_gatherings')
                .select('*')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true });
            return {
                members: members || [],
                recentWisdom: recentWisdom || [],
                gatherings: gatherings || []
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get alumni community', error);
            throw error;
        }
    }
    // Generate annual review
    async generateAnnualReview(participantId, year) {
        try {
            // Get year's transformation updates
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            const { data: updates } = await supabaseClient_1.supabase
                .from('transformation_updates')
                .select('*')
                .eq('participant_id', participantId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });
            if (!updates || updates.length === 0) {
                return { year, message: 'No transformation data for this year.' };
            }
            // Generate comprehensive review
            const review = {
                year,
                journeyHighlights: this.extractYearHighlights(updates),
                transformationMap: this.createTransformationMap(updates),
                growthSpiral: this.createGrowthSpiral(updates),
                elementalJourney: this.trackElementalJourney(updates),
                challengesNavigated: this.summarizeChallenges(updates),
                wisdomGained: this.compileYearWisdom(updates),
                practiceEvolution: this.analyzePracticeEvolution(updates),
                communityContributions: await this.getYearCommunityContributions(participantId, year),
                recommendationsForNextYear: this.generateNextYearRecommendations(updates)
            };
            // Generate narrative summary
            const narrative = await this.createAnnualNarrative(participantId, review);
            review['narrative'] = narrative;
            return review;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate annual review', error);
            throw error;
        }
    }
    // Check retreat anniversary
    async checkRetreatAnniversary(participantId) {
        try {
            // Get participant's retreat date
            const { data: participant } = await supabaseClient_1.supabase
                .from('retreat_participants')
                .select('created_at, retreatId')
                .eq('id', participantId)
                .single();
            if (!participant) {
                return { isAnniversary: false };
            }
            const retreatDate = new Date(participant.created_at);
            const today = new Date();
            // Check if it's anniversary (same month and day)
            const isAnniversary = retreatDate.getMonth() === today.getMonth() &&
                retreatDate.getDate() === today.getDate();
            const yearsElapsed = today.getFullYear() - retreatDate.getFullYear();
            if (isAnniversary && yearsElapsed > 0) {
                // Get transformation summary
                const transformation = await this.getTransformationSummary(participantId);
                return {
                    isAnniversary: true,
                    years: yearsElapsed,
                    retreatDate,
                    transformation,
                    reflection: await this.generateAnniversaryReflection(participantId, yearsElapsed),
                    invitation: this.createAnniversaryInvitation(yearsElapsed)
                };
            }
            // Calculate next anniversary
            const nextAnniversary = new Date(retreatDate);
            nextAnniversary.setFullYear(today.getFullYear());
            if (nextAnniversary < today) {
                nextAnniversary.setFullYear(today.getFullYear() + 1);
            }
            const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
                isAnniversary: false,
                nextDate: nextAnniversary,
                daysUntil
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to check anniversary', error);
            throw error;
        }
    }
    // Generate anniversary message
    async generateAnniversaryMessage(participantId, anniversary) {
        try {
            const { data: participant } = await supabaseClient_1.supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single();
            return await soullabFounderAgent_1.soullabFounderAgent.generateAnniversaryMessage(participant, anniversary.years, anniversary.transformation);
        }
        catch (error) {
            logger_1.logger.error('Failed to generate anniversary message', error);
            throw error;
        }
    }
    // Helper methods
    calculateNextCheckIn(update) {
        const baseInterval = 30; // days
        const wellbeingFactor = update.currentState.overallWellbeing / 10;
        const intervalDays = Math.round(baseInterval * wellbeingFactor);
        return new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    }
    async updateIntegrationStatus(participantId, update) {
        const integrationScore = this.calculateIntegrationScore(update);
        await supabaseClient_1.supabase
            .from('retreat_participants')
            .update({
            integration_status: {
                lastUpdate: new Date(),
                integrationScore,
                activeTransformations: update.transformations.implemented.length + update.transformations.inProgress.length,
                consistencyScore: this.calculateConsistencyScore(update.practices)
            }
        })
            .eq('id', participantId);
    }
    calculateIntegrationScore(update) {
        const weights = {
            wellbeing: 0.2,
            transformations: 0.3,
            practices: 0.2,
            challenges: 0.15,
            celebrations: 0.15
        };
        const wellbeingScore = Object.values(update.currentState).reduce((a, b) => a + b, 0) / 50;
        const transformationScore = (update.transformations.implemented.length * 10 +
            update.transformations.inProgress.length * 5) / 100;
        const practiceScore = (update.practices.dailyPractices.length +
            update.practices.weeklyPractices.length) / 10;
        const challengeScore = update.challenges ? (10 - update.challenges.length) / 10 : 1;
        const celebrationScore = update.celebrations ? update.celebrations.length / 5 : 0;
        return Math.min(10, wellbeingScore * weights.wellbeing +
            transformationScore * weights.transformations +
            practiceScore * weights.practices +
            challengeScore * weights.challenges +
            celebrationScore * weights.celebrations) * 10;
    }
    calculateConsistencyScore(practices) {
        // In production, this would analyze practice history
        return (practices.dailyPractices.length * 10 + practices.weeklyPractices.length * 5) / 15;
    }
    getDefaultAnalysis() {
        return {
            overallProgress: 0,
            growthTrajectory: 'steady',
            strengths: [],
            edges: [],
            patterns: {
                consistent: [],
                emerging: [],
                challenging: []
            },
            recommendations: ['Begin tracking your transformation journey']
        };
    }
    calculateOverallProgress(updates) {
        if (updates.length === 0)
            return 0;
        const latest = updates[updates.length - 1];
        const earliest = updates[0];
        const startScore = Object.values(earliest.current_state).reduce((a, b) => a + b, 0) / 5;
        const currentScore = Object.values(latest.current_state).reduce((a, b) => a + b, 0) / 5;
        return Math.round(((currentScore - startScore) / startScore) * 100);
    }
    determineGrowthTrajectory(updates) {
        if (updates.length < 3)
            return 'steady';
        const recent = updates.slice(-3);
        const scores = recent.map(u => Object.values(u.current_state).reduce((a, b) => a + b, 0) / 5);
        const trend = scores[2] - scores[0];
        if (trend > 1)
            return 'accelerating';
        if (trend < -0.5)
            return 'integrating';
        if (Math.abs(trend) < 0.2)
            return 'plateauing';
        return 'steady';
    }
    identifyStrengths(updates) {
        const latest = updates[updates.length - 1];
        const strengths = [];
        if (latest.current_state.emotionalClarity >= 8)
            strengths.push('Emotional mastery');
        if (latest.current_state.spiritualConnection >= 8)
            strengths.push('Deep spiritual connection');
        if (latest.current_state.lifeAlignment >= 8)
            strengths.push('Living in alignment');
        if (latest.current_state.shadowIntegration >= 8)
            strengths.push('Shadow integration');
        if (latest.transformations.implemented.length > 5)
            strengths.push('Implementation power');
        if (latest.practices.dailyPractices.length >= 3)
            strengths.push('Consistent practice');
        return strengths;
    }
    identifyGrowthEdges(updates) {
        const latest = updates[updates.length - 1];
        const edges = [];
        Object.entries(latest.current_state).forEach(([key, value]) => {
            if (value < 5) {
                edges.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
            }
        });
        if (latest.challenges && latest.challenges.length > 3) {
            edges.push('Challenge navigation');
        }
        if (latest.transformations.inProgress.length > latest.transformations.implemented.length) {
            edges.push('Completion and integration');
        }
        return edges;
    }
    identifyPatterns(updates) {
        const patterns = {
            consistent: [],
            emerging: [],
            challenging: []
        };
        // Analyze consistent practices
        const allPractices = updates.flatMap(u => u.practices.dailyPractices);
        const practiceCounts = {};
        allPractices.forEach(p => practiceCounts[p] = (practiceCounts[p] || 0) + 1);
        Object.entries(practiceCounts).forEach(([practice, count]) => {
            if (count > updates.length * 0.7) {
                patterns.consistent.push(practice);
            }
        });
        // Analyze emerging patterns
        if (updates.length >= 3) {
            const recent = updates.slice(-3);
            const recentPractices = recent.flatMap(u => u.practices.dailyPractices);
            const emerging = [...new Set(recentPractices)].filter(p => !patterns.consistent.includes(p));
            patterns.emerging = emerging;
        }
        // Analyze challenges
        const allChallenges = updates.flatMap(u => u.challenges || []).map(c => c.type);
        const challengeCounts = {};
        allChallenges.forEach(c => challengeCounts[c] = (challengeCounts[c] || 0) + 1);
        patterns.challenging = Object.entries(challengeCounts)
            .filter(([, count]) => count > 2)
            .map(([challenge]) => challenge);
        return patterns;
    }
    generateRecommendations(latest, patterns, trajectory) {
        const recommendations = [];
        // Trajectory-based recommendations
        if (trajectory === 'plateauing') {
            recommendations.push('Consider a new practice or challenge to reignite growth');
            recommendations.push('Schedule an Oracle session for fresh perspective');
        }
        if (trajectory === 'integrating') {
            recommendations.push('Honor this integration phase with gentle practices');
            recommendations.push('Journal about what is settling and rooting');
        }
        // Pattern-based recommendations
        if (patterns.challenging.length > 0) {
            recommendations.push(`Focus support on recurring challenge: ${patterns.challenging[0]}`);
        }
        if (patterns.emerging.length > 0) {
            recommendations.push(`Deepen into emerging practice: ${patterns.emerging[0]}`);
        }
        // State-based recommendations
        Object.entries(latest.current_state).forEach(([key, value]) => {
            if (value < 5) {
                recommendations.push(`Gentle attention to ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        });
        return recommendations.slice(0, 5); // Top 5 recommendations
    }
    async createPersonalizedGuidance(context, update, analysis) {
        // In production, this would use the PersonalOracleAgent
        const insights = [];
        if (analysis.growthTrajectory === 'accelerating') {
            insights.push('Your rapid growth is beautiful. Remember to ground and integrate.');
        }
        if (update.challenges && update.challenges.length > 0) {
            insights.push(`The ${update.challenges[0].type} you face is a teacher in disguise.`);
        }
        insights.push(`Your ${context.element} nature is calling for ${this.getElementalNeed(context.element, update)}.`);
        return {
            message: `Dear one, ${insights.join(' ')} Trust your journey.`,
            insights,
            resources: []
        };
    }
    getElementalNeed(element, update) {
        const needs = {
            fire: 'creative expression and passion projects',
            water: 'emotional flow and deep feeling',
            earth: 'grounding practices and manifestation',
            air: 'mental clarity and new perspectives',
            aether: 'integration and unity consciousness'
        };
        // Adjust based on current state
        if (update.currentState.overallWellbeing < 6) {
            needs.fire = 'gentle rekindling of your inner flame';
            needs.water = 'compassionate self-care';
            needs.earth = 'rest and restoration';
            needs.air = 'breathing space';
            needs.aether = 'gentle integration';
        }
        return needs[element] || 'balanced attention';
    }
    selectIntegrationPractices(element, update, analysis) {
        const practices = [];
        // Element-specific practices
        const elementPractices = {
            fire: ['Morning intention setting', 'Creative expression', 'Passion activation'],
            water: ['Emotional flow practice', 'Heart coherence', 'Compassion meditation'],
            earth: ['Grounding ritual', 'Nature connection', 'Body wisdom practice'],
            air: ['Breathwork', 'Mind clearing', 'Vision meditation'],
            aether: ['Unity meditation', 'Integration practice', 'Sacred geometry']
        };
        practices.push(...(elementPractices[element] || elementPractices.aether));
        // Trajectory-specific practices
        if (analysis.growthTrajectory === 'integrating') {
            practices.push('Gentle yoga', 'Journaling', 'Rest');
        }
        // Challenge-specific practices
        if (update.challenges && update.challenges.length > 0) {
            practices.push('Shadow work journaling', 'Support circle connection');
        }
        return practices.slice(0, 5);
    }
    async findRelevantCommunityWisdom(challenges, inProgress) {
        // In production, this would search the wisdom database
        return [
            {
                type: 'insight',
                content: 'Trust the spiral nature of growth',
                contributor: 'Alumni Member',
                relevance: 'transformation'
            }
        ];
    }
    determineNextFocus(analysis, update) {
        // Prioritize based on lowest scores
        const stateScores = Object.entries(update.currentState)
            .sort(([, a], [, b]) => a - b);
        const lowestArea = stateScores[0][0];
        return `Gentle focus on ${lowestArea.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
    calculateTimelineMetrics(updates) {
        return {
            totalUpdates: updates.length,
            averageWellbeing: this.calculateAverageWellbeing(updates),
            transformationVelocity: this.calculateTransformationVelocity(updates),
            consistencyScore: this.calculateTimelineConsistency(updates),
            growthRate: this.calculateGrowthRate(updates)
        };
    }
    calculateAverageWellbeing(updates) {
        const total = updates.reduce((sum, update) => sum + update.current_state.overallWellbeing, 0);
        return Math.round(total / updates.length * 10) / 10;
    }
    calculateTransformationVelocity(updates) {
        if (updates.length < 2)
            return 0;
        const totalTransformations = updates.reduce((sum, update) => sum + update.transformations.implemented.length, 0);
        const timeSpan = new Date(updates[updates.length - 1].created_at).getTime() -
            new Date(updates[0].created_at).getTime();
        const months = timeSpan / (1000 * 60 * 60 * 24 * 30);
        return Math.round(totalTransformations / months * 10) / 10;
    }
    calculateTimelineConsistency(updates) {
        if (updates.length < 2)
            return 10;
        // Calculate intervals between updates
        const intervals = [];
        for (let i = 1; i < updates.length; i++) {
            const interval = new Date(updates[i].created_at).getTime() -
                new Date(updates[i - 1].created_at).getTime();
            intervals.push(interval);
        }
        // Calculate variance
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        // Convert to 0-10 score (lower variance = higher score)
        const consistencyScore = Math.max(0, 10 - (Math.sqrt(variance) / (avgInterval * 0.5)));
        return Math.round(consistencyScore * 10) / 10;
    }
    calculateGrowthRate(updates) {
        if (updates.length < 2)
            return 0;
        const firstWellbeing = updates[0].current_state.overallWellbeing;
        const lastWellbeing = updates[updates.length - 1].current_state.overallWellbeing;
        const growth = ((lastWellbeing - firstWellbeing) / firstWellbeing) * 100;
        return Math.round(growth * 10) / 10;
    }
    generateGrowthChart(updates) {
        return updates.map(update => ({
            date: update.created_at,
            wellbeing: update.current_state.overallWellbeing,
            emotionalClarity: update.current_state.emotionalClarity,
            spiritualConnection: update.current_state.spiritualConnection,
            lifeAlignment: update.current_state.lifeAlignment,
            shadowIntegration: update.current_state.shadowIntegration
        }));
    }
    generateElementalEvolution(updates) {
        return updates.map(update => ({
            date: update.created_at,
            element: update.practices.elementalWork.primaryElement,
            balance: update.practices.elementalWork.balance,
            practices: update.practices.elementalWork.practices.length
        }));
    }
    generatePracticeConsistency(updates) {
        return updates.map(update => ({
            date: update.created_at,
            dailyPractices: update.practices.dailyPractices.length,
            weeklyPractices: update.practices.weeklyPractices.length,
            total: update.practices.dailyPractices.length + update.practices.weeklyPractices.length
        }));
    }
    async invokePersonalOracle(params) {
        // In production, this would call the PersonalOracleAgent
        return `Beloved ${params.participantId}, your question about ${params.lifeArea} resonates deeply. ${params.question} Trust your ${params.element} wisdom.`;
    }
    selectGuidancePractices(element, lifeArea, context) {
        const practices = [];
        // Base elemental practice
        practices.push(`${element} meditation for ${lifeArea}`);
        // Context-specific practices
        if (context.includes('challenge')) {
            practices.push('Shadow work journaling', 'Support circle activation');
        }
        if (context.includes('celebration')) {
            practices.push('Gratitude practice', 'Sharing your gifts');
        }
        return practices;
    }
    async findRelatedWisdom(question, lifeArea, element) {
        // In production, search wisdom database
        return [{
                type: 'guidance',
                content: 'Trust the wisdom already within you',
                element,
                relevance: lifeArea
            }];
    }
    generateNextSteps(params, oracleResponse, practices) {
        return [
            `Sit with the Oracle's message: "${oracleResponse.substring(0, 50)}..."`,
            `Begin with ${practices[0]}`,
            'Journal any insights that arise',
            'Check in again in one week'
        ];
    }
    selectResources(lifeArea, transformations) {
        // In production, this would select from resource library
        return [
            {
                type: 'article',
                title: `Navigating ${lifeArea} with grace`,
                url: '#'
            },
            {
                type: 'practice',
                title: 'Daily integration ritual',
                url: '#'
            }
        ];
    }
    calculateNextScheduledCheckIn(frequency) {
        const intervals = {
            weekly: 7,
            biweekly: 14,
            monthly: 30
        };
        const days = intervals[frequency] || 30;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    generateReminderSchedule(frequency) {
        const base = this.calculateNextScheduledCheckIn(frequency);
        return [
            {
                type: 'advance',
                date: new Date(base.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before
                message: 'Oracle check-in coming up'
            },
            {
                type: 'day_of',
                date: base,
                message: 'Time for your Oracle check-in'
            }
        ];
    }
    async updateMilestoneStats(participantId, type) {
        // Update participant statistics
        const { data: stats } = await supabaseClient_1.supabase
            .from('participant_stats')
            .select('*')
            .eq('participant_id', participantId)
            .single();
        const milestoneCount = stats?.milestone_count || {};
        milestoneCount[type] = (milestoneCount[type] || 0) + 1;
        await supabaseClient_1.supabase
            .from('participant_stats')
            .upsert({
            participant_id: participantId,
            milestone_count: milestoneCount,
            last_milestone: new Date()
        });
    }
    createCelebrationRitual(element, milestoneType) {
        const rituals = {
            fire: {
                practice: 'Light a candle for your achievement',
                reflection: 'How has your inner fire grown?',
                offering: 'Write your breakthrough and safely burn it as offering'
            },
            water: {
                practice: 'Take a ritual bath with salts',
                reflection: 'How have your emotions evolved?',
                offering: 'Offer water to a plant while stating your growth'
            },
            earth: {
                practice: 'Plant something to honor your growth',
                reflection: 'What have you manifested?',
                offering: 'Create an earth altar with your symbols'
            },
            air: {
                practice: 'Breathwork celebration sequence',
                reflection: 'What new perspectives have emerged?',
                offering: 'Release a biodegradable balloon with your message'
            },
            aether: {
                practice: 'Sacred geometry meditation',
                reflection: 'How has integration served you?',
                offering: 'Create art representing your journey'
            }
        };
        return rituals[element] || rituals.aether;
    }
    async createCommunityCelebration(milestone) {
        return {
            sharedWith: 'retreat_alumni',
            celebrationCircle: true,
            message: 'Your journey inspires the collective'
        };
    }
    async notifyAlumniOfShare(milestone) {
        // In production, send notifications
        logger_1.logger.info('Alumni notified of milestone share', { milestoneId: milestone.id });
    }
    async getMilestoneStatistics(participantId) {
        const { data: stats } = await supabaseClient_1.supabase
            .from('participant_stats')
            .select('milestone_count')
            .eq('participant_id', participantId)
            .single();
        return {
            byType: stats?.milestone_count || {}
        };
    }
    analyzeChallengePattern(type, description, context) {
        return {
            pattern: 'recurring',
            rootElement: context.element,
            shadowAspect: this.identifyShadowAspect(type, description),
            previousApproaches: [], // Would analyze history
            recommendations: [`Work with ${context.element} shadow`]
        };
    }
    identifyShadowAspect(type, description) {
        const shadowMap = {
            relationship: 'Intimacy and boundaries',
            career: 'Purpose and worth',
            health: 'Body wisdom and care',
            spiritual: 'Trust and surrender',
            financial: 'Abundance and security'
        };
        return shadowMap[type] || 'Integration opportunity';
    }
    async createSupportStrategy(params, context, analysis) {
        return {
            approach: `${context.element}-based navigation`,
            practices: [`Daily ${context.element} practice for ${params.challengeType}`],
            mindset: 'This challenge is a teacher',
            support: 'Oracle guidance + community wisdom'
        };
    }
    async gatherChallengeResources(type, element) {
        return [
            {
                type: 'guide',
                title: `${element} approach to ${type}`,
                content: 'Wisdom from your element'
            }
        ];
    }
    createChallengePractices(type, element, analysis) {
        return [
            `Morning ${element} practice`,
            `Shadow work on ${analysis.shadowAspect}`,
            'Evening integration ritual',
            'Weekly Oracle check-in'
        ];
    }
    async predictUpcomingMilestones(participantId) {
        // Analyze patterns to predict
        return [
            {
                type: 'integration',
                predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                area: 'Shadow work completion'
            }
        ];
    }
    async getSuggestedPractices(participantId) {
        const context = await this.getParticipantRetreatContext(participantId);
        return [
            `Daily ${context.element} meditation`,
            'Integration journaling',
            'Community connection'
        ];
    }
    async getUpcomingCommunityEvents(participantId) {
        return [
            {
                type: 'online_circle',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                title: 'Monthly Integration Circle'
            }
        ];
    }
    extractYearHighlights(updates) {
        return updates
            .filter(u => u.celebrations && u.celebrations.length > 0)
            .flatMap(u => u.celebrations)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
    }
    createTransformationMap(updates) {
        const map = {
            implemented: new Set(),
            areas: new Set(),
            timeline: []
        };
        updates.forEach(update => {
            update.transformations.implemented.forEach((t) => {
                map.implemented.add(t.area);
                map.timeline.push({
                    date: update.created_at,
                    transformation: t.area,
                    impact: t.impact
                });
            });
        });
        return {
            totalAreas: map.implemented.size,
            timeline: map.timeline
        };
    }
    createGrowthSpiral(updates) {
        return updates.map((update, index) => ({
            angle: (index / updates.length) * 360,
            radius: update.current_state.overallWellbeing * 10,
            date: update.created_at,
            state: update.current_state
        }));
    }
    trackElementalJourney(updates) {
        const journey = {};
        updates.forEach(update => {
            const element = update.practices.elementalWork.primaryElement;
            if (!journey[element]) {
                journey[element] = {
                    visits: 0,
                    totalBalance: 0,
                    practices: new Set()
                };
            }
            journey[element].visits++;
            journey[element].totalBalance += update.practices.elementalWork.balance;
            update.practices.elementalWork.practices.forEach((p) => journey[element].practices.add(p));
        });
        // Calculate averages
        Object.keys(journey).forEach(element => {
            journey[element].averageBalance = journey[element].totalBalance / journey[element].visits;
            journey[element].practiceCount = journey[element].practices.size;
        });
        return journey;
    }
    summarizeChallenges(updates) {
        const challenges = {};
        updates.forEach(update => {
            update.challenges?.forEach(challenge => {
                if (!challenges[challenge.type]) {
                    challenges[challenge.type] = {
                        occurrences: 0,
                        totalImpact: 0,
                        descriptions: []
                    };
                }
                challenges[challenge.type].occurrences++;
                challenges[challenge.type].totalImpact += challenge.impactLevel;
                challenges[challenge.type].descriptions.push(challenge.description);
            });
        });
        return challenges;
    }
    compileYearWisdom(updates) {
        const wisdom = [];
        updates.forEach(update => {
            // Extract wisdom from transformations
            update.transformations.implemented.forEach((t) => {
                if (t.impact >= 8) {
                    wisdom.push(`${t.area}: ${t.description}`);
                }
            });
        });
        return wisdom;
    }
    analyzePracticeEvolution(updates) {
        const evolution = {
            started: updates[0].practices,
            current: updates[updates.length - 1].practices,
            consistency: {},
            dropped: [],
            added: []
        };
        // Track practice consistency
        const allPractices = new Set();
        updates.forEach(update => {
            update.practices.dailyPractices.forEach((p) => allPractices.add(p));
        });
        allPractices.forEach(practice => {
            const count = updates.filter(u => u.practices.dailyPractices.includes(practice)).length;
            evolution.consistency[practice] = count / updates.length;
        });
        return evolution;
    }
    async getYearCommunityContributions(participantId, year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        const { data: contributions } = await supabaseClient_1.supabase
            .from('community_shares')
            .select('*')
            .eq('shared_by', participantId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        return {
            totalShares: contributions?.length || 0,
            types: this.categorizeContributions(contributions || [])
        };
    }
    categorizeContributions(contributions) {
        const types = {};
        contributions.forEach(c => {
            types[c.type] = (types[c.type] || 0) + 1;
        });
        return types;
    }
    generateNextYearRecommendations(updates) {
        const latest = updates[updates.length - 1];
        const recommendations = [];
        // Based on current state
        const lowestState = Object.entries(latest.current_state)
            .sort(([, a], [, b]) => a - b)[0];
        recommendations.push(`Focus on elevating ${lowestState[0].replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        // Based on patterns
        if (latest.transformations.inProgress.length > 3) {
            recommendations.push('Complete in-progress transformations before starting new ones');
        }
        recommendations.push('Deepen your elemental practice');
        recommendations.push('Share your wisdom with the community');
        recommendations.push('Consider mentoring newer retreat participants');
        return recommendations;
    }
    async createAnnualNarrative(participantId, review) {
        // In production, use AI to create narrative
        return `This year has been a profound journey of ${review.transformationMap.totalAreas} transformation areas...`;
    }
    async getTransformationSummary(participantId) {
        const { data: updates } = await supabaseClient_1.supabase
            .from('transformation_updates')
            .select('*')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false })
            .limit(1);
        return updates?.[0] || {};
    }
    async generateAnniversaryReflection(participantId, years) {
        return `${years} year${years > 1 ? 's' : ''} of integration and growth. Your journey continues to spiral deeper.`;
    }
    createAnniversaryInvitation(years) {
        return `Consider joining us for an anniversary integration session or returning for an advanced retreat.`;
    }
}
exports.PostRetreatService = PostRetreatService;
// Export singleton instance
exports.postRetreatService = new PostRetreatService();
