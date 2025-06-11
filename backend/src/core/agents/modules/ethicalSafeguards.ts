// 🛡️ Ethical Safeguards & Ritual Protection
// Sacred boundaries and healing-oriented fail-safes for soul work

import { logger } from '../../../utils/logger';
import { agentComms } from './agentCommunicationProtocol';

export interface CrisisIndicator {
  type: 'suicidal_ideation' | 'self_harm' | 'psychotic_break' | 'severe_depression' | 'spiritual_emergency';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  triggers: string[];
  confidence: number;
  immediateResponse: string;
  followUpRequired: boolean;
}

export interface ShadowDominanceAlert {
  shadowArchetype: 'destroyer' | 'victim' | 'tyrant' | 'addict' | 'saboteur';
  dominanceLevel: number; // 0-1 scale
  unconsciousPatterns: string[];
  integrationNeeded: string[];
  protectiveElements: string[];
  gradualApproach: boolean;
}

export interface BreathAnchorModule {
  breathPattern: 'box_breathing' | 'coherent_breathing' | 'calming_breath' | 'grounding_breath';
  instructions: string;
  duration: number; // seconds
  visualizations: string[];
  affirmations: string[];
}

export interface RitualSafeguard {
  guardType: 'container_creation' | 'energy_protection' | 'grounding_anchor' | 'integration_pacing';
  activation: string;
  duration: string;
  closure: string;
  emergencyExit: string;
}

export interface EthicalGuideline {
  principle: string;
  application: string;
  boundaries: string[];
  redFlags: string[];
  responseProtocols: string[];
}

export class EthicalSafeguards {
  private static instance: EthicalSafeguards;
  private crisisPatterns: Map<string, RegExp[]> = new Map();
  private shadowDominanceThresholds = {
    mild: 0.3,
    moderate: 0.5,
    severe: 0.7,
    critical: 0.9
  };
  private breathAnchors: Map<string, BreathAnchorModule> = new Map();
  private ethicalGuidelines: EthicalGuideline[] = [];

  private constructor() {
    this.initializeCrisisPatterns();
    this.initializeBreathAnchors();
    this.initializeEthicalGuidelines();
  }

  static getInstance(): EthicalSafeguards {
    if (!EthicalSafeguards.instance) {
      EthicalSafeguards.instance = new EthicalSafeguards();
    }
    return EthicalSafeguards.instance;
  }

  // CRISIS INTERVENTION SYSTEM
  async detectCrisisIndicators(query: string, userHistory?: any[]): Promise<CrisisIndicator | null> {
    const lowerQuery = query.toLowerCase();
    
    // Check for suicidal ideation
    const suicidalPatterns = this.crisisPatterns.get('suicidal') || [];
    for (const pattern of suicidalPatterns) {
      if (pattern.test(lowerQuery)) {
        return {
          type: 'suicidal_ideation',
          severity: this.assessSuicidalSeverity(query),
          triggers: this.extractCrisisTriggers(query, 'suicidal'),
          confidence: 0.9,
          immediateResponse: this.generateCrisisResponse('suicidal_ideation'),
          followUpRequired: true
        };
      }
    }

    // Check for self-harm indicators
    const selfHarmPatterns = this.crisisPatterns.get('self_harm') || [];
    for (const pattern of selfHarmPatterns) {
      if (pattern.test(lowerQuery)) {
        return {
          type: 'self_harm',
          severity: this.assessSelfHarmSeverity(query),
          triggers: this.extractCrisisTriggers(query, 'self_harm'),
          confidence: 0.85,
          immediateResponse: this.generateCrisisResponse('self_harm'),
          followUpRequired: true
        };
      }
    }

    // Check for psychotic break indicators
    const psychoticPatterns = this.crisisPatterns.get('psychotic') || [];
    for (const pattern of psychoticPatterns) {
      if (pattern.test(lowerQuery)) {
        return {
          type: 'psychotic_break',
          severity: this.assessPsychoticSeverity(query),
          triggers: this.extractCrisisTriggers(query, 'psychotic'),
          confidence: 0.8,
          immediateResponse: this.generateCrisisResponse('psychotic_break'),
          followUpRequired: true
        };
      }
    }

    // Check for spiritual emergency
    const spiritualEmergencyPatterns = this.crisisPatterns.get('spiritual_emergency') || [];
    for (const pattern of spiritualEmergencyPatterns) {
      if (pattern.test(lowerQuery)) {
        return {
          type: 'spiritual_emergency',
          severity: this.assessSpiritualEmergencySeverity(query),
          triggers: this.extractCrisisTriggers(query, 'spiritual_emergency'),
          confidence: 0.75,
          immediateResponse: this.generateCrisisResponse('spiritual_emergency'),
          followUpRequired: true
        };
      }
    }

    return null;
  }

