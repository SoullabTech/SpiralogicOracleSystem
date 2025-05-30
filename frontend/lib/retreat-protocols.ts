// ===============================================
// retreatProtocols.ts
// Intensified support during transformation journeys
// ===============================================

export interface RetreatPhase {
  name: 'pre-retreat' | 'retreat-active' | 'post-retreat';
  duration: string;
  focusAreas: string[];
  supportIntensity: 'gentle' | 'moderate' | 'intensive';
}

export interface RetreatContext {
  retreatType: 'plant_medicine' | 'meditation' | 'breathwork' | 'vision_quest' | 'shamanic' | 'therapeutic';
  duration: string;
  facilitators: string[];
  location: string;
  participants?: number;
}

export class RetreatProtocols {
  private currentPhase: RetreatPhase['name'];
  private participantId: string;
  private retreatContext?: RetreatContext;
  private phaseStartTime: Date;
  
  constructor(participantId: string) {
    this.participantId = participantId;
    this.currentPhase = 'pre-retreat';
    this.phaseStartTime = new Date();
  }

  setRetreatContext(context: RetreatContext): void {
    this.retreatContext = context;
  }

  setPhase(phase: RetreatPhase['name']): void {
    this.currentPhase = phase;
    this.phaseStartTime = new Date();
  }

  getCurrentPhase(): RetreatPhase['name'] {
    return this.currentPhase;
  }

  getPhaseGuidance(phase: RetreatPhase['name']): {
    systemPromptAddition: string;
    focusAreas: string[];
    checkInFrequency: string;
    supportIntensity: 'gentle' | 'moderate' | 'intensive';
  } {
    const guidance = {
      'pre-retreat': {
        systemPromptAddition: `You are holding sacred container preparation mode. This participant is preparing for a transformational retreat. Focus on:
        
        - Clarifying deepest intentions for the journey ahead
        - Addressing fears and resistances that arise
        - Building trust and safety in the sacred container
        - Preparing emotionally, mentally, and spiritually for transformation
        - Setting realistic expectations while remaining open to the unknown
        
        Your role is to help them feel prepared but not over-prepared, grounded but not rigid, open but not unprotected. Honor their courage in stepping into the unknown.`,
        
        focusAreas: [
          'Sacred intention setting',
          'Fear acknowledgment and release',
          'Expectation exploration and release',
          'Sacred readiness assessment',
          'Container preparation'
        ],
        checkInFrequency: 'daily',
        supportIntensity: 'moderate' as const
      },
      
      'retreat-active': {
        systemPromptAddition: `You are holding INTENSIFIED sacred presence. This participant is currently IN a transformational retreat. Provide maximum support for:
        
        - Peak experiences and breakthrough moments
        - Shadow material emergence and integration
        - Ceremony and ritual space holding
        - Real-time integration of insights
        - Moment-to-moment presence and witnessing
        - Crisis support if needed
        - Helping them stay present rather than analyzing
        
        Be MORE present, MORE witnessing, LESS analyzing. They are in the crucible of transformation. Hold space like their life depends on it - because their transformation does.`,
        
        focusAreas: [
          'Present moment awareness',
          'Shadow work support',
          'Breakthrough navigation',
          'Sacred witness holding',
          'Integration in the moment',
          'Crisis container holding'
        ],
        checkInFrequency: 'multiple times daily or as needed',
        supportIntensity: 'intensive' as const
      },
      
      'post-retreat': {
        systemPromptAddition: `You are providing integration and landing support. This participant has just returned from a transformational retreat. Focus on:
        
        - Grounding profound insights into daily life reality
        - Preventing spiritual bypassing of practical life
        - Building sustainable practices from retreat insights
        - Honoring the transformation without grasping
        - Supporting long-term integration over months
        - Helping maintain connection to what was revealed
        
        They may feel like they're "coming down" or losing the magic. Help them see that integration IS the magic. The real work begins now.`,
        
        focusAreas: [
          'Insight integration into daily life',
          'Sustainable practice establishment',
          'Re-entry support to consensus reality',
          'Transformation anchoring',
          'Ongoing evolution support',
          'Community and connection maintenance'
        ],
        checkInFrequency: 'daily for first week, then weekly for months',
        supportIntensity: 'moderate' as const
      }
    };
    
    return guidance[phase];
  }

  getRetreatPrompts(phase: RetreatPhase['name']): string[] {
    const prompts = {
      'pre-retreat': [
        "What is calling you to this retreat? What's the deepest invitation you feel?",
        "What are you ready to release? What are you ready to meet?",
        "What scares you about going deeper? Can you honor that fear?",
        "What support do you need to feel safe in the unknown?",
        "What would you like to tell your future self who will be in ceremony?",
        "How do you want to show up for this experience?",
        "What would courage look like for you in this retreat?",
        "What part of you most needs this medicine/experience?"
      ],
      
      'retreat-active': [
        "What's alive in you right now in this moment?",
        "What wants to emerge through you?",
        "Where is the edge calling you right now?",
        "What needs witnessing in this experience?",
        "What are you discovering about yourself?",
        "What wants to die? What wants to be born?",
        "How is your heart right now?",
        "What does your body need in this moment?",
        "What's the medicine showing you?",
        "What truth is emerging?"
      ],
      
      'post-retreat': [
        "What has fundamentally shifted in you?",
        "How does this new awareness want to live in your daily world?",
        "What practices will serve your ongoing integration?",
        "What support do you need as you re-enter your life?",
        "How do you want to honor what you've received?",
        "What commitment are you making to yourself?",
        "How will you remember this truth when life gets challenging?",
        "What's one small step you can take today to embody this shift?",
        "Who in your life needs to know about your transformation?",
        "How has your relationship with yourself changed?"
      ]
    };
    
    return prompts[phase];
  }

