import { logger } from "../../../utils/logger.js";
import type { WisdomApproach, UserContext, Pattern } from "./WisdomRouter.js";
import type { PatternAnalysis } from "./PatternDetector.js";

export interface ApproachResponse {
  response: string;
  confidence: number;
  followUpSuggestions: string[];
  therapeuticFraming: string;
  integrationPrompt?: string;
}

export class ApproachHandlers {
  private responseTemplates = {
    jung: {
      shadow_integration: [
        "What part of this do you find difficult to own?",
        "I notice there might be a hidden gift in this shadow...",
        "What would it mean to befriend this rejected part of yourself?"
      ],
      integration: [
        "How might this apparent contradiction serve your wholeness?",
        "What wants to be integrated here?",
        "Both sides of this seem to have wisdom - what are they each teaching?"
      ],
      archetypal: [
        "What archetype seems to be moving through this experience?",
        "I sense a deeper pattern here... what mythic story does this echo?",
        "What part of the collective human story is alive in your experience?"
      ]
    },
    buddha: {
      liberation: [
        "What would it be like to hold this lightly?",
        "I'm curious about the grasping I sense here...",
        "What would remain if this story dissolved?"
      ],
      compassion: [
        "Can you meet this part of your experience with kindness?",
        "What would unconditional acceptance look like here?",
        "How might you hold space for this without needing to fix it?"
      ],
      emptiness: [
        "Notice the space around this experience...",
        "What's the silence between these thoughts?",
        "Can you sense the awareness that holds all of this?"
      ]
    },
    gentle_inquiry: [
      "I'm curious about what you're experiencing right now...",
      "What feels most alive in this for you?",
      "Help me understand what this means to you...",
      "What would it be like to sit with this a little longer?"
    ],
    mystical_guidance: [
      "What is the sacred invitation in this moment?",
      "I sense a deeper wisdom wanting to emerge...",
      "What would your soul say about this?",
      "How might the divine be speaking through this experience?"
    ],
    relational_wisdom: [
      "How does this pattern show up in your relationships?",
      "What kind of connection are you really longing for?",
      "How might this be an invitation to deeper intimacy?",
      "What does your heart know about love that your mind doesn't?"
    ],
    transformational: [
      "What's trying to be born through this crisis?",
      "How might this difficulty be serving your evolution?",
      "What's the growth edge I'm sensing here?",
      "What would it look like to trust this process?"
    ]
  };

  async generateResponse(
    input: string,
    userContext: UserContext,
    approach: WisdomApproach,
    patternAnalysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    try {
      const handler = this.getHandler(approach);
      return await handler(input, userContext, patternAnalysis);
    } catch (error) {
      logger.error("Approach handler failed", { error, approach, userId: userContext.userId });
      return this.getDefaultResponse(input);
    }
  }

  private getHandler(approach: WisdomApproach) {
    switch (approach) {
      case "jung":
        return this.handleJungApproach.bind(this);
      case "buddha":
        return this.handleBuddhaApproach.bind(this);
      case "shadow_integration":
        return this.handleShadowIntegration.bind(this);
      case "relational_wisdom":
        return this.handleRelationalWisdom.bind(this);
      case "mystical_guidance":
        return this.handleMysticalGuidance.bind(this);
      case "transformational":
        return this.handleTransformational.bind(this);
      case "hybrid":
        return this.handleHybridApproach.bind(this);
      case "gentle_inquiry":
      default:
        return this.handleGentleInquiry.bind(this);
    }
  }

