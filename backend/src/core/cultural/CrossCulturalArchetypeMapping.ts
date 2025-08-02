/**
 * Cross-Cultural Archetype Mapping System
 *
 * Maps universal elemental archetypes to their cultural expressions across
 * different wisdom traditions, ensuring respectful and accurate representation
 * of diverse cultural perspectives on consciousness development.
 *
 * Features:
 * - Universal-to-cultural archetype translation
 * - Cultural role systems integration
 * - Seasonal and ceremonial correlations
 * - Modern expression guidance
 * - Shadow work adaptation across cultures
 */

import { logger } from '../../utils/logger';
import { indigenousSovereigntyProtocol } from './IndigenousSovereigntyProtocol';

export interface UniversalArchetype {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  universalQualities: string[];
  shadowAspects: string[];
  developmentStages: string[];
  modernExpressions: string[];
}

export interface CulturalArchetypeExpression {
  culturalName: string;
  traditionalRole: string;
  sacredQualities: string[];
  ceremonialContext: string[];
  seasonalAssociation?: string;
  colorSymbolism?: string[];
  animalSpirit?: string;
  plantMedicine?: string;
  sacredDirection?: string;
  modernIntegration: string;
  shadowWisdom: string[];
  healingGifts: string[];
  culturalTaboos?: string[];
  appropriateUse: string[];
}

export interface CulturalArchetypeSystem {
  traditionName: string;
  protectionLevel: 'open' | 'restricted' | 'sacred' | 'closed';
  systemDescription: string;
  elementalCorrespondences: Map<string, CulturalArchetypeExpression>;
  additionalRoles?: CulturalArchetypeExpression[];
  culturalNotes: string[];
  properAttribution: string;
}

export interface ArchetypeTranslationRequest {
  sourceElement: string;
  targetCulture: string;
  userCulturalBackground: string;
  contextOfUse: string;
  respectfulApproach: boolean;
}

export interface ArchetypeTranslationResult {
  permitted: boolean;
  culturalExpression?: CulturalArchetypeExpression;
  culturalGuidance?: string;
  respectfulFraming?: string;
  additionalContext?: string;
  attributionRequired?: string;
  alternativeSuggestion?: string;
}

/**
 * Cross-Cultural Archetype Mapping Engine
 * Facilitates respectful translation between universal and cultural archetypes
 */
export class CrossCulturalArchetypeMapping {
  private culturalSystems: Map<string, CulturalArchetypeSystem> = new Map();
  private universalArchetypes: Map<string, UniversalArchetype> = new Map();
  private translationMatrix: Map<string, Map<string, string>> = new Map();

  constructor() {
    this.initializeUniversalArchetypes();
    this.initializeCulturalSystems();
    this.initializeTranslationMatrix();
  }

  /**
   * Translate universal archetype to cultural expression
   */
  async translateArchetype(request: ArchetypeTranslationRequest): Promise<ArchetypeTranslationResult> {
    try {
      // Check cultural protocols first
      const protocolResult = await this.checkCulturalProtocols(request);
      if (!protocolResult.permitted) {
        return protocolResult;
      }

      // Get cultural system
      const culturalSystem = this.culturalSystems.get(request.targetCulture);
      if (!culturalSystem) {
        return this.handleUnknownCulture(request);
      }

      // Get cultural expression for element
      const culturalExpression = culturalSystem.elementalCorrespondences.get(request.sourceElement);
      if (!culturalExpression) {
        return this.handleNoCorrespondence(request, culturalSystem);
      }

      // Generate respectful framing
      const respectfulFraming = await this.generateRespectfulFraming(
        request,
        culturalSystem,
        culturalExpression
      );

      logger.info('Archetype translation completed', {
        sourceElement: request.sourceElement,
        targetCulture: request.targetCulture,
        culturalName: culturalExpression.culturalName
      });

      return {
        permitted: true,
        culturalExpression,
        culturalGuidance: this.generateCulturalGuidance(culturalSystem, culturalExpression),
        respectfulFraming,
        additionalContext: this.generateAdditionalContext(culturalSystem, culturalExpression),
        attributionRequired: culturalSystem.properAttribution
      };

    } catch (error) {
      logger.error('Error in archetype translation:', error);
      return {
        permitted: false,
        alternativeSuggestion: 'Translation temporarily unavailable. Please use universal archetype guidance.'
      };
    }
  }

