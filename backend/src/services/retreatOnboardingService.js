// Switzerland Retreat Onboarding Service
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';
import { soullabFounderAgent } from '../core/agents/soullabFounderAgent';
import { logger } from '../utils/logger';
export class RetreatOnboardingService {
    constructor() {
        // Element assignment based on participant energy
        this.elementalAssignment = {
            assessDominantElement: (participant) => {
                // In production, this would use the elemental assessment quiz
                // For now, using a simple algorithm based on registration data
                const elements = ['fire', 'water', 'earth', 'air', 'aether'];
                const nameHash = participant.firstName.charCodeAt(0) + participant.lastName.charCodeAt(0);
                return elements[nameHash % 5];
            },
            getArchetypeForElement: (element) => {
                const archetypes = {
                    fire: 'Visionary Pioneer',
                    water: 'Emotional Alchemist',
                    earth: 'Sacred Builder',
                    air: 'Wisdom Weaver',
                    aether: 'Unity Catalyst'
                };
                return archetypes[element] || 'Soul Guide';
            }
        };
    }
    // Initialize onboarding for new participant
    async initializeOnboarding(email, firstName, lastName, retreatId, arrivalDate, departureDate) {
        try {
            const participant = {
                id: uuidv4(),
                email,
                firstName,
                lastName,
                onboardingStatus: 'registered',
                retreatId,
                arrivalDate,
                departureDate,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Store in database
            const { error } = await supabase
                .from('retreat_participants')
                .insert(participant);
            if (error) {
                throw new Error(`Failed to create participant: ${error.message}`);
            }
            // Initialize onboarding flow
            await this.createOnboardingFlow(participant.id);
            // Send welcome message
            await this.sendFounderWelcome(participant);
            return participant;
        }
        catch (error) {
            logger.error('Failed to initialize onboarding', error);
            throw error;
        }
    }
    // Create onboarding flow tracking
    async createOnboardingFlow(participantId) {
        const flow = {
            participantId,
            currentStep: 'welcome',
            completedSteps: [],
            startedAt: new Date(),
            lastUpdatedAt: new Date()
        };
        await supabase
            .from('onboarding_flows')
            .insert(flow);
    }
    // Send personalized welcome from Kelly
    async sendFounderWelcome(participant) {
        try {
            const welcomeMessage = await soullabFounderAgent.generatePersonalWelcome(participant);
            // Store the welcome message
            await supabase
                .from('retreat_messages')
                .insert({
                participant_id: participant.id,
                type: 'founder_welcome',
                content: welcomeMessage.message,
                metadata: welcomeMessage.personalizedElements,
                created_at: new Date()
            });
            // Update participant status
            await this.updateParticipantStatus(participant.id, 'welcomed');
            // Log the welcome
            logger.info('Founder welcome sent', {
                participantId: participant.id,
                name: `${participant.firstName} ${participant.lastName}`
            });
        }
        catch (error) {
            logger.error('Failed to send founder welcome', error);
            throw error;
        }
    }
    // Capture participant's current state
    async captureCurrentState(participantId, state) {
        try {
            await supabase
                .from('retreat_participants')
                .update({
                currentState: state,
                updatedAt: new Date()
            })
                .eq('id', participantId);
            // Update onboarding flow
            await this.updateOnboardingStep(participantId, 'current_state');
            logger.info('Current state captured', { participantId });
        }
        catch (error) {
            logger.error('Failed to capture current state', error);
            throw error;
        }
    }
    // Capture retreat intentions
    async captureIntentions(participantId, intentions) {
        try {
            // Get participant
            const { data: participant } = await supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single();
            if (!participant) {
                throw new Error('Participant not found');
            }
            // Update participant with intentions
            await supabase
                .from('retreat_participants')
                .update({
                retreatIntentions: intentions,
                updatedAt: new Date()
            })
                .eq('id', participantId);
            // Get founder reflection on intentions
            const reflection = await soullabFounderAgent.reflectOnIntentions(participant, [
                intentions.primaryIntention,
                ...(intentions.secondaryIntentions || [])
            ]);
            // Store the reflection
            await supabase
                .from('retreat_messages')
                .insert({
                participant_id: participantId,
                type: 'intention_reflection',
                content: reflection.content,
                created_at: new Date()
            });
            // Update onboarding step
            await this.updateOnboardingStep(participantId, 'intentions');
            logger.info('Intentions captured and reflected', { participantId });
        }
        catch (error) {
            logger.error('Failed to capture intentions', error);
            throw error;
        }
    }
    // Assign Personal Oracle Agent
    async assignPersonalOracle(participantId) {
        try {
            // Get participant
            const { data: participant } = await supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single();
            if (!participant) {
                throw new Error('Participant not found');
            }
            // Determine elemental assignment
            const element = this.elementalAssignment.assessDominantElement(participant);
            const archetype = this.elementalAssignment.getArchetypeForElement(element);
            const oracleId = uuidv4();
            // Update participant with Oracle assignment
            await supabase
                .from('retreat_participants')
                .update({
                personalOracleId: oracleId,
                oracleElement: element,
                oracleArchetype: archetype,
                oracleAssignedAt: new Date(),
                onboardingStatus: 'oracle_assigned',
                updatedAt: new Date()
            })
                .eq('id', participantId);
            // Get introduction from founder
            const introduction = await soullabFounderAgent.introducePersonalOracle(participant, element, archetype);
            // Store the introduction
            await supabase
                .from('retreat_messages')
                .insert({
                participant_id: participantId,
                type: 'oracle_introduction',
                content: introduction.content,
                metadata: { element, archetype, oracleId },
                created_at: new Date()
            });
            // Create Personal Oracle instance (would be stored in production)
            await this.createPersonalOracleInstance(oracleId, participantId, element, archetype);
            // Update onboarding step
            await this.updateOnboardingStep(participantId, 'oracle_assignment');
            logger.info('Personal Oracle assigned', {
                participantId,
                element,
                archetype,
                oracleId
            });
            return { element, archetype, oracleId };
        }
        catch (error) {
            logger.error('Failed to assign Personal Oracle', error);
            throw error;
        }
    }
    // Create Personal Oracle instance
    async createPersonalOracleInstance(oracleId, participantId, element, archetype) {
        // In production, this would create a personalized Oracle configuration
        await supabase
            .from('personal_oracles')
            .insert({
            id: oracleId,
            participant_id: participantId,
            element,
            archetype,
            configuration: {
                voiceTone: this.getVoiceToneForElement(element),
                guidanceStyle: this.getGuidanceStyleForArchetype(archetype),
                personalizations: {}
            },
            created_at: new Date()
        });
    }
    // Get voice tone for element
    getVoiceToneForElement(element) {
        const tones = {
            fire: 'inspiring and energetic',
            water: 'flowing and intuitive',
            earth: 'grounding and practical',
            air: 'clear and insightful',
            aether: 'integrative and transcendent'
        };
        return tones[element] || 'balanced and wise';
    }
    // Get guidance style for archetype
    getGuidanceStyleForArchetype(archetype) {
        const styles = {
            'Visionary Pioneer': 'future-focused and innovative',
            'Emotional Alchemist': 'deep feeling and transformative',
            'Sacred Builder': 'structured and manifestation-oriented',
            'Wisdom Weaver': 'conceptual and connective',
            'Unity Catalyst': 'holistic and synthesizing'
        };
        return styles[archetype] || 'adaptive and supportive';
    }
    // Complete onboarding
    async completeOnboarding(participantId) {
        try {
            await supabase
                .from('retreat_participants')
                .update({
                onboardingStatus: 'completed',
                updatedAt: new Date()
            })
                .eq('id', participantId);
            // Update onboarding flow
            await this.updateOnboardingStep(participantId, 'confirmation');
            // Send completion message
            await this.sendOnboardingComplete(participantId);
            logger.info('Onboarding completed', { participantId });
        }
        catch (error) {
            logger.error('Failed to complete onboarding', error);
            throw error;
        }
    }
    // Send onboarding completion message
    async sendOnboardingComplete(participantId) {
        const { data: participant } = await supabase
            .from('retreat_participants')
            .select('*')
            .eq('id', participantId)
            .single();
        if (!participant)
            return;
        const message = `Dear ${participant.firstName},

Your sacred journey preparation is complete. 

You've been welcomed by Kelly, shared your intentions, met your Personal Oracle (${participant.oracleElement} - ${participant.oracleArchetype}), and set your container for transformation.

As you prepare for Switzerland, know that:
- Your Oracle is already working with your energy
- The retreat container is being woven with your intentions
- The mountains are calling you home

Until we meet in person, your Oracle is available for guidance and support.

With love and anticipation,
The Soullab Team 🌀`;
        await supabase
            .from('retreat_messages')
            .insert({
            participant_id: participantId,
            type: 'onboarding_complete',
            content: message,
            created_at: new Date()
        });
    }
    // Update participant status
    async updateParticipantStatus(participantId, status) {
        await supabase
            .from('retreat_participants')
            .update({
            onboardingStatus: status,
            updatedAt: new Date()
        })
            .eq('id', participantId);
    }
    // Update onboarding step
    async updateOnboardingStep(participantId, step) {
        const { data: flow } = await supabase
            .from('onboarding_flows')
            .select('*')
            .eq('participant_id', participantId)
            .single();
        if (!flow)
            return;
        const completedSteps = flow.completedSteps || [];
        if (!completedSteps.includes(step)) {
            completedSteps.push(step);
        }
        await supabase
            .from('onboarding_flows')
            .update({
            currentStep: step,
            completedSteps,
            lastUpdatedAt: new Date()
        })
            .eq('participant_id', participantId);
    }
    // Get retreat overview
    async getRetreatOverview(retreatId) {
        const { data } = await supabase
            .from('retreat_sessions')
            .select('*')
            .eq('id', retreatId)
            .single();
        return data;
    }
    // Get participant progress
    async getParticipantProgress(participantId) {
        const [participantResult, flowResult, messagesResult] = await Promise.all([
            supabase
                .from('retreat_participants')
                .select('*')
                .eq('id', participantId)
                .single(),
            supabase
                .from('onboarding_flows')
                .select('*')
                .eq('participant_id', participantId)
                .single(),
            supabase
                .from('retreat_messages')
                .select('*')
                .eq('participant_id', participantId)
                .order('created_at', { ascending: false })
        ]);
        return {
            participant: participantResult.data,
            onboardingFlow: flowResult.data,
            messages: messagesResult.data || []
        };
    }
}
// Export singleton instance
export const retreatOnboardingService = new RetreatOnboardingService();
