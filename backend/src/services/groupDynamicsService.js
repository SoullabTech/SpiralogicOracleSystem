"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupDynamicsService = exports.GroupDynamicsService = void 0;
// Group Dynamics Service - Real-time group field tracking
const supabaseClient_1 = require("../lib/supabaseClient");
const logger_1 = require("../utils/logger");
class GroupDynamicsService {
    // Update participant state from check-in
    async updateParticipantState(retreatId, participantId, checkIn) {
        try {
            // Get current group dynamics
            const dynamics = await this.getCurrentDynamics(retreatId, false);
            // Update participant state
            const participantState = {
                participantId,
                name: await this.getParticipantName(participantId),
                element: await this.getParticipantElement(participantId),
                currentEnergy: checkIn.morningState.energyLevel,
                emotionalTone: checkIn.morningState.emotionalTone,
                contribution: this.determineContribution(checkIn),
                needsSupport: checkIn.supportNeeded || checkIn.morningState.energyLevel < 4
            };
            // Store updated state
            await this.storeParticipantState(retreatId, participantState);
            // Recalculate group dynamics
            await this.recalculateGroupDynamics(retreatId);
            logger_1.logger.info('Participant state updated in group dynamics', {
                participantId,
                retreatId
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update participant state', error);
            throw error;
        }
    }
    // Get current group dynamics
    async getCurrentDynamics(retreatId, includeIndividual) {
        try {
            // Get all participant states
            const participantStates = await this.getAllParticipantStates(retreatId);
            // Calculate elemental balance
            const elementalBalance = this.calculateElementalBalance(participantStates);
            // Calculate energy field
            const energyField = this.calculateEnergyField(participantStates);
            // Generate coherence map
            const coherenceMap = await this.generateCoherenceMap(retreatId, participantStates);
            // Identify collective patterns
            const collectivePatterns = this.identifyCollectivePatterns(participantStates);
            // Generate recommendations
            const recommendations = this.generateGroupRecommendations(elementalBalance, energyField, coherenceMap, collectivePatterns);
            const dynamics = {
                retreatId,
                timestamp: new Date(),
                elementalBalance,
                energyField,
                coherenceMap,
                participantStates: includeIndividual ? participantStates : [],
                collectivePatterns,
                recommendations
            };
            return dynamics;
        }
        catch (error) {
            logger_1.logger.error('Failed to get current dynamics', error);
            throw error;
        }
    }
    // Update session dynamics
    async updateSessionDynamics(sessionId, participation) {
        try {
            // Get session info
            const { data: session } = await supabaseClient_1.supabase
                .from('live_sessions')
                .select('retreat_id')
                .eq('id', sessionId)
                .single();
            if (!session)
                return;
            // Update session field
            const currentField = await this.getSessionField(sessionId);
            // Add participant contribution
            const updatedField = this.integrateParticipantContribution(currentField, participation);
            // Store updated field
            await supabaseClient_1.supabase
                .from('session_dynamics')
                .upsert({
                session_id: sessionId,
                field_data: updatedField,
                updated_at: new Date()
            });
            logger_1.logger.info('Session dynamics updated', { sessionId });
        }
        catch (error) {
            logger_1.logger.error('Failed to update session dynamics', error);
            throw error;
        }
    }
    // Get session field
    async getSessionField(sessionId) {
        try {
            const { data } = await supabaseClient_1.supabase
                .from('session_dynamics')
                .select('field_data')
                .eq('session_id', sessionId)
                .single();
            return data?.field_data || this.initializeSessionField();
        }
        catch (error) {
            logger_1.logger.error('Failed to get session field', error);
            throw error;
        }
    }
    // Get elemental field
    async getElementalField(retreatId) {
        try {
            const participantStates = await this.getAllParticipantStates(retreatId);
            return this.calculateElementalBalance(participantStates);
        }
        catch (error) {
            logger_1.logger.error('Failed to get elemental field', error);
            throw error;
        }
    }
    // Private helper methods
    determineContribution(checkIn) {
        const { energyLevel, emotionalTone } = checkIn.morningState;
        const { fire, water, earth, air, aether } = checkIn.elementalBalance;
        // Find dominant element for today
        const elements = { fire, water, earth, air, aether };
        const dominant = Object.entries(elements)
            .sort(([, a], [, b]) => b - a)[0][0];
        // Map contribution based on dominant element and energy
        if (dominant === 'earth' && energyLevel >= 6)
            return 'grounding';
        if (dominant === 'fire' && energyLevel >= 7)
            return 'catalyzing';
        if (dominant === 'water' && emotionalTone.includes('compassion'))
            return 'holding';
        if (dominant === 'air' && energyLevel >= 6)
            return 'flowing';
        if (dominant === 'aether' || energyLevel >= 8)
            return 'integrating';
        // Default based on energy level
        return energyLevel >= 6 ? 'flowing' : 'holding';
    }
    async getParticipantName(participantId) {
        const { data } = await supabaseClient_1.supabase
            .from('retreat_participants')
            .select('preferredName, firstName')
            .eq('id', participantId)
            .single();
        return data?.preferredName || data?.firstName || 'Participant';
    }
    async getParticipantElement(participantId) {
        const { data } = await supabaseClient_1.supabase
            .from('retreat_participants')
            .select('oracleElement')
            .eq('id', participantId)
            .single();
        return data?.oracleElement || 'aether';
    }
    async storeParticipantState(retreatId, state) {
        await supabaseClient_1.supabase
            .from('participant_states')
            .upsert({
            retreat_id: retreatId,
            participant_id: state.participantId,
            state_data: state,
            updated_at: new Date()
        });
    }
    async recalculateGroupDynamics(retreatId) {
        const dynamics = await this.getCurrentDynamics(retreatId, false);
        await supabaseClient_1.supabase
            .from('group_dynamics')
            .upsert({
            retreat_id: retreatId,
            dynamics_data: dynamics,
            calculated_at: new Date()
        });
    }
    async getAllParticipantStates(retreatId) {
        const { data } = await supabaseClient_1.supabase
            .from('participant_states')
            .select('state_data')
            .eq('retreat_id', retreatId);
        return data?.map(d => d.state_data) || [];
    }
    calculateElementalBalance(states) {
        const elementCounts = {
            fire: 0,
            water: 0,
            earth: 0,
            air: 0,
            aether: 0
        };
        const elementEnergies = {
            fire: [],
            water: [],
            earth: [],
            air: [],
            aether: []
        };
        states.forEach(state => {
            elementCounts[state.element]++;
            elementEnergies[state.element].push(state.currentEnergy);
        });
        // Calculate average energies
        const elementAverages = {};
        Object.entries(elementEnergies).forEach(([element, energies]) => {
            elementAverages[element] = energies.length > 0
                ? energies.reduce((a, b) => a + b, 0) / energies.length
                : 0;
        });
        // Find dominant and missing
        const dominant = Object.entries(elementCounts)
            .sort(([, a], [, b]) => b - a)[0][0];
        const missing = Object.entries(elementCounts)
            .filter(([, count]) => count === 0)
            .map(([element]) => element);
        // Generate balancing recommendations
        const balancingRecommendations = this.generateBalancingRecommendations(elementCounts, elementAverages, missing);
        return {
            ...elementAverages,
            dominant,
            missing,
            balancingRecommendations
        };
    }
    calculateEnergyField(states) {
        const energyLevels = states.map(s => s.currentEnergy);
        const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
        // Calculate intensity
        const intensity = Math.min(10, Math.round(avgEnergy));
        // Calculate coherence (inverse of variance)
        const variance = this.calculateVariance(energyLevels);
        const coherence = Math.max(1, Math.round(10 - variance));
        // Determine flow
        let flow = 'flowing';
        if (avgEnergy < 4 || coherence < 4)
            flow = 'blocked';
        if (avgEnergy > 7 && coherence > 7)
            flow = 'accelerating';
        // Identify vortex points
        const vortexPoints = this.identifyVortexPoints(states);
        // Generate field notes
        const fieldNotes = this.generateFieldNotes(intensity, coherence, flow, vortexPoints);
        return {
            intensity,
            coherence,
            flow,
            vortexPoints,
            fieldNotes
        };
    }
    async generateCoherenceMap(retreatId, states) {
        // Get interaction data
        const { data: interactions } = await supabaseClient_1.supabase
            .from('participant_interactions')
            .select('*')
            .eq('retreat_id', retreatId);
        // Build connections
        const connections = [];
        const connectionMap = new Map();
        interactions?.forEach(interaction => {
            connections.push({
                participant1: interaction.participant1_id,
                participant2: interaction.participant2_id,
                strength: interaction.strength || 5,
                type: interaction.type || 'neutral'
            });
            // Build connection map for clustering
            if (!connectionMap.has(interaction.participant1_id)) {
                connectionMap.set(interaction.participant1_id, new Set());
            }
            if (!connectionMap.has(interaction.participant2_id)) {
                connectionMap.set(interaction.participant2_id, new Set());
            }
            connectionMap.get(interaction.participant1_id).add(interaction.participant2_id);
            connectionMap.get(interaction.participant2_id).add(interaction.participant1_id);
        });
        // Identify clusters
        const clusters = this.identifyClusters(states, connectionMap);
        // Find isolated participants
        const connectedParticipants = new Set();
        connections.forEach(c => {
            connectedParticipants.add(c.participant1);
            connectedParticipants.add(c.participant2);
        });
        const isolatedParticipants = states
            .map(s => s.participantId)
            .filter(id => !connectedParticipants.has(id));
        // Calculate overall coherence
        const overallCoherence = this.calculateOverallCoherence(connections, states.length);
        return {
            overallCoherence,
            connections,
            clusters,
            isolatedParticipants
        };
    }
    identifyCollectivePatterns(states) {
        const patterns = [];
        // Check for low energy pattern
        const lowEnergyParticipants = states.filter(s => s.currentEnergy < 4);
        if (lowEnergyParticipants.length > states.length * 0.3) {
            patterns.push({
                type: 'shadow',
                description: 'Collective energy depletion',
                affectedParticipants: lowEnergyParticipants.map(p => p.participantId),
                recommendations: [
                    'Group energizing practice needed',
                    'Check for unprocessed group shadow',
                    'Consider rest and restoration time'
                ]
            });
        }
        // Check for high coherence pattern
        const supportiveStates = states.filter(s => s.contribution === 'holding' || s.contribution === 'integrating');
        if (supportiveStates.length > states.length * 0.6) {
            patterns.push({
                type: 'light',
                description: 'High group coherence and support',
                affectedParticipants: supportiveStates.map(p => p.participantId),
                recommendations: [
                    'Leverage this coherence for deep work',
                    'Time for breakthrough practices',
                    'Celebrate the group field'
                ]
            });
        }
        // Check for integration needs
        const needsSupportCount = states.filter(s => s.needsSupport).length;
        if (needsSupportCount > 3) {
            patterns.push({
                type: 'integration',
                description: 'Multiple participants need integration support',
                affectedParticipants: states.filter(s => s.needsSupport).map(p => p.participantId),
                recommendations: [
                    'Schedule integration circles',
                    'Increase facilitator presence',
                    'Buddy system activation'
                ]
            });
        }
        return patterns;
    }
    generateGroupRecommendations(elementalBalance, energyField, coherenceMap, patterns) {
        const recommendations = [];
        // Elemental recommendations
        recommendations.push(...elementalBalance.balancingRecommendations);
        // Energy field recommendations
        if (energyField.flow === 'blocked') {
            recommendations.push('Energy clearing practice recommended');
            recommendations.push('Movement or breathwork to unblock flow');
        }
        if (energyField.flow === 'accelerating') {
            recommendations.push('Grounding practice to stabilize high energy');
            recommendations.push('Integration time before next intensive');
        }
        // Coherence recommendations
        if (coherenceMap.overallCoherence < 5) {
            recommendations.push('Group bonding activity needed');
            recommendations.push('Address any unspoken tensions');
        }
        if (coherenceMap.isolatedParticipants.length > 0) {
            recommendations.push(`Check in with ${coherenceMap.isolatedParticipants.length} isolated participants`);
        }
        // Pattern-based recommendations
        patterns.forEach(pattern => {
            recommendations.push(...pattern.recommendations);
        });
        return [...new Set(recommendations)]; // Remove duplicates
    }
    generateBalancingRecommendations(counts, averages, missing) {
        const recommendations = [];
        missing.forEach(element => {
            recommendations.push(`Invoke ${element} energy through specific practices`);
        });
        // Check for imbalances
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        Object.entries(counts).forEach(([element, count]) => {
            const percentage = count / total;
            if (percentage > 0.4) {
                recommendations.push(`Balance dominant ${element} with complementary elements`);
            }
        });
        return recommendations;
    }
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
    }
    identifyVortexPoints(states) {
        const vortexPoints = [];
        states.forEach(state => {
            let type = 'harmonizer';
            let intensity = 5;
            // High energy catalysts
            if (state.currentEnergy >= 8 && state.contribution === 'catalyzing') {
                type = 'catalyst';
                intensity = state.currentEnergy;
            }
            // Low energy disruptors
            else if (state.currentEnergy <= 3) {
                type = 'disruptor';
                intensity = 10 - state.currentEnergy;
            }
            // Grounding generators
            else if (state.contribution === 'grounding' && state.currentEnergy >= 6) {
                type = 'generator';
                intensity = state.currentEnergy;
            }
            if (type !== 'harmonizer' || state.currentEnergy >= 7) {
                vortexPoints.push({
                    participantId: state.participantId,
                    type,
                    intensity,
                    element: state.element
                });
            }
        });
        return vortexPoints;
    }
    generateFieldNotes(intensity, coherence, flow, vortexPoints) {
        const notes = [];
        if (intensity >= 8)
            notes.push('High energy field - channel wisely');
        if (intensity <= 4)
            notes.push('Low energy field - gentle restoration needed');
        if (coherence >= 8)
            notes.push('Excellent group coherence');
        if (coherence <= 4)
            notes.push('Fragmented field - unify through shared practice');
        if (flow === 'blocked')
            notes.push('Energy blockages detected');
        if (flow === 'accelerating')
            notes.push('Rapid transformation potential');
        const catalysts = vortexPoints.filter(v => v.type === 'catalyst').length;
        if (catalysts > 2)
            notes.push(`${catalysts} catalysts active - expect breakthroughs`);
        const disruptors = vortexPoints.filter(v => v.type === 'disruptor').length;
        if (disruptors > 0)
            notes.push(`${disruptors} participants need support`);
        return notes;
    }
    identifyClusters(states, connectionMap) {
        const clusters = [];
        const visited = new Set();
        states.forEach(state => {
            if (!visited.has(state.participantId)) {
                const cluster = this.buildCluster(state.participantId, connectionMap, visited, states);
                if (cluster.participants.length > 2) {
                    clusters.push(cluster);
                }
            }
        });
        return clusters;
    }
    buildCluster(startId, connectionMap, visited, states) {
        const participants = [];
        const queue = [startId];
        const elements = {};
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current))
                continue;
            visited.add(current);
            participants.push(current);
            // Track elements
            const state = states.find(s => s.participantId === current);
            if (state) {
                elements[state.element] = (elements[state.element] || 0) + 1;
            }
            // Add connected participants
            const connections = connectionMap.get(current) || new Set();
            connections.forEach(connected => {
                if (!visited.has(connected)) {
                    queue.push(connected);
                }
            });
        }
        // Determine center element
        const centerElement = Object.entries(elements)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'aether';
        // Calculate cluster coherence
        const clusterStates = states.filter(s => participants.includes(s.participantId));
        const energies = clusterStates.map(s => s.currentEnergy);
        const coherence = energies.length > 0
            ? 10 - this.calculateVariance(energies)
            : 5;
        // Determine purpose based on composition
        const purpose = this.determineClusterPurpose(clusterStates);
        return {
            participants,
            centerElement,
            coherence: Math.round(coherence),
            purpose
        };
    }
    determineClusterPurpose(states) {
        const contributions = states.map(s => s.contribution);
        if (contributions.filter(c => c === 'grounding').length > states.length / 2) {
            return 'Stability anchor';
        }
        if (contributions.filter(c => c === 'catalyzing').length > states.length / 2) {
            return 'Transformation catalyst';
        }
        if (contributions.filter(c => c === 'holding').length > states.length / 2) {
            return 'Emotional container';
        }
        if (contributions.filter(c => c === 'integrating').length > states.length / 2) {
            return 'Integration circle';
        }
        return 'Mixed support';
    }
    calculateOverallCoherence(connections, totalParticipants) {
        if (totalParticipants < 2)
            return 10;
        // Calculate based on connection density and quality
        const possibleConnections = (totalParticipants * (totalParticipants - 1)) / 2;
        const connectionDensity = connections.length / possibleConnections;
        // Calculate average connection strength
        const avgStrength = connections.length > 0
            ? connections.reduce((sum, c) => sum + c.strength, 0) / connections.length
            : 0;
        // Weight supportive connections higher
        const supportiveRatio = connections.filter(c => c.type === 'supportive').length / connections.length;
        // Combined coherence score
        const coherence = (connectionDensity * 3 + avgStrength / 10 * 3 + supportiveRatio * 4);
        return Math.min(10, Math.round(coherence));
    }
    integrateParticipantContribution(currentField, participation) {
        // Update field based on participation
        const field = { ...currentField };
        // Add energy contribution
        field.totalEnergy = (field.totalEnergy || 0) + participation.engagement.presenceLevel;
        field.participantCount = (field.participantCount || 0) + 1;
        // Track energy contributions
        if (!field.energyContributions)
            field.energyContributions = {};
        field.energyContributions[participation.engagement.energyContribution] =
            (field.energyContributions[participation.engagement.energyContribution] || 0) + 1;
        // Update coherence
        field.coherenceReadings = field.coherenceReadings || [];
        field.coherenceReadings.push(participation.groupResonance.groupCoherence);
        // Track breakthroughs
        if (participation.engagement.breakthroughs?.length > 0) {
            field.breakthroughs = field.breakthroughs || [];
            field.breakthroughs.push(...participation.engagement.breakthroughs);
        }
        return field;
    }
    initializeSessionField() {
        return {
            totalEnergy: 0,
            participantCount: 0,
            energyContributions: {},
            coherenceReadings: [],
            breakthroughs: [],
            startTime: new Date()
        };
    }
}
exports.GroupDynamicsService = GroupDynamicsService;
// Export singleton instance
exports.groupDynamicsService = new GroupDynamicsService();