  /**
   * Get all available cultural expressions for an element
   */
  async getAvailableCulturalExpressions(
    element: string,
    userCulturalBackground: string
  ): Promise<Map<string, CulturalArchetypeExpression>> {

    const availableExpressions = new Map<string, CulturalArchetypeExpression>();

    for (const [cultureName, culturalSystem] of this.culturalSystems) {
      const request: ArchetypeTranslationRequest = {
        sourceElement: element,
        targetCulture: cultureName,
        userCulturalBackground,
        contextOfUse: 'educational',
        respectfulApproach: true
      };

      const result = await this.translateArchetype(request);
      if (result.permitted && result.culturalExpression) {
        availableExpressions.set(cultureName, result.culturalExpression);
      }
    }

    return availableExpressions;
  }

  /**
   * Adapt elemental guidance to cultural context
   */
  async adaptElementalGuidanceToCulture(
    originalGuidance: string,
    element: string,
    targetCulture: string,
    userBackground: string
  ): Promise<{adaptedGuidance: string; culturalContext: string}> {

    const translationRequest: ArchetypeTranslationRequest = {
      sourceElement: element,
      targetCulture,
      userCulturalBackground: userBackground,
      contextOfUse: 'personal_guidance',
      respectfulApproach: true
    };

    const translation = await this.translateArchetype(translationRequest);

    if (!translation.permitted || !translation.culturalExpression) {
      return {
        adaptedGuidance: originalGuidance,
        culturalContext: 'Universal perspective maintained'
      };
    }

    const culturalExpression = translation.culturalExpression;

    // Adapt guidance language
    let adaptedGuidance = originalGuidance;

    // Replace universal terms with cultural equivalents
    adaptedGuidance = adaptedGuidance.replace(
      new RegExp(`${element} energy`, 'gi'),
      `${culturalExpression.culturalName} energy`
    );

    adaptedGuidance = adaptedGuidance.replace(
      new RegExp(`${element} element`, 'gi'),
      culturalExpression.traditionalRole
    );

    // Add cultural framing
    const culturalFraming = translation.respectfulFraming ?
      `\n\n${translation.respectfulFraming}` : '';

    // Add cultural qualities
    const culturalQualities = culturalExpression.sacredQualities.length > 0 ?
      `\n\nIn ${targetCulture} tradition, this energy embodies: ${culturalExpression.sacredQualities.slice(0, 3).join(', ')}.` : '';

    return {
      adaptedGuidance: adaptedGuidance + culturalFraming + culturalQualities,
      culturalContext: translation.culturalGuidance || 'Cultural adaptation applied'
    };
  }

  /**
   * Check cultural protocols for archetype access
   */
  private async checkCulturalProtocols(request: ArchetypeTranslationRequest): Promise<ArchetypeTranslationResult> {
    const culturalSystem = this.culturalSystems.get(request.targetCulture);

    if (!culturalSystem) {
      return { permitted: true }; // Unknown cultures default to permitted
    }

    // Check protection level
    if (culturalSystem.protectionLevel === 'closed') {
      return {
        permitted: false,
        alternativeSuggestion: `The ${request.targetCulture} archetypal system is protected for community members only.`
      };
    }

    if (culturalSystem.protectionLevel === 'sacred') {
      // Check with indigenous sovereignty protocol
      const wisdomRequest = {
        tradition: request.targetCulture,
        userCulturalBackground: request.userCulturalBackground,
        intentionForUse: request.contextOfUse
      };

      const protocolResult = await indigenousSovereigntyProtocol.evaluateWisdomRequest(wisdomRequest);

      if (!protocolResult.permitted) {
        return {
          permitted: false,
          culturalGuidance: protocolResult.culturalGuidance,
          alternativeSuggestion: protocolResult.alternativeSuggestion
        };
      }
    }

    return { permitted: true };
  }

  /**
   * Generate respectful framing for cultural archetype use
   */
  private async generateRespectfulFraming(
    request: ArchetypeTranslationRequest,
    culturalSystem: CulturalArchetypeSystem,
    expression: CulturalArchetypeExpression
  ): Promise<string> {

    const framings = {
      open: `Drawing inspiration from ${culturalSystem.traditionName} wisdom traditions, we honor the ${expression.culturalName} archetype.`,
      restricted: `With deep respect for ${culturalSystem.traditionName} traditions, we explore the ${expression.culturalName} wisdom.`,
      sacred: `With humility and permission, we learn from the sacred ${expression.culturalName} teachings of ${culturalSystem.traditionName}.`
    };

    const baseFraming = framings[culturalSystem.protectionLevel] || framings.open;

    // Add attribution if required
    const attribution = culturalSystem.properAttribution ?
      `\n\n*${culturalSystem.properAttribution}*` : '';

    return baseFraming + attribution;
  }