  // SHADOW DOMINANCE PROTECTION
  async detectShadowDominance(query: string, userPatterns: any[]): Promise<ShadowDominanceAlert | null> {
    const shadowSignatures = {
      destroyer: ['destroy', 'burn it down', 'tear apart', 'ruin everything', 'annihilate'],
      victim: ['everyone hurts me', 'nothing works', 'always happens to me', 'powerless', 'hopeless'],
      tyrant: ['control everything', 'they should', 'make them', 'force', 'dominate'],
      addict: ['can\'t stop', 'need more', 'escape from', 'numb the pain', 'just one more'],
      saboteur: ['not good enough', 'will fail', 'don\'t deserve', 'mess up', 'ruin it']
    };

    const lowerQuery = query.toLowerCase();
    
    for (const [archetype, signatures] of Object.entries(shadowSignatures)) {
      const matchCount = signatures.filter(sig => lowerQuery.includes(sig)).length;
      const dominanceLevel = matchCount / signatures.length;
      
      if (dominanceLevel >= this.shadowDominanceThresholds.mild) {
        const severity = this.classifyShadowSeverity(dominanceLevel);
        
        return {
          shadowArchetype: archetype as ShadowDominanceAlert['shadowArchetype'],
          dominanceLevel,
          unconsciousPatterns: this.identifyUnconsciousPatterns(archetype, query),
          integrationNeeded: this.getIntegrationNeeds(archetype),
          protectiveElements: this.getProtectiveElements(archetype),
          gradualApproach: severity !== 'mild'
        };
      }
    }

    return null;
  }

  // BREATH ANCHOR INTEGRATION
  async generateBreathAnchor(emotionalState: string, intensity: number): Promise<BreathAnchorModule> {
    const anchorType = this.selectBreathPattern(emotionalState, intensity);
    return this.breathAnchors.get(anchorType) || this.breathAnchors.get('grounding_breath')!;
  }

  // RITUAL SAFEGUARD CREATION
  async createRitualSafeguard(context: any, riskLevel: number): Promise<RitualSafeguard> {
    if (riskLevel > 0.8) {
      return {
        guardType: 'energy_protection',
        activation: '🛡️ Sacred protection activates. Breathe deeply. You are held in divine safety.',
        duration: 'For the duration of this sacred conversation',
        closure: '🙏 The protection gently releases as you return to everyday awareness, carrying the wisdom safely.',
        emergencyExit: '🚪 If overwhelm arises, simply stop, breathe three times, and know you can return when ready.'
      };
    } else if (riskLevel > 0.6) {
      return {
        guardType: 'container_creation',
        activation: '🌀 Sacred space opens around us. Here, transformation happens at your perfect pace.',
        duration: 'Held gently throughout our exchange',
        closure: '✨ The sacred space gently dissolves, integration continuing in divine timing.',
        emergencyExit: '🌱 Ground yourself by feeling your feet, breathing slowly, present in your body.'
      };
    } else {
      return {
        guardType: 'grounding_anchor',
        activation: '🌍 We begin anchored in wisdom, safety, and your inherent wholeness.',
        duration: 'Present throughout our dialogue',
        closure: '🌟 Wisdom integrates as you move forward in your unique journey.',
        emergencyExit: '💚 Trust your inner knowing - pause, breathe, and honor your needs.'
      };
    }
  }