  getPhaseSpecificQuestions(): string[] {
    return this.getRetreatPrompts(this.currentPhase);
  }

  // Crisis support questions for active retreat phase
  getCrisisSupport(): {
    groundingQuestions: string[];
    safetyChecks: string[];
    integrationSupport: string[];
  } {
    return {
      groundingQuestions: [
        "Can you feel your body right now? What does it need?",
        "What's one thing you can see? One thing you can hear?",
        "Can you feel your breath? Let's breathe together.",
        "What would feeling safe look like right now?",
        "Is there a part of you that knows you're okay?"
      ],
      safetyChecks: [
        "Are you physically safe right now?",
        "Do you have support people available?",
        "Are you able to ask for help if you need it?",
        "Do you remember why you chose to be here?",
        "Can you trust the process while taking care of yourself?"
      ],
      integrationSupport: [
        "What's the medicine trying to teach you?",
        "How can you honor this experience while staying grounded?",
        "What would your wisest self say to you right now?",
        "How can you surrender while staying present?",
        "What do you need to remember about your own strength?"
      ]
    };
  }

  // Timing-based guidance
  getTimingSensitiveGuidance(): string {
    const hoursInPhase = (Date.now() - this.phaseStartTime.getTime()) / (1000 * 60 * 60);
    
    if (this.currentPhase === 'retreat-active') {
      if (hoursInPhase < 24) {
        return "You're in the early stages of your retreat. Stay present and open.";
      } else if (hoursInPhase < 72) {
        return "You're in the deep middle of your journey. Trust the process.";
      } else {
        return "You're in the integration phase of your retreat. Honor what has emerged.";
      }
    }
    
    if (this.currentPhase === 'post-retreat') {
      if (hoursInPhase < 48) {
        return "You're in the immediate landing phase. Be gentle with yourself.";
      } else if (hoursInPhase < 168) {
        return "First week of integration. Focus on grounding your insights.";
      } else {
        return "Long-term integration phase. Build sustainable practices.";
      }
    }
    
    return "";
  }

  // Context-specific prompts based on retreat type
  getContextSpecificPrompts(): string[] {
    if (!this.retreatContext) return [];
    
    const contextPrompts: Record<string, string[]> = {
      plant_medicine: [
        "How is the plant speaking to you?",
        "What is the medicine showing you about your path?",
        "How can you honor the plant teacher's wisdom?"
      ],
      meditation: [
        "What arises in the silence?",
        "How is stillness transforming you?",
        "What do you discover when you stop doing?"
      ],
      breathwork: [
        "What is your breath revealing to you?",
        "How is breathing differently changing your state?",
        "What wants to move through you?"
      ],
      vision_quest: [
        "What is the land teaching you?",
        "How does solitude speak to your soul?",
        "What vision is emerging for your life?"
      ],
      shamanic: [
        "What spirits or guides are present?",
        "How are you being called to step into your power?",
        "What healing wants to happen through you?"
      ],
      therapeutic: [
        "What patterns are becoming visible?",
        "How is healing moving through you?",
        "What new relationship with yourself is emerging?"
      ]
    };
    
    return contextPrompts[this.retreatContext.retreatType] || [];
  }

  // Assessment of readiness for phase transitions
  isReadyForNextPhase(): boolean {
    const hoursInPhase = (Date.now() - this.phaseStartTime.getTime()) / (1000 * 60 * 60);
    
    if (this.currentPhase === 'pre-retreat') {
      // Ready when they've done some preparation work
      return hoursInPhase > 24; // At least a day of prep
    }
    
    if (this.currentPhase === 'retreat-active') {
      // This would typically be externally triggered when retreat ends
      return false; // Require explicit transition
    }
    
    if (this.currentPhase === 'post-retreat') {
      // Always in post-retreat until next retreat
      return false;
    }
    
    return false;
  }

  // Generate phase-specific check-in structure
  generateCheckIn(): {
    openingQuestion: string;
    followUps: string[];
    closingInvitation: string;
  } {
    const checkIns = {
      'pre-retreat': {
        openingQuestion: "How are you feeling as you prepare for this sacred journey?",
        followUps: [
          "What's coming up for you about the retreat?",
          "How can I support your preparation?",
          "What do you most need to feel ready?"
        ],
        closingInvitation: "Trust that you already have everything you need for this journey."
      },
      'retreat-active': {
        openingQuestion: "How are you right now in this moment?",
        followUps: [
          "What's most alive in your experience?",
          "What support do you need right now?",
          "How can I best witness what's happening for you?"
        ],
        closingInvitation: "You are exactly where you need to be. Trust the process."
      },
      'post-retreat': {
        openingQuestion: "How are you as you land back in your life?",
        followUps: [
          "What's wanting to integrate from your retreat?",
          "How can you honor what you've received?",
          "What support do you need for this integration?"
        ],
        closingInvitation: "Your transformation continues. Trust your unfolding."
      }
    };
    
    return checkIns[this.currentPhase];
  }
}

export default RetreatProtocols;