  /**
   * Generate cultural guidance for archetype use
   */
  private generateCulturalGuidance(
    culturalSystem: CulturalArchetypeSystem,
    expression: CulturalArchetypeExpression
  ): string {

    let guidance = `This wisdom comes from ${culturalSystem.traditionName} traditions. `;

    if (expression.appropriateUse.length > 0) {
      guidance += `Appropriate contexts include: ${expression.appropriateUse.join(', ')}. `;
    }

    if (expression.culturalTaboos && expression.culturalTaboos.length > 0) {
      guidance += `Please avoid: ${expression.culturalTaboos.join(', ')}. `;
    }

    if (culturalSystem.culturalNotes.length > 0) {
      guidance += culturalSystem.culturalNotes[0];
    }

    return guidance;
  }

  /**
   * Generate additional cultural context
   */
  private generateAdditionalContext(
    culturalSystem: CulturalArchetypeSystem,
    expression: CulturalArchetypeExpression
  ): string {

    let context = '';

    if (expression.seasonalAssociation) {
      context += `Seasonal connection: ${expression.seasonalAssociation}. `;
    }

    if (expression.sacredDirection) {
      context += `Sacred direction: ${expression.sacredDirection}. `;
    }

    if (expression.animalSpirit) {
      context += `Animal spirit: ${expression.animalSpirit}. `;
    }

    if (expression.ceremonialContext.length > 0) {
      context += `Ceremonial contexts: ${expression.ceremonialContext.join(', ')}.`;
    }

    return context;
  }

  /**
   * Handle unknown culture requests
   */
  private handleUnknownCulture(request: ArchetypeTranslationRequest): ArchetypeTranslationResult {
    return {
      permitted: false,
      alternativeSuggestion: `Cultural archetype system for '${request.targetCulture}' not available. Using universal archetype guidance.`
    };
  }

  /**
   * Handle missing correspondences
   */
  private handleNoCorrespondence(
    request: ArchetypeTranslationRequest,
    culturalSystem: CulturalArchetypeSystem
  ): ArchetypeTranslationResult {

    // Check if additional roles might match
    if (culturalSystem.additionalRoles) {
      const matchingRole = culturalSystem.additionalRoles.find(role =>
        role.sacredQualities.some(quality =>
          this.getUniversalQualities(request.sourceElement).includes(quality)
        )
      );

      if (matchingRole) {
        return {
          permitted: true,
          culturalExpression: matchingRole,
          culturalGuidance: `No direct correspondence found, but ${matchingRole.culturalName} shares similar qualities.`
        };
      }
    }

    return {
      permitted: false,
      alternativeSuggestion: `No ${request.sourceElement} correspondence in ${culturalSystem.traditionName}. Consider universal archetype guidance.`
    };
  }

  /**
   * Get universal qualities for an element
   */
  private getUniversalQualities(element: string): string[] {
    const archetype = this.universalArchetypes.get(element);
    return archetype ? archetype.universalQualities : [];
  }

  /**
   * Initialize universal archetypes
   */
  private initializeUniversalArchetypes(): void {
    this.universalArchetypes.set('fire', {
      element: 'fire',
      universalQualities: ['transformation', 'catalyst', 'inspiration', 'energy', 'action', 'passion'],
      shadowAspects: ['burnout', 'aggression', 'impatience', 'destruction'],
      developmentStages: ['spark', 'flame', 'conflagration', 'ember', 'phoenix'],
      modernExpressions: ['entrepreneur', 'activist', 'artist', 'innovator', 'leader']
    });

    this.universalArchetypes.set('water', {
      element: 'water',
      universalQualities: ['flow', 'emotion', 'healing', 'intuition', 'depth', 'cleansing'],
      shadowAspects: ['overwhelm', 'stagnation', 'manipulation', 'drowning'],
      developmentStages: ['droplet', 'stream', 'river', 'ocean', 'mist'],
      modernExpressions: ['healer', 'therapist', 'artist', 'counselor', 'nurturer']
    });

    this.universalArchetypes.set('earth', {
      element: 'earth',
      universalQualities: ['grounding', 'stability', 'manifestation', 'abundance', 'patience', 'wisdom'],
      shadowAspects: ['stubbornness', 'materialism', 'rigidity', 'stagnation'],
      developmentStages: ['seed', 'root', 'growth', 'harvest', 'compost'],
      modernExpressions: ['builder', 'provider', 'steward', 'organizer', 'teacher']
    });

    this.universalArchetypes.set('air', {
      element: 'air',
      universalQualities: ['clarity', 'communication', 'perspective', 'intellect', 'freedom', 'movement'],
      shadowAspects: ['detachment', 'overthinking', 'scattered', 'superficial'],
      developmentStages: ['breath', 'breeze', 'wind', 'storm', 'atmosphere'],
      modernExpressions: ['communicator', 'teacher', 'consultant', 'networker', 'strategist']
    });

    this.universalArchetypes.set('aether', {
      element: 'aether',
      universalQualities: ['unity', 'transcendence', 'integration', 'spirit', 'wholeness', 'connection'],
      shadowAspects: ['spiritual bypassing', 'disconnection', 'escapism'],
      developmentStages: ['awareness', 'connection', 'integration', 'transcendence', 'unity'],
      modernExpressions: ['spiritual teacher', 'healer', 'philosopher', 'sage', 'mystic']
    });

    logger.info('Universal archetypes initialized', {
      count: this.universalArchetypes.size
    });
  }

