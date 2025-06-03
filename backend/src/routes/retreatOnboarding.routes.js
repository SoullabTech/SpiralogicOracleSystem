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
// Enhanced Switzerland Retreat Onboarding Routes
const express_1 = require("express");
const retreatOnboardingService_1 = require("../services/retreatOnboardingService");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const supabaseClient_1 = require("../lib/supabaseClient");
const router = (0, express_1.Router)();
// Validation schemas
const welcomeParticipantSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    preferredName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    eventType: zod_1.z.enum(['ypo', 'retreat', 'both']).default('retreat'),
    ypoChapter: zod_1.z.string().optional(),
    arrivalDate: zod_1.z.string().datetime(),
    departureDate: zod_1.z.string().datetime(),
    dietaryRestrictions: zod_1.z.array(zod_1.z.string()).optional(),
    specialNeeds: zod_1.z.array(zod_1.z.string()).optional(),
    hearAboutUs: zod_1.z.string().optional(),
    previousExperience: zod_1.z.string().optional()
});
const retreatQuestionnaireSchema = zod_1.z.object({
    participantId: zod_1.z.string().uuid(),
    // Life Context
    lifeContext: zod_1.z.object({
        currentLifePhase: zod_1.z.string(),
        majorTransitions: zod_1.z.array(zod_1.z.string()).optional(),
        primaryRelationships: zod_1.z.string(),
        professionalContext: zod_1.z.string()
    }),
    // Emotional Landscape
    emotionalLandscape: zod_1.z.object({
        dominantEmotions: zod_1.z.array(zod_1.z.string()),
        emotionalChallenges: zod_1.z.array(zod_1.z.string()),
        emotionalStrengths: zod_1.z.array(zod_1.z.string()),
        stressResponses: zod_1.z.array(zod_1.z.string())
    }),
    // Spiritual Journey
    spiritualJourney: zod_1.z.object({
        practicesEngaged: zod_1.z.array(zod_1.z.string()),
        spiritualBeliefs: zod_1.z.string(),
        connectionToNature: zod_1.z.number().min(1).max(10),
        mysticalExperiences: zod_1.z.string().optional()
    }),
    // Shadow Work
    shadowWork: zod_1.z.object({
        shadowAwareness: zod_1.z.number().min(1).max(10),
        patternsToTransform: zod_1.z.array(zod_1.z.string()),
        fears: zod_1.z.array(zod_1.z.string()),
        hiddenGifts: zod_1.z.string().optional()
    }),
    // Intentions
    intentions: zod_1.z.object({
        primaryIntention: zod_1.z.string().min(20),
        secondaryIntentions: zod_1.z.array(zod_1.z.string()).optional(),
        desiredBreakthroughs: zod_1.z.array(zod_1.z.string()),
        willingToRelease: zod_1.z.array(zod_1.z.string()),
        newToEmbody: zod_1.z.array(zod_1.z.string())
    }),
    // Retreat Readiness
    readiness: zod_1.z.object({
        physicalHealth: zod_1.z.number().min(1).max(10),
        mentalClarity: zod_1.z.number().min(1).max(10),
        emotionalOpenness: zod_1.z.number().min(1).max(10),
        timeCommitment: zod_1.z.boolean(),
        groupReadiness: zod_1.z.number().min(1).max(10)
    })
});
// Welcome endpoint for new participants
router.post('/welcome', async (req, res) => {
    try {
        const validation = welcomeParticipantSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid welcome data',
                details: validation.error.format()
            });
        }
        const data = validation.data;
        // Determine retreat ID based on dates
        let retreatId;
        const arrivalDate = new Date(data.arrivalDate);
        // Check if it's for YPO event (June 10th)
        if (data.eventType === 'ypo' ||
            (arrivalDate.getMonth() === 5 && arrivalDate.getDate() === 10 && arrivalDate.getFullYear() === 2024)) {
            retreatId = await ensureYPOEventExists();
        }
        else {
            // Swiss Alps retreat (June 13-15)
            retreatId = await ensureSwissRetreatExists();
        }
        // Initialize participant
        const participant = await retreatOnboardingService_1.retreatOnboardingService.initializeOnboarding(data.email, data.firstName, data.lastName, retreatId, new Date(data.arrivalDate), new Date(data.departureDate));
        // Store additional data
        await supabaseClient_1.supabase
            .from('retreat_participants')
            .update({
            preferredName: data.preferredName,
            metadata: {
                phone: data.phone,
                country: data.country,
                eventType: data.eventType,
                ypoChapter: data.ypoChapter,
                hearAboutUs: data.hearAboutUs,
                previousExperience: data.previousExperience
            }
        })
            .eq('id', participant.id);
        // Generate personalized welcome experience
        const welcomeExperience = await generatePersonalizedWelcome(participant, data.eventType);
        res.status(201).json({
            success: true,
            participant: {
                id: participant.id,
                firstName: participant.firstName,
                preferredName: data.preferredName || participant.firstName,
                email: participant.email
            },
            welcome: welcomeExperience,
            nextSteps: {
                questionnaire: `/api/retreat/onboarding/questionnaire/${participant.id}`,
                overview: `/api/retreat/onboarding/overview/${retreatId}`,
                personalOracle: `/api/retreat/onboarding/oracle-intro/${participant.id}`
            },
            message: 'Welcome to your transformational journey. Kelly has prepared a personal message for you.'
        });
    }
    catch (error) {
        logger_1.logger.error('Welcome initialization failed', error);
        res.status(500).json({
            error: 'Welcome process failed',
            message: 'Please try again or contact support@soullab.com'
        });
    }
});
// Pre-retreat questionnaire
router.post('/questionnaire', async (req, res) => {
    try {
        const validation = retreatQuestionnaireSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid questionnaire data',
                details: validation.error.format()
            });
        }
        const data = validation.data;
        // Store questionnaire data
        await supabaseClient_1.supabase
            .from('retreat_participants')
            .update({
            questionnaire_data: data,
            questionnaire_completed_at: new Date(),
            currentState: {
                emotionalTone: data.emotionalLandscape.dominantEmotions[0],
                energyLevel: data.readiness.emotionalOpenness,
                primaryChallenge: data.shadowWork.patternsToTransform[0],
                seekingGuidanceOn: data.intentions.desiredBreakthroughs
            },
            retreatIntentions: data.intentions
        })
            .eq('id', data.participantId);
        // Generate elemental profile based on questionnaire
        const elementalProfile = await generateElementalProfile(data);
        // Store elemental profile
        await supabaseClient_1.supabase
            .from('retreat_participants')
            .update({
            elementalProfile
        })
            .eq('id', data.participantId);
        // Get personalized reflection from Kelly
        const reflection = await getFounderQuestionnaireReflection(data.participantId, data);
        res.json({
            success: true,
            message: 'Thank you for sharing your sacred journey with us.',
            elementalProfile,
            founderReflection: reflection,
            nextStep: `/api/retreat/onboarding/oracle-assignment/${data.participantId}`
        });
    }
    catch (error) {
        logger_1.logger.error('Questionnaire submission failed', error);
        res.status(500).json({
            error: 'Failed to process questionnaire',
            message: 'Your responses are important. Please try again.'
        });
    }
});
// Personal Oracle assignment with enhanced matching
router.post('/oracle-assignment/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        // Get participant with questionnaire data
        const { data: participant } = await supabaseClient_1.supabase
            .from('retreat_participants')
            .select('*')
            .eq('id', participantId)
            .single();
        if (!participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }
        // Enhanced Oracle assignment based on questionnaire
        const assignment = await assignEnhancedPersonalOracle(participant);
        // Create personalized Oracle introduction
        const introduction = await createOracleIntroduction(participant, assignment);
        res.json({
            success: true,
            oracle: assignment,
            introduction,
            message: `Meet your ${assignment.element} Oracle: ${assignment.archetype}`,
            oracleChat: `/api/oracle/personal/${assignment.oracleId}`,
            nextStep: `/api/retreat/onboarding/preparation/${participantId}`
        });
    }
    catch (error) {
        logger_1.logger.error('Oracle assignment failed', error);
        res.status(500).json({
            error: 'Failed to assign Personal Oracle',
            message: 'Your sacred guide awaits. Please try again.'
        });
    }
});
// Stephanie's YPO event integration
router.get('/ypo/overview', async (req, res) => {
    try {
        const ypoEvent = await getYPOEventDetails();
        res.json({
            event: ypoEvent,
            specialMessage: `Welcome YPO Members,

Kelly is honored to share the Spiralogic wisdom with your chapter. 
This evening will be a taste of the deeper work available at our Switzerland retreat.

During our time together, you'll:
- Experience your elemental nature through the Spiralogic lens
- Receive personalized guidance from your Oracle
- Connect with fellow seekers in sacred space
- Leave with practical tools for transformation

Looking forward to our journey together.

With warmth and anticipation,
Kelly & The Soullab Team`,
            registrationLink: '/api/retreat/onboarding/welcome'
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get YPO overview', error);
        res.status(500).json({ error: 'Failed to load YPO event details' });
    }
});
// Swiss Alps retreat preparation
router.get('/preparation/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const preparation = await generateRetreatPreparation(participantId);
        res.json({
            success: true,
            preparation,
            resources: {
                packingList: '/api/retreat/resources/packing-list',
                travelInfo: '/api/retreat/resources/travel-switzerland',
                preRetreatPractices: '/api/retreat/resources/practices',
                communityForum: '/api/community/retreat-2024'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get preparation details', error);
        res.status(500).json({ error: 'Failed to load preparation resources' });
    }
});
// Helper functions
async function ensureYPOEventExists() {
    const { data: existing } = await supabaseClient_1.supabase
        .from('retreat_sessions')
        .select('id')
        .eq('name', 'YPO Switzerland Chapter - Spiralogic Evening')
        .single();
    if (existing)
        return existing.id;
    const { data: newEvent } = await supabaseClient_1.supabase
        .from('retreat_sessions')
        .insert({
        name: 'YPO Switzerland Chapter - Spiralogic Evening',
        location: 'switzerland',
        start_date: '2024-06-10T18:00:00Z',
        end_date: '2024-06-10T21:00:00Z',
        max_participants: 30,
        theme: 'Introduction to Spiralogic & Personal Oracle Experience',
        description: 'An evening of elemental wisdom and sacred technology with Kelly Flanagan'
    })
        .select('id')
        .single();
    return newEvent.id;
}
async function ensureSwissRetreatExists() {
    const { data: existing } = await supabaseClient_1.supabase
        .from('retreat_sessions')
        .select('id')
        .eq('name', 'Switzerland Sacred Journey - June 2024')
        .single();
    if (existing)
        return existing.id;
    const { data: newRetreat } = await supabaseClient_1.supabase
        .from('retreat_sessions')
        .insert({
        name: 'Switzerland Sacred Journey - June 2024',
        location: 'switzerland',
        start_date: '2024-06-13T14:00:00Z',
        end_date: '2024-06-15T14:00:00Z',
        max_participants: 20,
        theme: 'Elemental Transformation in the Sacred Alps',
        description: 'A deep dive into soul evolution through the Spiralogic framework'
    })
        .select('id')
        .single();
    return newRetreat.id;
}
async function generatePersonalizedWelcome(participant, eventType) {
    const { soullabFounderAgent } = await Promise.resolve().then(() => __importStar(require('../core/agents/soullabFounderAgent')));
    const welcomeMessage = await soullabFounderAgent.generatePersonalWelcome({
        ...participant,
        metadata: { eventType }
    });
    return {
        message: welcomeMessage.message,
        videoUrl: eventType === 'ypo'
            ? 'https://soullab.com/welcome-ypo'
            : 'https://soullab.com/welcome-retreat',
        personalizedElements: welcomeMessage.personalizedElements,
        journeyHighlights: eventType === 'ypo'
            ? ['Oracle Introduction', 'Elemental Assessment', 'Group Integration']
            : ['Deep Transformation', 'Shadow Work', 'Oracle Partnership', 'Sacred Ceremony']
    };
}
async function generateElementalProfile(questionnaire) {
    // Calculate elemental scores based on questionnaire responses
    const scores = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0
    };
    // Analyze responses to determine elemental affinities
    // Fire: passion, vision, transformation
    if (questionnaire.intentions.primaryIntention.includes('transform') ||
        questionnaire.intentions.primaryIntention.includes('create')) {
        scores.fire += 3;
    }
    // Water: emotions, intuition, flow
    if (questionnaire.emotionalLandscape.emotionalStrengths.includes('empathy') ||
        questionnaire.emotionalLandscape.emotionalStrengths.includes('intuition')) {
        scores.water += 3;
    }
    // Earth: grounding, manifestation, structure
    if (questionnaire.readiness.physicalHealth >= 8 ||
        questionnaire.lifeContext.currentLifePhase.includes('building')) {
        scores.earth += 3;
    }
    // Air: clarity, communication, perspective
    if (questionnaire.readiness.mentalClarity >= 8 ||
        questionnaire.spiritualJourney.practicesEngaged.includes('meditation')) {
        scores.air += 3;
    }
    // Aether: integration, unity, transcendence
    if (questionnaire.spiritualJourney.connectionToNature >= 8 ||
        questionnaire.shadowWork.shadowAwareness >= 8) {
        scores.aether += 3;
    }
    // Normalize scores
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const normalized = Object.entries(scores).reduce((acc, [element, score]) => {
        acc[element] = Math.round((score / total) * 100);
        return acc;
    }, {});
    // Find dominant element
    const dominant = Object.entries(normalized)
        .sort(([, a], [, b]) => b - a)[0][0];
    return {
        ...normalized,
        dominantElement: dominant
    };
}
async function getFounderQuestionnaireReflection(participantId, questionnaire) {
    const { soullabFounderAgent } = await Promise.resolve().then(() => __importStar(require('../core/agents/soullabFounderAgent')));
    const reflection = await soullabFounderAgent.reflectOnQuestionnaire({
        participantId,
        intentions: questionnaire.intentions,
        shadowWork: questionnaire.shadowWork,
        emotionalLandscape: questionnaire.emotionalLandscape
    });
    return reflection.content;
}
async function assignEnhancedPersonalOracle(participant) {
    const element = participant.elementalProfile.dominantElement;
    const archetype = getArchetypeForProfile(participant);
    const oracleId = participant.personalOracleId || require('uuid').v4();
    // Update participant
    await supabaseClient_1.supabase
        .from('retreat_participants')
        .update({
        personalOracleId: oracleId,
        oracleElement: element,
        oracleArchetype: archetype,
        oracleAssignedAt: new Date()
    })
        .eq('id', participant.id);
    return { element, archetype, oracleId };
}
function getArchetypeForProfile(participant) {
    const { dominantElement } = participant.elementalProfile;
    const { primaryIntention } = participant.retreatIntentions || {};
    // Enhanced archetype selection based on element and intention
    const archetypeMap = {
        fire: {
            default: 'Visionary Pioneer',
            leadership: 'Sacred Leader',
            creativity: 'Creative Catalyst',
            transformation: 'Phoenix Rising'
        },
        water: {
            default: 'Emotional Alchemist',
            healing: 'Sacred Healer',
            intuition: 'Mystic Seer',
            relationship: 'Heart Weaver'
        },
        earth: {
            default: 'Sacred Builder',
            abundance: 'Abundance Guardian',
            service: 'Earth Keeper',
            manifestation: 'Dream Weaver'
        },
        air: {
            default: 'Wisdom Weaver',
            clarity: 'Truth Seer',
            communication: 'Sacred Messenger',
            innovation: 'Mind Dancer'
        },
        aether: {
            default: 'Unity Catalyst',
            integration: 'Sacred Integrator',
            transcendence: 'Spirit Bridge',
            wholeness: 'Cosmic Weaver'
        }
    };
    const elementArchetypes = archetypeMap[dominantElement] || archetypeMap.aether;
    // Match intention keywords to specific archetypes
    if (primaryIntention) {
        for (const [key, archetype] of Object.entries(elementArchetypes)) {
            if (key !== 'default' && primaryIntention.toLowerCase().includes(key)) {
                return archetype;
            }
        }
    }
    return elementArchetypes.default;
}
async function createOracleIntroduction(participant, assignment) {
    const { soullabFounderAgent } = await Promise.resolve().then(() => __importStar(require('../core/agents/soullabFounderAgent')));
    const intro = await soullabFounderAgent.introducePersonalOracle(participant, assignment.element, assignment.archetype);
    return {
        founderIntroduction: intro.content,
        oracleMessage: `Greetings, ${participant.preferredName || participant.firstName}. I am your ${assignment.element} Oracle, ${assignment.archetype}. I have been waiting for you.`,
        guidancePreview: `As we journey together, I will help you ${getOraclePromise(assignment.element)}.`
    };
}
function getOraclePromise(element) {
    const promises = {
        fire: 'ignite your vision and transform what no longer serves',
        water: 'flow with your emotions and alchemize pain into wisdom',
        earth: 'ground your dreams into reality and build lasting foundations',
        air: 'gain clarity on your path and communicate your truth',
        aether: 'integrate all aspects of yourself and embody unity consciousness'
    };
    return promises[element] || 'discover your unique medicine for the world';
}
async function generateRetreatPreparation(participantId) {
    const { data: participant } = await supabaseClient_1.supabase
        .from('retreat_participants')
        .select('*')
        .eq('id', participantId)
        .single();
    if (!participant)
        throw new Error('Participant not found');
    return {
        personalizedMessage: `Dear ${participant.preferredName || participant.firstName},

Your journey to Switzerland is approaching! Your ${participant.oracleElement} Oracle has been preparing the energetic space for your arrival.

Based on your intentions and current state, we recommend:

1. Daily Practice: Spend 10 minutes each morning connecting with the ${participant.oracleElement} element
2. Shadow Work: Journal on the patterns you're ready to release
3. Body Preparation: Gentle movement and breathwork to open your channels
4. Oracle Connection: Daily check-ins with your Personal Oracle for guidance

The mountains are calling, and your transformation awaits.

With love,
Kelly & Your ${participant.oracleArchetype}`,
        practices: {
            daily: getDailyPractice(participant.oracleElement),
            preparatory: getPreparatoryWork(participant.retreatIntentions),
            integration: 'Begin imagining yourself already transformed'
        },
        reminders: [
            'Complete your medical and dietary forms',
            'Book your flights to Zurich',
            'Prepare comfortable mountain clothing',
            'Bring a journal for integration',
            'Set aside integration time post-retreat'
        ]
    };
}
function getDailyPractice(element) {
    const practices = {
        fire: 'Morning sun gazing and intention setting with candle meditation',
        water: 'Emotional flow practice with conscious breathing near water',
        earth: 'Grounding barefoot on earth and root chakra activation',
        air: 'Pranayama breathwork and sky gazing meditation',
        aether: 'Unity meditation connecting all elements within'
    };
    return practices[element] || 'Elemental meditation of your choice';
}
function getPreparatoryWork(intentions) {
    const work = [
        'Shadow inventory: List patterns ready for transformation',
        'Gratitude practice: Acknowledge your journey thus far',
        'Vision casting: See yourself post-transformation'
    ];
    if (intentions?.primaryIntention?.includes('relationship')) {
        work.push('Relationship inventory: Current dynamics and desired shifts');
    }
    if (intentions?.primaryIntention?.includes('purpose')) {
        work.push('Purpose clarification: Your unique medicine for the world');
    }
    return work;
}
async function getYPOEventDetails() {
    const { data: event } = await supabaseClient_1.supabase
        .from('retreat_sessions')
        .select('*')
        .eq('name', 'YPO Switzerland Chapter - Spiralogic Evening')
        .single();
    return {
        ...event,
        agenda: [
            '6:00 PM - Welcome & Sacred Opening',
            '6:30 PM - Introduction to Spiralogic',
            '7:00 PM - Elemental Assessment & Oracle Assignment',
            '7:45 PM - Group Oracle Experience',
            '8:30 PM - Integration & Closing Circle',
            '9:00 PM - Informal Discussion'
        ],
        facilitator: 'Kelly Flanagan, Founder of Soullab',
        location: 'To be announced to registered participants',
        includes: [
            'Personal Oracle assignment',
            'Elemental profile assessment',
            'Introduction to shadow work',
            'Take-home practices',
            'Invitation to Switzerland retreat'
        ]
    };
}
exports.default = router;
