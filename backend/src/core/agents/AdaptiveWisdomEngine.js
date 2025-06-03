"use strict";
// ===============================================
// ADAPTIVE WISDOM ENGINE
// Dynamic routing between Jung and Buddha approaches
// ===============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveWisdomEngine = void 0;
const logger_js_1 = require("../../utils/logger.js");
// ===============================================
// ADAPTIVE WISDOM ENGINE CLASS
// ===============================================
class AdaptiveWisdomEngine {
    constructor() {
        this.grasping_indicators = [
            'need to',
            'have to',
            'must',
            'should',
            'can\'t let go',
            'attached to',
            'desperate',
            'clinging',
            'obsessing',
            'trying so hard',
            'force',
            'control',
            'make it happen'
        ];
        this.avoidance_indicators = [
            'don\'t want to',
            'avoiding',
            'can\'t deal',
            'too much',
            'not ready',
            'maybe later',
            'distract myself',
            'escape',
            'numb',
            'push away',
            'refuse to',
            'deny',
            'pretend it\'s not'
        ];
        this.identity_crisis_markers = [
            'who am i',
            'don\'t know myself',
            'lost my identity',
            'not sure who',
            'identity crisis',
            'don\'t recognize',
            'feel like stranger',
            'question everything',
            'core beliefs',
            'fundamental shift',
            'existential'
        ];
        this.shadow_emergence_signals = [
            'dark side',
            'hate this about',
            'ashamed of',
            'reject this part',
            'shadow',
            'hidden aspect',
            'secret part',
            'deny this',
            'worst part',
            'monster inside',
            'evil thoughts',
            'unacceptable'
        ];
        this.spiritual_bypass_patterns = [
            'everything happens for reason',
            'just think positive',
            'raise my vibration',
            'transcend this',
            'spiritual but not',
            'above all that',
            'evolved beyond',
            'higher consciousness',
            'good vibes only',
            'manifest away',
            'love and light'
        ];
    }
    // ===============================================
    // MAIN ROUTING METHOD
    // ===============================================
    determineApproach(context) {
        const { spiralPhase, currentElement, emotionalState, recentPatterns } = context;
        // Crisis handling takes priority
        if (emotionalState === 'crisis') {
            return this.handleCrisisRouting(context);
        }
        // Detect primary patterns
        const graspingLevel = this.detectGraspingLevel(recentPatterns);
        const avoidanceLevel = this.detectAvoidanceLevel(recentPatterns);
        const shadowEmergence = this.detectShadowEmergence(recentPatterns);
        const spiritualBypass = this.detectSpiritualBypass(recentPatterns);
        const identityCrisis = this.isIdentityCrisis(recentPatterns);
        // Log pattern detection for debugging
        logger_js_1.logger.info('AdaptiveWisdomEngine pattern detection:', {
            graspingLevel,
            avoidanceLevel,
            shadowEmergence,
            spiritualBypass,
            identityCrisis,
            emotionalState,
            spiralPhase
        });
        // Primary routing logic
        let routing;
        // Strong grasping/performing patterns -> Buddha approach
        if (graspingLevel > 0.7 && avoidanceLevel < 0.3) {
            routing = {
                approach: 'buddha',
                confidence: 0.8,
                reasoning: 'Strong grasping patterns detected - offering spaciousness and non-attachment',
                supportingFactors: [
                    `Grasping level: ${graspingLevel.toFixed(2)}`,
                    'Low avoidance suggests readiness for liberation work',
                    'Buddha approach helps release attachment to outcomes'
                ],
                adjustments: {
                    pace: graspingLevel > 0.9 ? 'gentle' : 'normal',
                    depth: 'moderate',
                    tone: 'nurturing'
                }
            };
        }
        // Strong avoidance/denial patterns -> Jung approach
        else if (avoidanceLevel > 0.7 && graspingLevel < 0.3) {
            routing = {
                approach: 'jung',
                confidence: 0.8,
                reasoning: 'Strong avoidance patterns detected - offering integration and shadow work',
                supportingFactors: [
                    `Avoidance level: ${avoidanceLevel.toFixed(2)}`,
                    'Low grasping suggests readiness for depth work',
                    'Jung approach helps integrate rejected aspects'
                ],
                adjustments: {
                    pace: context.vulnerabilityLevel < 0.3 ? 'gentle' : 'normal',
                    depth: context.shadowReadiness > 0.6 ? 'deep' : 'moderate',
                    tone: 'nurturing'
                }
            };
        }
        // Both patterns present or spiritual bypass detected -> Hybrid
        else if ((graspingLevel > 0.5 && avoidanceLevel > 0.5) || spiritualBypass || identityCrisis) {
            routing = {
                approach: 'hybrid',
                confidence: 0.7,
                reasoning: this.getHybridReasoning(graspingLevel, avoidanceLevel, spiritualBypass, identityCrisis),
                supportingFactors: this.getHybridSupportingFactors(graspingLevel, avoidanceLevel, spiritualBypass, identityCrisis),
                adjustments: {
                    pace: 'normal',
                    depth: 'moderate',
                    tone: 'neutral'
                }
            };
        }
        // Shadow emergence detected -> Jung with special handling
        else if (shadowEmergence) {
            routing = {
                approach: 'jung',
                confidence: 0.9,
                reasoning: 'Shadow material emerging - integration work needed',
                supportingFactors: [
                    'Shadow content detected in recent patterns',
                    'Integration work will prevent spiritual bypassing',
                    'Jung approach provides safe container for shadow work'
                ],
                adjustments: {
                    pace: 'gentle',
                    depth: 'deep',
                    tone: 'nurturing'
                }
            };
        }
        // Balanced state - use context and element
        else {
            routing = this.determineBalancedApproach(context);
        }
        // Apply contextual adjustments
        routing = this.applyContextualAdjustments(routing, context);
        logger_js_1.logger.info('AdaptiveWisdomEngine routing decision:', routing);
        return routing;
    }
    // ===============================================
    // PATTERN DETECTION METHODS
    // ===============================================
    detectGraspingLevel(patterns) {
        if (!patterns || patterns.length === 0)
            return 0;
        const graspingPatterns = patterns.filter(p => p.type === 'grasping' || p.type === 'attachment' ||
            this.containsGraspingLanguage(p.content));
        if (graspingPatterns.length === 0)
            return 0;
        // Calculate weighted average based on intensity and recency
        const totalWeight = graspingPatterns.reduce((sum, pattern) => {
            const recencyFactor = this.calculateRecencyFactor(pattern.timestamp);
            return sum + (pattern.intensity * recencyFactor);
        }, 0);
        return Math.min(totalWeight / patterns.length, 1);
    }
    detectAvoidanceLevel(patterns) {
        if (!patterns || patterns.length === 0)
            return 0;
        const avoidancePatterns = patterns.filter(p => p.type === 'avoidance' || p.type === 'spiritual_bypass' ||
            this.containsAvoidanceLanguage(p.content));
        if (avoidancePatterns.length === 0)
            return 0;
        const totalWeight = avoidancePatterns.reduce((sum, pattern) => {
            const recencyFactor = this.calculateRecencyFactor(pattern.timestamp);
            return sum + (pattern.intensity * recencyFactor);
        }, 0);
        return Math.min(totalWeight / patterns.length, 1);
    }
    detectShadowEmergence(patterns) {
        if (!patterns || patterns.length === 0)
            return false;
        return patterns.some(pattern => pattern.type === 'shadow_emergence' ||
            this.containsShadowLanguage(pattern.content));
    }
    detectSpiritualBypass(patterns) {
        if (!patterns || patterns.length === 0)
            return false;
        return patterns.some(pattern => pattern.type === 'spiritual_bypass' ||
            this.containsBypassLanguage(pattern.content));
    }
    isIdentityCrisis(patterns) {
        if (!patterns || patterns.length === 0)
            return false;
        return patterns.some(pattern => pattern.type === 'identity_crisis' ||
            this.containsIdentityCrisisLanguage(pattern.content));
    }
    // ===============================================
    // LANGUAGE DETECTION HELPERS
    // ===============================================
    containsGraspingLanguage(content) {
        const lowerContent = content.toLowerCase();
        return this.grasping_indicators.some(indicator => lowerContent.includes(indicator));
    }
    containsAvoidanceLanguage(content) {
        const lowerContent = content.toLowerCase();
        return this.avoidance_indicators.some(indicator => lowerContent.includes(indicator));
    }
    containsShadowLanguage(content) {
        const lowerContent = content.toLowerCase();
        return this.shadow_emergence_signals.some(signal => lowerContent.includes(signal));
    }
    containsBypassLanguage(content) {
        const lowerContent = content.toLowerCase();
        return this.spiritual_bypass_patterns.some(pattern => lowerContent.includes(pattern));
    }
    containsIdentityCrisisLanguage(content) {
        const lowerContent = content.toLowerCase();
        return this.identity_crisis_markers.some(marker => lowerContent.includes(marker));
    }
    // ===============================================
    // SPECIALIZED ROUTING METHODS
    // ===============================================
    handleCrisisRouting(context) {
        const identityInCrisis = this.isIdentityCrisis(context.recentPatterns);
        const shadowCrisis = this.detectShadowEmergence(context.recentPatterns);
        if (identityInCrisis) {
            return {
                approach: 'buddha',
                confidence: 0.9,
                reasoning: 'Identity crisis detected - offering spaciousness beyond personal identity',
                supportingFactors: [
                    'Identity questions suggest attachment to self-concept',
                    'Buddha approach provides refuge in unchanging awareness',
                    'Crisis often indicates readiness for liberation work'
                ],
                adjustments: {
                    pace: 'gentle',
                    depth: 'moderate',
                    tone: 'nurturing'
                }
            };
        }
        else if (shadowCrisis) {
            return {
                approach: 'jung',
                confidence: 0.8,
                reasoning: 'Shadow-related crisis - integration work needed with gentle pacing',
                supportingFactors: [
                    'Shadow material triggering crisis state',
                    'Jung approach provides container for integration',
                    'Crisis as initiation into wholeness'
                ],
                adjustments: {
                    pace: 'gentle',
                    depth: 'moderate',
                    tone: 'nurturing'
                }
            };
        }
        else {
            return {
                approach: 'hybrid',
                confidence: 0.7,
                reasoning: 'Crisis state requires both grounding and spaciousness',
                supportingFactors: [
                    'Crisis benefits from both integration and liberation approaches',
                    'Hybrid provides flexibility for emerging needs',
                    'Both personal work and transcendent perspective needed'
                ],
                adjustments: {
                    pace: 'gentle',
                    depth: 'surface',
                    tone: 'nurturing'
                }
            };
        }
    }
    determineBalancedApproach(context) {
        const { currentElement, spiralPhase, attachmentLevel, shadowReadiness } = context;
        // Element-based tendencies
        let elementalBias = 'hybrid';
        switch (currentElement) {
            case 'fire':
            case 'earth':
                elementalBias = 'jung'; // More grounding/integration oriented
                break;
            case 'air':
            case 'aether':
                elementalBias = 'buddha'; // More spacious/liberation oriented
                break;
            case 'water':
                elementalBias = 'hybrid'; // Fluid between both
                break;
        }
        // Spiral phase considerations
        let phaseBias = elementalBias;
        if (spiralPhase === 'integration' || spiralPhase === 'embodiment') {
            phaseBias = 'jung';
        }
        else if (spiralPhase === 'transcendence' || spiralPhase === 'liberation') {
            phaseBias = 'buddha';
        }
        // Final decision based on readiness levels
        if (shadowReadiness > 0.7 && attachmentLevel < 0.4) {
            return {
                approach: 'jung',
                confidence: 0.6,
                reasoning: 'High shadow readiness with low attachment suggests depth work capacity',
                supportingFactors: [
                    `Shadow readiness: ${shadowReadiness}`,
                    `Attachment level: ${attachmentLevel}`,
                    `Current element: ${currentElement}`,
                    `Spiral phase: ${spiralPhase}`
                ],
                adjustments: {
                    pace: 'normal',
                    depth: 'moderate',
                    tone: 'neutral'
                }
            };
        }
        else if (attachmentLevel > 0.7 && shadowReadiness < 0.4) {
            return {
                approach: 'buddha',
                confidence: 0.6,
                reasoning: 'High attachment with lower shadow readiness suggests liberation work',
                supportingFactors: [
                    `Attachment level: ${attachmentLevel}`,
                    `Shadow readiness: ${shadowReadiness}`,
                    `Current element: ${currentElement}`,
                    `Spiral phase: ${spiralPhase}`
                ],
                adjustments: {
                    pace: 'normal',
                    depth: 'moderate',
                    tone: 'neutral'
                }
            };
        }
        else {
            return {
                approach: 'hybrid',
                confidence: 0.5,
                reasoning: 'Balanced state suggests integrated approach',
                supportingFactors: [
                    'Balanced attachment and shadow readiness levels',
                    `Elemental bias toward: ${elementalBias}`,
                    `Phase bias toward: ${phaseBias}`,
                    'Hybrid allows dynamic adaptation'
                ],
                adjustments: {
                    pace: 'normal',
                    depth: 'moderate',
                    tone: 'neutral'
                }
            };
        }
    }
    // ===============================================
    // HELPER METHODS
    // ===============================================
    getHybridReasoning(grasping, avoidance, bypass, identity) {
        if (bypass)
            return 'Spiritual bypassing detected - both integration and liberation needed';
        if (identity)
            return 'Identity crisis requires both grounding in self and transcendence of self';
        if (grasping > 0.5 && avoidance > 0.5)
            return 'Both grasping and avoidance present - balanced approach needed';
        return 'Complex pattern suggests integrated Jung-Buddha approach';
    }
    getHybridSupportingFactors(grasping, avoidance, bypass, identity) {
        const factors = [];
        if (grasping > 0.5)
            factors.push(`Grasping level: ${grasping.toFixed(2)}`);
        if (avoidance > 0.5)
            factors.push(`Avoidance level: ${avoidance.toFixed(2)}`);
        if (bypass)
            factors.push('Spiritual bypassing patterns detected');
        if (identity)
            factors.push('Identity crisis markers present');
        factors.push('Hybrid approach provides both integration and liberation tools');
        return factors;
    }
    applyContextualAdjustments(routing, context) {
        // Adjust based on oracle mode compatibility
        if (context.currentOracleMode) {
            switch (context.currentOracleMode) {
                case 'alchemist':
                    if (routing.approach === 'buddha') {
                        routing.contraindications = ['Current oracle mode favors integration work'];
                        routing.confidence *= 0.8;
                    }
                    break;
                case 'buddha':
                    if (routing.approach === 'jung') {
                        routing.contraindications = ['Current oracle mode favors liberation work'];
                        routing.confidence *= 0.8;
                    }
                    break;
                case 'guardian':
                    if (routing.adjustments) {
                        routing.adjustments.pace = 'gentle';
                        routing.adjustments.tone = 'nurturing';
                    }
                    break;
            }
        }
        // Adjust based on vulnerability level
        if (context.vulnerabilityLevel < 0.3 && routing.adjustments) {
            routing.adjustments.pace = 'gentle';
            routing.adjustments.depth = 'surface';
        }
        return routing;
    }
    calculateRecencyFactor(timestamp) {
        const now = new Date();
        const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        // More recent patterns have higher weight
        if (daysDiff < 1)
            return 1.0;
        if (daysDiff < 7)
            return 0.8;
        if (daysDiff < 30)
            return 0.5;
        return 0.2;
    }
    // ===============================================
    // PUBLIC ANALYSIS METHODS
    // ===============================================
    analyzePatterns(patterns) {
        const graspingLevel = this.detectGraspingLevel(patterns);
        const avoidanceLevel = this.detectAvoidanceLevel(patterns);
        const shadowEmergence = this.detectShadowEmergence(patterns);
        const spiritualBypass = this.detectSpiritualBypass(patterns);
        const identityCrisis = this.isIdentityCrisis(patterns);
        let dominantPattern = 'balanced';
        if (graspingLevel > 0.6)
            dominantPattern = 'grasping';
        else if (avoidanceLevel > 0.6)
            dominantPattern = 'avoidance';
        else if (shadowEmergence)
            dominantPattern = 'shadow_emergence';
        else if (spiritualBypass)
            dominantPattern = 'spiritual_bypass';
        else if (identityCrisis)
            dominantPattern = 'identity_crisis';
        const recommendations = this.generateRecommendations(graspingLevel, avoidanceLevel, shadowEmergence, spiritualBypass, identityCrisis);
        return {
            graspingLevel,
            avoidanceLevel,
            shadowEmergence,
            spiritualBypass,
            identityCrisis,
            dominantPattern,
            recommendations
        };
    }
    generateRecommendations(grasping, avoidance, shadow, bypass, identity) {
        const recommendations = [];
        if (grasping > 0.7) {
            recommendations.push('Consider Buddha-oriented practices for releasing attachment');
            recommendations.push('Explore mindfulness and present-moment awareness');
        }
        if (avoidance > 0.7) {
            recommendations.push('Jung-oriented shadow work may be beneficial');
            recommendations.push('Gentle integration practices for rejected aspects');
        }
        if (shadow) {
            recommendations.push('Shadow integration work is indicated');
            recommendations.push('Create safe containers for exploring difficult material');
        }
        if (bypass) {
            recommendations.push('Ground spiritual insights in human experience');
            recommendations.push('Balance transcendent work with integration practices');
        }
        if (identity) {
            recommendations.push('Explore both personal identity and what lies beyond identity');
            recommendations.push('Hybrid approach balancing being and becoming');
        }
        if (recommendations.length === 0) {
            recommendations.push('Continue with balanced approach');
            recommendations.push('Monitor for emerging patterns');
        }
        return recommendations;
    }
}
exports.AdaptiveWisdomEngine = AdaptiveWisdomEngine;
exports.default = AdaptiveWisdomEngine;