  /**
   * Initialize cultural archetype systems
   */
  private initializeCulturalSystems(): void {
    // Native American Medicine Wheel System
    this.culturalSystems.set('native_american', {
      traditionName: 'Native American Traditions',
      protectionLevel: 'sacred',
      systemDescription: 'Four directions medicine wheel teachings',
      elementalCorrespondences: new Map([
        ['fire', {
          culturalName: 'Thunder Being',
          traditionalRole: 'South Direction Keeper',
          sacredQualities: ['catalytic power', 'sacred fire', 'transformation', 'growth'],
          ceremonialContext: ['summer ceremonies', 'vision quests', 'fire ceremonies'],
          seasonalAssociation: 'Summer',
          colorSymbolism: ['red', 'yellow'],
          animalSpirit: 'Eagle',
          plantMedicine: 'Sage',
          sacredDirection: 'South',
          modernIntegration: 'Visionary leadership that serves community and earth',
          shadowWisdom: ['Destructive anger transformed into protective power'],
          healingGifts: ['breakthrough medicine', 'vision awakening', 'courage catalyst'],
          culturalTaboos: ['commercialization of sacred fire', 'misuse of ceremony'],
          appropriateUse: ['personal transformation', 'community healing', 'vision work']
        }],
        ['water', {
          culturalName: 'Water Spirit',
          traditionalRole: 'West Direction Keeper',
          sacredQualities: ['emotional wisdom', 'healing waters', 'intuitive knowing', 'cleansing'],
          ceremonialContext: ['water ceremonies', 'healing rituals', 'purification'],
          seasonalAssociation: 'Autumn',
          colorSymbolism: ['blue', 'black'],
          animalSpirit: 'Bear',
          plantMedicine: 'Cedar',
          sacredDirection: 'West',
          modernIntegration: 'Emotional healing that honors both individual and collective wounds',
          shadowWisdom: ['Overwhelming emotions transformed into healing medicine'],
          healingGifts: ['emotional healing', 'intuitive guidance', 'purification'],
          appropriateUse: ['healing work', 'emotional support', 'purification ritual']
        }],
        ['earth', {
          culturalName: 'Earth Mother',
          traditionalRole: 'North Direction Keeper',
          sacredQualities: ['grounding wisdom', 'abundance', 'practical knowledge', 'stability'],
          ceremonialContext: ['earth ceremonies', 'harvest rituals', 'blessing ceremonies'],
          seasonalAssociation: 'Winter',
          colorSymbolism: ['green', 'brown', 'white'],
          animalSpirit: 'Buffalo',
          plantMedicine: 'Sweetgrass',
          sacredDirection: 'North',
          modernIntegration: 'Sustainable living that honors seven generations',
          shadowWisdom: ['Materialism transformed into sacred stewardship'],
          healingGifts: ['grounding medicine', 'abundance wisdom', 'practical guidance'],
          appropriateUse: ['manifestation work', 'grounding practices', 'abundance healing']
        }],
        ['air', {
          culturalName: 'Wind Walker',
          traditionalRole: 'East Direction Keeper',
          sacredQualities: ['mental clarity', 'communication', 'new beginnings', 'perspective'],
          ceremonialContext: ['morning ceremonies', 'new beginning rituals', 'communication ceremonies'],
          seasonalAssociation: 'Spring',
          colorSymbolism: ['yellow', 'white'],
          animalSpirit: 'Eagle',
          plantMedicine: 'Tobacco',
          sacredDirection: 'East',
          modernIntegration: 'Clear communication that honors traditional wisdom and modern needs',
          shadowWisdom: ['Scattered thinking transformed into focused wisdom'],
          healingGifts: ['mental clarity', 'communication healing', 'perspective medicine'],
          appropriateUse: ['communication healing', 'mental clarity work', 'new beginning ceremonies']
        }]
      ]),
      culturalNotes: [
        'These teachings honor the four directions and seasonal cycles',
        'Each direction has its own gifts and responsibilities',
        'Integration of all four creates the sacred hoop of wholeness'
      ],
      properAttribution: 'Traditional Native American Medicine Wheel wisdom - shared with respect and proper protocols'
    });

    // Celtic Elemental System
    this.culturalSystems.set('celtic', {
      traditionName: 'Celtic Traditions',
      protectionLevel: 'open',
      systemDescription: 'Celtic elemental and seasonal wisdom',
      elementalCorrespondences: new Map([
        ['fire', {
          culturalName: 'Brigid\'s Flame',
          traditionalRole: 'Fire Keeper',
          sacredQualities: ['creative fire', 'inspiration', 'forge wisdom', 'sacred craft'],
          ceremonialContext: ['Imbolc', 'fire festivals', 'craft blessings'],
          seasonalAssociation: 'Late Winter/Early Spring',
          colorSymbolism: ['red', 'gold'],
          animalSpirit: 'Stag',
          plantMedicine: 'Rowan',
          modernIntegration: 'Creative inspiration that honors traditional crafts and innovation',
          shadowWisdom: ['Destructive creativity transformed into sacred craft'],
          healingGifts: ['creative inspiration', 'craft mastery', 'innovation wisdom'],
          appropriateUse: ['creative work', 'craft learning', 'inspiration seeking']
        }],
        ['water', {
          culturalName: 'Sacred Well',
          traditionalRole: 'Well Keeper',
          sacredQualities: ['healing waters', 'wisdom depths', 'sacred flow', 'memory keeper'],
          ceremonialContext: ['well blessings', 'healing rituals', 'memory ceremonies'],
          seasonalAssociation: 'All seasons',
          colorSymbolism: ['blue', 'silver'],
          animalSpirit: 'Salmon',
          plantMedicine: 'Willow',
          modernIntegration: 'Healing wisdom that connects ancient and modern medicine',
          shadowWisdom: ['Stagnant emotions transformed into flowing wisdom'],
          healingGifts: ['emotional healing', 'memory wisdom', 'flow restoration'],
          appropriateUse: ['healing work', 'memory healing', 'emotional flow']
        }]
      ]),
      culturalNotes: [
        'Celtic wisdom honors the land and seasonal cycles',
        'Each element connects to specific deities and festivals',
        'Integration involves honoring both earth and otherworld'
      ],
      properAttribution: 'Traditional Celtic wisdom - honored with respect for its cultural origins'
    });

    logger.info('Cultural archetype systems initialized', {
      systemCount: this.culturalSystems.size
    });
  }

  /**
   * Initialize translation matrix for quick lookups
   */
  private initializeTranslationMatrix(): void {
    // Create quick reference matrix for common translations
    for (const [cultureName, culturalSystem] of this.culturalSystems) {
      const cultureMatrix = new Map<string, string>();

      for (const [element, expression] of culturalSystem.elementalCorrespondences) {
        cultureMatrix.set(element, expression.culturalName);
      }

      this.translationMatrix.set(cultureName, cultureMatrix);
    }

    logger.info('Translation matrix initialized');
  }

  /**
   * Get quick translation without full protocol checking
   */
  getQuickTranslation(element: string, culture: string): string | null {
    const cultureMatrix = this.translationMatrix.get(culture);
    return cultureMatrix ? cultureMatrix.get(element) || null : null;
  }

  /**
   * Get all available cultures
   */
  getAvailableCultures(): string[] {
    return Array.from(this.culturalSystems.keys());
  }

  /**
   * Get cultural system info
   */
  getCulturalSystemInfo(culture: string): CulturalArchetypeSystem | null {
    return this.culturalSystems.get(culture) || null;
  }
}

export const crossCulturalArchetypeMapping = new CrossCulturalArchetypeMapping();