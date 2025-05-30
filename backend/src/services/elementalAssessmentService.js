import { logger } from '../utils/logger';
export class ElementalAssessmentService {
    // Core assessment method combining multiple data sources
    async assessParticipant(participant, additionalData) {
        try {
            // Multi-dimensional assessment approach
            const textualAssessment = this.analyzeTextualContent(participant);
            const energeticAssessment = this.analyzeEnergeticSignatures(participant);
            const intentionalAssessment = this.analyzeIntentions(participant);
            const lifecycleAssessment = this.analyzeLifecycleContext(participant);
            // Weighted synthesis
            const rawScores = this.synthesizeAssessments([
                { weight: 0.3, scores: textualAssessment },
                { weight: 0.25, scores: energeticAssessment },
                { weight: 0.25, scores: intentionalAssessment },
                { weight: 0.2, scores: lifecycleAssessment }
            ]);
            // Apply sacred geometry normalization
            const normalizedScores = this.applySacredGeometryNormalization(rawScores);
            // Calculate crystallization and evolution metrics
            const crystallizationLevel = this.calculateCrystallization(normalizedScores);
            const evolutionPath = this.determineEvolutionPath(normalizedScores, participant);
            return {
                ...normalizedScores,
                dominantElement: this.findDominantElement(normalizedScores),
                secondaryElement: this.findSecondaryElement(normalizedScores),
                needsBalancing: this.identifyBalancingNeeds(normalizedScores),
                evolutionPath,
                crystallizationLevel
            };
        }
        catch (error) {
            logger.error('Elemental assessment failed', error);
            throw error;
        }
    }
    // Analyze textual content for elemental signatures
    analyzeTextualContent(participant) {
        const allText = [
            participant.retreatIntentions?.primaryIntention || '',
            ...(participant.retreatIntentions?.secondaryIntentions || []),
            ...(participant.retreatIntentions?.desiredOutcomes || []),
            participant.currentState?.emotionalTone || '',
            participant.currentState?.primaryChallenge || ''
        ].join(' ').toLowerCase();
        // Elemental word patterns with sacred geometry weights
        const patterns = {
            fire: {
                words: ['vision', 'create', 'passion', 'transform', 'ignite', 'breakthrough', 'inspire', 'energy', 'power', 'light', 'burn', 'blaze', 'spark', 'illuminate'],
                phrases: ['break through', 'light up', 'set on fire', 'creative force', 'spiritual fire'],
                weight: 1.0
            },
            water: {
                words: ['feel', 'flow', 'emotion', 'intuition', 'deep', 'healing', 'release', 'wash', 'cleanse', 'fluid', 'current', 'tide', 'stream', 'ocean'],
                phrases: ['go with flow', 'deep healing', 'emotional release', 'trust intuition', 'feel deeply'],
                weight: 1.0
            },
            earth: {
                words: ['ground', 'stable', 'build', 'manifest', 'practical', 'body', 'physical', 'solid', 'foundation', 'root', 'structure', 'material', 'tangible'],
                phrases: ['ground myself', 'build something', 'make real', 'solid foundation', 'practical steps'],
                weight: 1.0
            },
            air: {
                words: ['think', 'understand', 'clarity', 'communicate', 'ideas', 'mental', 'perspective', 'clear', 'breath', 'space', 'freedom', 'expand', 'communicate'],
                phrases: ['clear thinking', 'new perspective', 'fresh air', 'mental clarity', 'expand awareness'],
                weight: 1.0
            },
            aether: {
                words: ['unity', 'connect', 'integrate', 'whole', 'spiritual', 'transcend', 'synthesis', 'cosmic', 'divine', 'sacred', 'infinite', 'consciousness'],
                phrases: ['spiritual connection', 'higher purpose', 'feel connected', 'bigger picture', 'sacred unity'],
                weight: 1.0
            }
        };
        const scores = {};
        Object.entries(patterns).forEach(([element, pattern]) => {
            let score = 0;
            // Word analysis
            pattern.words.forEach(word => {
                const matches = (allText.match(new RegExp(word, 'g')) || []).length;
                score += matches * 10;
            });
            // Phrase analysis (higher weight)
            pattern.phrases.forEach(phrase => {
                const matches = (allText.match(new RegExp(phrase, 'g')) || []).length;
                score += matches * 20;
            });
            scores[element] = Math.min(score, 100); // Cap at 100
        });
        return scores;
    }
    // Analyze energetic signatures from metadata
    analyzeEnergeticSignatures(participant) {
        const energyLevel = participant.currentState?.energyLevel || 5;
        const emotionalTone = participant.currentState?.emotionalTone || '';
        // Map energy signatures to elements
        const signatures = {
            fire: this.calculateFireSignature(energyLevel, emotionalTone),
            water: this.calculateWaterSignature(energyLevel, emotionalTone),
            earth: this.calculateEarthSignature(energyLevel, emotionalTone),
            air: this.calculateAirSignature(energyLevel, emotionalTone),
            aether: this.calculateAetherSignature(energyLevel, emotionalTone)
        };
        return signatures;
    }
    // Element-specific signature calculations
    calculateFireSignature(energyLevel, emotionalTone) {
        let score = energyLevel * 8; // Base from energy level
        // Fire emotional signatures
        const fireEmotions = ['excited', 'passionate', 'inspired', 'motivated', 'driven', 'enthusiastic', 'creative'];
        fireEmotions.forEach(emotion => {
            if (emotionalTone.toLowerCase().includes(emotion)) {
                score += 25;
            }
        });
        return Math.min(score, 100);
    }
    calculateWaterSignature(energyLevel, emotionalTone) {
        let score = 50; // Base water presence
        // Water emotional signatures
        const waterEmotions = ['emotional', 'sensitive', 'intuitive', 'flowing', 'deep', 'reflective', 'empathic'];
        waterEmotions.forEach(emotion => {
            if (emotionalTone.toLowerCase().includes(emotion)) {
                score += 20;
            }
        });
        // Lower energy can indicate water depth
        if (energyLevel <= 4)
            score += 15;
        return Math.min(score, 100);
    }
    calculateEarthSignature(energyLevel, emotionalTone) {
        let score = 40; // Base earth presence
        // Earth emotional signatures
        const earthEmotions = ['grounded', 'stable', 'practical', 'solid', 'reliable', 'focused', 'determined'];
        earthEmotions.forEach(emotion => {
            if (emotionalTone.toLowerCase().includes(emotion)) {
                score += 20;
            }
        });
        // Steady energy indicates earth
        if (energyLevel >= 4 && energyLevel <= 7)
            score += 15;
        return Math.min(score, 100);
    }
    calculateAirSignature(energyLevel, emotionalTone) {
        let score = 45; // Base air presence
        // Air emotional signatures
        const airEmotions = ['clear', 'analytical', 'curious', 'social', 'communicative', 'thoughtful', 'open'];
        airEmotions.forEach(emotion => {
            if (emotionalTone.toLowerCase().includes(emotion)) {
                score += 20;
            }
        });
        return Math.min(score, 100);
    }
    calculateAetherSignature(energyLevel, emotionalTone) {
        let score = 30; // Base aether presence
        // Aether emotional signatures
        const aetherEmotions = ['spiritual', 'connected', 'transcendent', 'unified', 'peaceful', 'cosmic', 'integrated'];
        aetherEmotions.forEach(emotion => {
            if (emotionalTone.toLowerCase().includes(emotion)) {
                score += 25;
            }
        });
        return Math.min(score, 100);
    }
    // Analyze intentions for elemental content
    analyzeIntentions(participant) {
        const intentions = participant.retreatIntentions;
        if (!intentions)
            return { fire: 20, water: 20, earth: 20, air: 20, aether: 20 };
        // Intention mapping to elements
        const intentionAnalysis = {
            fire: this.analyzeFireIntentions(intentions),
            water: this.analyzeWaterIntentions(intentions),
            earth: this.analyzeEarthIntentions(intentions),
            air: this.analyzeAirIntentions(intentions),
            aether: this.analyzeAetherIntentions(intentions)
        };
        return intentionAnalysis;
    }
    analyzeFireIntentions(intentions) {
        const fireIntentions = [
            'create', 'vision', 'breakthrough', 'transform', 'inspire', 'leadership', 'innovation',
            'power', 'courage', 'passion', 'purpose', 'mission', 'calling'
        ];
        return this.scoreIntentionsForElement(intentions, fireIntentions);
    }
    analyzeWaterIntentions(intentions) {
        const waterIntentions = [
            'heal', 'release', 'forgive', 'flow', 'intuition', 'emotion', 'relationship',
            'trust', 'surrender', 'cleanse', 'sensitivity', 'empathy'
        ];
        return this.scoreIntentionsForElement(intentions, waterIntentions);
    }
    analyzeEarthIntentions(intentions) {
        const earthIntentions = [
            'manifest', 'build', 'ground', 'structure', 'physical', 'health', 'material',
            'practical', 'foundation', 'stability', 'security', 'embodiment'
        ];
        return this.scoreIntentionsForElement(intentions, earthIntentions);
    }
    analyzeAirIntentions(intentions) {
        const airIntentions = [
            'understand', 'communicate', 'learn', 'teach', 'clarity', 'perspective',
            'freedom', 'expansion', 'knowledge', 'wisdom', 'expression'
        ];
        return this.scoreIntentionsForElement(intentions, airIntentions);
    }
    analyzeAetherIntentions(intentions) {
        const aetherIntentions = [
            'spiritual', 'unity', 'connection', 'integration', 'transcendence', 'consciousness',
            'sacred', 'divine', 'cosmic', 'oneness', 'enlightenment', 'awakening'
        ];
        return this.scoreIntentionsForElement(intentions, aetherIntentions);
    }
    scoreIntentionsForElement(intentions, elementWords) {
        const allIntentions = [
            intentions.primaryIntention || '',
            ...(intentions.secondaryIntentions || []),
            ...(intentions.desiredOutcomes || [])
        ].join(' ').toLowerCase();
        let score = 0;
        elementWords.forEach(word => {
            if (allIntentions.includes(word)) {
                score += 15;
            }
        });
        return Math.min(score + 20, 100); // Base score + matches
    }
    // Analyze lifecycle context
    analyzeLifecycleContext(participant) {
        // Age-based elemental tendencies (if available)
        // Registration timing elemental signatures
        // Communication style analysis
        const registrationTime = new Date(participant.createdAt);
        const timeSignature = this.getTimeBasedElementalSignature(registrationTime);
        return timeSignature;
    }
    getTimeBasedElementalSignature(date) {
        const hour = date.getHours();
        const month = date.getMonth();
        // Time of day elemental signatures
        let timeBonus = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
        if (hour >= 6 && hour < 12)
            timeBonus.fire += 10; // Morning fire
        if (hour >= 12 && hour < 18)
            timeBonus.earth += 10; // Afternoon earth
        if (hour >= 18 && hour < 22)
            timeBonus.water += 10; // Evening water
        if (hour >= 22 || hour < 6)
            timeBonus.air += 10; // Night air
        // Seasonal elemental signatures
        if (month >= 2 && month <= 4)
            timeBonus.fire += 5; // Spring
        if (month >= 5 && month <= 7)
            timeBonus.air += 5; // Summer
        if (month >= 8 && month <= 10)
            timeBonus.earth += 5; // Autumn
        if (month >= 11 || month <= 1)
            timeBonus.water += 5; // Winter
        return {
            fire: 20 + timeBonus.fire,
            water: 20 + timeBonus.water,
            earth: 20 + timeBonus.earth,
            air: 20 + timeBonus.air,
            aether: 20 + timeBonus.aether
        };
    }
    // Weighted synthesis of all assessments
    synthesizeAssessments(assessments) {
        const elements = ['fire', 'water', 'earth', 'air', 'aether'];
        const synthesized = {};
        elements.forEach(element => {
            let weightedSum = 0;
            let totalWeight = 0;
            assessments.forEach(assessment => {
                if (assessment.scores[element] !== undefined) {
                    weightedSum += assessment.scores[element] * assessment.weight;
                    totalWeight += assessment.weight;
                }
            });
            synthesized[element] = totalWeight > 0 ? weightedSum / totalWeight : 20;
        });
        return synthesized;
    }
    // Apply sacred geometry normalization
    applySacredGeometryNormalization(scores) {
        // Golden ratio and sacred proportion adjustments
        const goldenRatio = 1.618;
        const total = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
        // Normalize to ensure sacred balance
        const normalized = {};
        Object.entries(scores).forEach(([element, score]) => {
            normalized[element] = Math.round((score || 0) * (100 / total) * 5);
        });
        // Apply pentagonal harmony (5 elements in balance)
        const pentagonalBalance = 100 / 5; // Perfect balance = 20 each
        Object.keys(normalized).forEach(element => {
            const deviation = Math.abs(normalized[element] - pentagonalBalance);
            if (deviation > 30) {
                // Moderate extreme scores
                normalized[element] = normalized[element] > pentagonalBalance
                    ? pentagonalBalance + (deviation * 0.7)
                    : pentagonalBalance - (deviation * 0.7);
            }
        });
        return normalized;
    }
    // Calculate crystallization level
    calculateCrystallization(scores) {
        const values = Object.values(scores);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        // Lower variance = higher crystallization
        const crystallization = Math.max(0, 100 - (variance * 2));
        return Math.round(crystallization);
    }
    findDominantElement(scores) {
        let maxElement = 'aether';
        let maxScore = 0;
        Object.entries(scores).forEach(([element, score]) => {
            if ((score || 0) > maxScore) {
                maxScore = score || 0;
                maxElement = element;
            }
        });
        return maxElement;
    }
    findSecondaryElement(scores) {
        const sortedElements = Object.entries(scores)
            .sort(([, a], [, b]) => (b || 0) - (a || 0));
        return sortedElements[1]?.[0] || 'air';
    }
    identifyBalancingNeeds(scores) {
        const needs = [];
        Object.entries(scores).forEach(([element, score]) => {
            if ((score || 0) < 15) {
                needs.push(element);
            }
        });
        return needs;
    }
    determineEvolutionPath(scores, participant) {
        const dominant = this.findDominantElement(scores);
        const needsBalancing = this.identifyBalancingNeeds(scores);
        const evolutionPaths = {
            fire: 'Creative Manifestation → Sacred Leadership',
            water: 'Emotional Mastery → Intuitive Wisdom',
            earth: 'Grounded Presence → Sacred Embodiment',
            air: 'Mental Clarity → Conscious Communication',
            aether: 'Spiritual Integration → Unity Consciousness'
        };
        return evolutionPaths[dominant] || 'Balanced Integration → Wholeness';
    }
    // Generate personality vector from assessment
    generatePersonalityVector(assessment, participant) {
        const dominant = assessment.dominantElement;
        const secondary = assessment.secondaryElement;
        return {
            communicationStyle: this.determineCommunicationStyle(dominant, secondary),
            guidanceStyle: this.determineGuidanceStyle(dominant, assessment),
            depthPreference: this.determineDepthPreference(assessment),
            tempo: this.determineTempo(dominant, participant),
            shadowApproach: this.determineShadowApproach(dominant, assessment),
            learningStyle: this.determineLearningStyle(dominant, secondary)
        };
    }
    determineCommunicationStyle(dominant, secondary) {
        const styles = {
            fire: 'energetic',
            water: 'metaphorical',
            earth: 'direct',
            air: 'questioning',
            aether: 'storytelling'
        };
        return styles[dominant] || 'direct';
    }
    determineGuidanceStyle(dominant, assessment) {
        if (assessment.crystallizationLevel > 70)
            return 'visionary';
        if (dominant === 'fire')
            return 'challenging';
        if (dominant === 'water')
            return 'nurturing';
        if (dominant === 'earth')
            return 'supportive';
        if (dominant === 'air')
            return 'investigative';
        return 'supportive';
    }
    determineDepthPreference(assessment) {
        if (assessment.aether > 60)
            return 'mystical';
        if (assessment.water > 50)
            return 'deep';
        if (assessment.crystallizationLevel > 60)
            return 'deep';
        return 'moderate';
    }
    determineTempo(dominant, participant) {
        const energyLevel = participant.currentState?.energyLevel || 5;
        if (dominant === 'fire' && energyLevel > 7)
            return 'intense_bursts';
        if (dominant === 'water')
            return 'slow_contemplative';
        if (dominant === 'air' && energyLevel > 6)
            return 'dynamic_flow';
        return 'steady_rhythm';
    }
    determineShadowApproach(dominant, assessment) {
        if (assessment.water > 60)
            return 'gentle_integration';
        if (dominant === 'fire')
            return 'direct_confrontation';
        if (dominant === 'air')
            return 'playful_exploration';
        return 'sacred_witnessing';
    }
    determineLearningStyle(dominant, secondary) {
        const styles = {
            fire: 'experiential',
            water: 'intuitive',
            earth: 'embodied',
            air: 'conceptual',
            aether: 'systematic'
        };
        return styles[dominant] || 'experiential';
    }
}
export const elementalAssessmentService = new ElementalAssessmentService();