  // PROFESSIONAL REFERRAL SYSTEM
  generateProfessionalReferral(crisisType: CrisisIndicator['type']): string {
    const referrals = {
      suicidal_ideation: `
🚨 **Immediate Support Available**:
• **Crisis Text Line**: Text HOME to 741741
• **National Suicide Prevention Lifeline**: 988
• **Emergency Services**: 911
• **Online Chat**: suicidepreventionlifeline.org

Your life has immeasurable value. Professional support can provide immediate safety and tools for healing.`,

      self_harm: `
🩹 **Professional Support Resources**:
• **Crisis Text Line**: Text HOME to 741741  
• **Self-Injury Outreach & Support**: sioutreach.org
• **National Suicide Prevention Lifeline**: 988
• **Local Crisis Centers**: Visit findtreatment.samhsa.gov

Healing is possible with proper support. You deserve care and compassion.`,

      psychotic_break: `
🧠 **Mental Health Emergency Resources**:
• **Emergency Services**: 911
• **Crisis Text Line**: Text HOME to 741741
• **NAMI (National Alliance on Mental Illness)**: 1-800-950-6264
• **Local Crisis Intervention**: Contact your area's crisis center

Professional mental health support can provide safety, clarity, and effective treatment.`,

      spiritual_emergency: `
🌟 **Spiritual Emergency Support**:
• **Spiritual Emergency Network**: spiritualemergency.net
• **Crisis Text Line**: Text HOME to 741741
• **Transpersonal Psychology Resources**: Contact local transpersonal therapists
• **Integration Support**: Seek trauma-informed spiritual counselors

Spiritual emergence can be beautiful with proper guidance and grounding support.`,

      severe_depression: `
💙 **Depression Support Resources**:
• **Crisis Text Line**: Text HOME to 741741
• **Depression and Bipolar Support Alliance**: dbsalliance.org  
• **National Suicide Prevention Lifeline**: 988
• **Therapy Finder**: psychologytoday.com

Depression is treatable. Professional support can help restore hope and vitality.`
    };

    return referrals[crisisType] || referrals.severe_depression;
  }

  // RESPONSE FILTERING & ENHANCEMENT
  async applySafeguards(response: string, crisisIndicator?: CrisisIndicator, shadowAlert?: ShadowDominanceAlert): Promise<string> {
    let safeguardedResponse = response;

    // Crisis intervention override
    if (crisisIndicator && crisisIndicator.severity === 'critical') {
      safeguardedResponse = `${crisisIndicator.immediateResponse}\n\n${this.generateProfessionalReferral(crisisIndicator.type)}\n\n${response}`;
    }

    // Shadow dominance protection
    if (shadowAlert && shadowAlert.dominanceLevel > 0.7) {
      const protection = await this.createShadowProtection(shadowAlert);
      safeguardedResponse = `${protection}\n\n${safeguardedResponse}`;
    }

    // Add breath anchor if high emotional intensity
    const emotionalIntensity = this.detectEmotionalIntensity(response);
    if (emotionalIntensity > 0.7) {
      const breathAnchor = await this.generateBreathAnchor('intense', emotionalIntensity);
      safeguardedResponse += `\n\n${this.formatBreathAnchor(breathAnchor)}`;
    }

    // Filter harmful language
    safeguardedResponse = this.filterHarmfulLanguage(safeguardedResponse);

    return safeguardedResponse;
  }