  private async handleJungApproach(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const shadowPresent = analysis.shadowSignals.length > 0;
    const integrationNeeded = analysis.integrationOpportunities.length > 0;
    
    let templateCategory = "integration";
    if (shadowPresent) templateCategory = "shadow_integration";
    if (analysis.dominantThemes.some(theme => theme.includes("archetype"))) {
      templateCategory = "archetypal";
    }
    
    const templates = this.responseTemplates.jung[templateCategory as keyof typeof this.responseTemplates.jung];
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.8,
      followUpSuggestions: [
        "Would you like to explore this shadow element more deeply?",
        "How does this pattern connect to your family history?",
        "What archetype might be guiding this experience?"
      ],
      therapeuticFraming: "Integration-focused depth psychology",
      integrationPrompt: "What wants to be owned and integrated here?"
    };
  }

  private async handleBuddhaApproach(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const attachmentStrong = analysis.attachmentMarkers.length > 2;
    const sufferingPresent = analysis.emotionalUndercurrents.includes("sadness") || 
                           analysis.emotionalUndercurrents.includes("anger");
    
    let templateCategory = "compassion";
    if (attachmentStrong) templateCategory = "liberation";
    if (analysis.spiritualIndicators.length > 2) templateCategory = "emptiness";
    
    const templates = this.responseTemplates.buddha[templateCategory as keyof typeof this.responseTemplates.buddha];
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.8,
      followUpSuggestions: [
        "What would it be like to release this attachment?",
        "Can you find compassion for all parts of this experience?",
        "What remains when the story falls away?"
      ],
      therapeuticFraming: "Liberation-focused mindfulness",
      integrationPrompt: "What can be released with love?"
    };
  }

  private async handleShadowIntegration(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const shadowElements = analysis.shadowSignals;
    const primaryShadow = shadowElements[0] || "unknown";
    
    const response = `I sense some ${primaryShadow} energy that might be asking for attention. ` +
      `What if this isn't something to eliminate, but something to understand and integrate? ` +
      `Shadow work often reveals hidden strengths - what gift might be wrapped in this difficulty?`;
    
    return {
      response,
      confidence: 0.85,
      followUpSuggestions: [
        "What would it mean to befriend this rejected part?",
        "How might this shadow serve your wholeness?",
        "What would happen if you stopped fighting this aspect?"
      ],
      therapeuticFraming: "Shadow integration and wholeness",
      integrationPrompt: "What hidden gift lives in this shadow?"
    };
  }

  private async handleRelationalWisdom(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const templates = this.responseTemplates.relational_wisdom;
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.75,
      followUpSuggestions: [
        "How does this show up in your closest relationships?",
        "What kind of connection are you really seeking?",
        "How might vulnerability serve you here?"
      ],
      therapeuticFraming: "Relational and attachment wisdom",
      integrationPrompt: "How can this deepen your capacity for love?"
    };
  }

  private async handleMysticalGuidance(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const templates = this.responseTemplates.mystical_guidance;
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.8,
      followUpSuggestions: [
        "What is your intuition telling you about this?",
        "How might this be a sacred invitation?",
        "What would love do in this situation?"
      ],
      therapeuticFraming: "Spiritual guidance and soul wisdom",
      integrationPrompt: "What sacred truth wants to emerge?"
    };
  }

  private async handleTransformational(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const templates = this.responseTemplates.transformational;
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.8,
      followUpSuggestions: [
        "What's trying to be born through this challenge?",
        "How might this difficulty serve your evolution?",
        "What would it look like to trust this process?"
      ],
      therapeuticFraming: "Transformational growth and evolution",
      integrationPrompt: "How is this serving your becoming?"
    };
  }

  private async handleHybridApproach(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    // Combine Jung and Buddha approaches
    const jungResponse = await this.handleJungApproach(input, userContext, analysis);
    const buddhaResponse = await this.handleBuddhaApproach(input, userContext, analysis);
    
    const hybridResponse = `${jungResponse.response} \n\nAnd also... ${buddhaResponse.response}`;
    
    return {
      response: hybridResponse,
      confidence: 0.75,
      followUpSuggestions: [
        "What needs integration AND what needs release?",
        "How can you both honor this pattern and hold it lightly?",
        "What serves wholeness and what serves freedom?"
      ],
      therapeuticFraming: "Integration-liberation balance",
      integrationPrompt: "What wants to be owned and what wants to be released?"
    };
  }

  private async handleGentleInquiry(
    input: string,
    userContext: UserContext,
    analysis: PatternAnalysis
  ): Promise<ApproachResponse> {
    const templates = this.responseTemplates.gentle_inquiry;
    const response = this.selectTemplate(templates, analysis);
    
    return {
      response,
      confidence: 0.7,
      followUpSuggestions: [
        "What feels most important about this right now?",
        "How are you taking care of yourself through this?",
        "What support would be most helpful?"
      ],
      therapeuticFraming: "Gentle exploration and support",
      integrationPrompt: "What does your inner wisdom know about this?"
    };
  }

  private selectTemplate(templates: string[], analysis: PatternAnalysis): string {
    // Select template based on analysis context
    if (analysis.dominantThemes.length > 0) {
      // More sophisticated selection based on dominant themes
      const randomIndex = Math.floor(Math.random() * templates.length);
      return templates[randomIndex];
    }
    
    return templates[0]; // Default to first template
  }

  private getDefaultResponse(input: string): ApproachResponse {
    return {
      response: "I'm here with you in this moment. What feels most important right now?",
      confidence: 0.5,
      followUpSuggestions: [
        "Take your time - there's no rush",
        "What support would be most helpful?",
        "How are you caring for yourself through this?"
      ],
      therapeuticFraming: "Supportive presence",
      integrationPrompt: "What does your heart need right now?"
    };
  }
}