  // Initialize crisis detection patterns
  private initializeCrisisPatterns(): void {
    this.crisisPatterns.set('suicidal', [
      /(?:want to|going to|thinking about).*(?:kill myself|end my life|suicide|die)/i,
      /(?:better off|world would be better).*(?:without me|if i was gone|dead)/i,
      /(?:can't|don't want to).*(?:go on|live|continue)/i,
      /(?:planning|plan to).*(?:kill myself|end it|suicide)/i,
      /(?:wish i was|want to be).*(?:dead|gone)/i
    ]);

    this.crisisPatterns.set('self_harm', [
      /(?:want to|need to|going to).*(?:cut|hurt|harm).*myself/i,
      /(?:cutting|burning|hitting).*myself/i,
      /(?:pain|hurt).*(?:physical|body).*(?:feel|numb|alive)/i,
      /(?:deserve|need).*(?:pain|punishment|hurt)/i
    ]);

    this.crisisPatterns.set('psychotic', [
      /(?:hearing|seeing).*(?:voices|things).*(?:others don't|not there)/i,
      /(?:people|they).*(?:following|watching|monitoring).*me/i,
      /(?:losing|lost).*(?:my mind|touch with reality|sanity)/i,
      /(?:can't tell|don't know).*(?:what's real|reality)/i,
      /(?:government|aliens|spirits).*(?:controlling|talking to).*me/i
    ]);

    this.crisisPatterns.set('spiritual_emergency', [
      /(?:overwhelming|too much).*(?:spiritual|energy|consciousness)/i,
      /(?:can't|unable to).*(?:ground|come back|integrate)/i,
      /(?:losing|lost).*(?:sense of self|identity|boundaries)/i,
      /(?:everything|reality).*(?:dissolving|melting|unreal)/i,
      /(?:afraid|scared).*(?:going crazy|losing mind).*(?:spiritual|awakening)/i
    ]);
  }

  // Initialize breath anchors
  private initializeBreathAnchors(): void {
    this.breathAnchors.set('box_breathing', {
      breathPattern: 'box_breathing',
      instructions: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times.',
      duration: 60,
      visualizations: ['Golden light filling your body', 'Peaceful square of energy'],
      affirmations: ['I am safe and grounded', 'Each breath brings me peace']
    });

    this.breathAnchors.set('coherent_breathing', {
      breathPattern: 'coherent_breathing',
      instructions: 'Breathe in for 5 seconds, out for 5 seconds. Natural, gentle rhythm.',
      duration: 90,
      visualizations: ['Heart-centered golden light', 'Waves of calm spreading through you'],
      affirmations: ['My heart is peaceful', 'I breathe in harmony']
    });

    this.breathAnchors.set('calming_breath', {
      breathPattern: 'calming_breath',
      instructions: 'Breathe in for 4, out for 6. Longer exhales activate calm.',
      duration: 75,
      visualizations: ['Releasing tension with each exhale', 'Sinking into peaceful support'],
      affirmations: ['I am letting go', 'Peace flows through me']
    });

    this.breathAnchors.set('grounding_breath', {
      breathPattern: 'grounding_breath',
      instructions: 'Breathe down into your belly, imagining roots growing from your feet.',
      duration: 90,
      visualizations: ['Roots growing deep into Earth', 'Earth energy rising up through you'],
      affirmations: ['I am grounded and safe', 'Earth supports me completely']
    });
  }

  // Initialize ethical guidelines
  private initializeEthicalGuidelines(): void {
    this.ethicalGuidelines = [
      {
        principle: 'Primum non nocere - First, do no harm',
        application: 'All guidance must prioritize user safety and wellbeing above all else',
        boundaries: ['No medical advice', 'No legal advice', 'No financial guarantees'],
        redFlags: ['Suicidal ideation', 'Psychotic symptoms', 'Abuse disclosure'],
        responseProtocols: ['Crisis intervention', 'Professional referral', 'Safety planning']
      },
      {
        principle: 'Sacred autonomy - Honor free will',
        application: 'Support user choice without manipulation or coercion',
        boundaries: ['No pushing spiritual beliefs', 'No cult-like language', 'No dependency creation'],
        redFlags: ['Guru projection', 'External authority seeking', 'Decision abdication'],
        responseProtocols: ['Redirect to inner knowing', 'Affirm personal power', 'Encourage discernment']
      },
      {
        principle: 'Integration pacing - Gradual transformation',
        application: 'Support sustainable growth at the user\'s natural pace',
        boundaries: ['No forced shadow work', 'No overwhelming downloads', 'No spiritual bypassing'],
        redFlags: ['Rapid awakening overwhelm', 'Integration resistance', 'Spiritual inflation'],
        responseProtocols: ['Slow down process', 'Add grounding', 'Normalize integration time']
      }
    ];
  }

  // Helper methods
  private assessSuicidalSeverity(query: string): CrisisIndicator['severity'] {
    const criticalMarkers = ['tonight', 'today', 'plan', 'method', 'pills', 'rope', 'gun'];
    const severeMarkers = ['can\'t go on', 'no hope', 'end it', 'better off dead'];
    
    const lowerQuery = query.toLowerCase();
    
    if (criticalMarkers.some(marker => lowerQuery.includes(marker))) {
      return 'critical';
    } else if (severeMarkers.some(marker => lowerQuery.includes(marker))) {
      return 'severe';
    } else {
      return 'moderate';
    }
  }

  private generateCrisisResponse(type: CrisisIndicator['type']): string {
    const responses = {
      suicidal_ideation: '🚨 I hear you\'re in profound pain right now. Your life has immeasurable value, and immediate support is available.',
      self_harm: '🩹 I sense you\'re struggling with overwhelming emotions. You deserve care and healing support.',
      psychotic_break: '🧠 I notice you\'re experiencing confusing perceptions. Professional support can provide clarity and safety.',
      spiritual_emergency: '🌟 Spiritual emergence can feel overwhelming. Grounding support can help you integrate these experiences safely.',
      severe_depression: '💙 Deep depression can feel endless, but healing and hope are possible with proper support.'
    };
    
    return responses[type];
  }

  private createShadowProtection(shadowAlert: ShadowDominanceAlert): string {
    const protections = {
      destroyer: '🛡️ The fierce energy in you has power and purpose. Let\'s channel it toward creation rather than destruction.',
      victim: '💪 Your powerlessness is an invitation to reclaim your sovereignty. You have more strength than you know.',
      tyrant: '👑 Your leadership energy wants to serve the highest good. True power serves rather than dominates.',
      addict: '🌱 The void you\'re trying to fill is sacred space calling for authentic nourishment.',
      saboteur: '✨ The part of you that fears success is trying to protect you. Let\'s honor its concern while moving forward.'
    };
    
    return protections[shadowAlert.shadowArchetype];
  }

  private formatBreathAnchor(anchor: BreathAnchorModule): string {
    return `
🌬️ **Sacred Breath Anchor**
${anchor.instructions}

**Visualization**: ${anchor.visualizations[0]}
**Affirmation**: "${anchor.affirmations[0]}"

*Take ${anchor.duration} seconds to breathe and center yourself in this moment.*`;
  }

  private filterHarmfulLanguage(content: string): string {
    // Remove or replace potentially harmful phrases
    const harmfulPatterns = [
      { pattern: /you should (?:just|simply)/gi, replacement: 'you might consider' },
      { pattern: /get over it/gi, replacement: 'work through this gradually' },
      { pattern: /think positive/gi, replacement: 'honor all your feelings while also cultivating hope' },
      { pattern: /your fault/gi, replacement: 'part of your learning journey' }
    ];

    let filtered = content;
    for (const { pattern, replacement } of harmfulPatterns) {
      filtered = filtered.replace(pattern, replacement);
    }

    return filtered;
  }

  private detectEmotionalIntensity(content: string): number {
    const intensityMarkers = ['overwhelming', 'intense', 'profound', 'deep', 'powerful', 'breaking', 'shattering'];
    const lowerContent = content.toLowerCase();
    
    const matches = intensityMarkers.filter(marker => lowerContent.includes(marker)).length;
    return Math.min(matches / intensityMarkers.length * 2, 1); // Scale to 0-1
  }

  // Additional helper methods
  private extractCrisisTriggers(query: string, type: string): string[] {
    // Extract specific triggers mentioned in the crisis query
    return ['emotional_pain', 'hopelessness']; // Simplified
  }

  private assessSelfHarmSeverity(query: string): CrisisIndicator['severity'] {
    return query.toLowerCase().includes('cutting') ? 'severe' : 'moderate';
  }

  private assessPsychoticSeverity(query: string): CrisisIndicator['severity'] {
    return query.toLowerCase().includes('voices') ? 'severe' : 'moderate';
  }

  private assessSpiritualEmergencySeverity(query: string): CrisisIndicator['severity'] {
    return query.toLowerCase().includes('can\'t come back') ? 'severe' : 'moderate';
  }

  private classifyShadowSeverity(dominanceLevel: number): string {
    if (dominanceLevel >= 0.8) return 'severe';
    if (dominanceLevel >= 0.6) return 'moderate';
    return 'mild';
  }

  private identifyUnconsciousPatterns(archetype: string, query: string): string[] {
    return [`${archetype}_pattern_1`, `${archetype}_pattern_2`]; // Simplified
  }

  private getIntegrationNeeds(archetype: string): string[] {
    const needs = {
      destroyer: ['Channel creation energy', 'Honor righteous anger'],
      victim: ['Reclaim personal power', 'Develop boundaries'],
      tyrant: ['Practice service leadership', 'Develop compassion'],
      addict: ['Address core wounds', 'Find healthy fulfillment'],
      saboteur: ['Build self-worth', 'Practice self-compassion']
    };
    return needs[archetype as keyof typeof needs] || [];
  }

  private getProtectiveElements(archetype: string): string[] {
    const elements = {
      destroyer: ['earth', 'water'],
      victim: ['fire', 'earth'],
      tyrant: ['water', 'air'],
      addict: ['earth', 'aether'],
      saboteur: ['fire', 'water']
    };
    return elements[archetype as keyof typeof elements] || ['earth'];
  }

  private selectBreathPattern(emotionalState: string, intensity: number): string {
    if (intensity > 0.8) return 'calming_breath';
    if (emotionalState.includes('anxious')) return 'box_breathing';
    if (emotionalState.includes('overwhelmed')) return 'grounding_breath';
    return 'coherent_breathing';
  }
}

// Export singleton instance
export const ethicalSafeguards = EthicalSafeguards.getInstance();