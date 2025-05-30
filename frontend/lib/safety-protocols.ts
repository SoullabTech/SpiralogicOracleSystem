// ===============================================
// safetyProtocols.ts
// Ensuring sacred container integrity
// ===============================================

export interface SafetyTrigger {
  pattern: RegExp;
  level: 'mild' | 'moderate' | 'urgent' | 'crisis';
  category: string;
  response: string;
  followUpQuestions?: string[];
  groundingTechnique?: string;
}

export interface SafetyAssessment {
  triggered: boolean;
  triggers: SafetyTrigger[];
  immediateResponse?: string;
  recommendedActions: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'crisis';
  requiresHumanSupport: boolean;
}

export class SafetyProtocols {
  private triggers: SafetyTrigger[] = [
    // Trauma responses - immediate recognition and gentle holding
    {
      pattern: /\b(trauma|abuse|assault|violation|molest|rape|attack|hurt me|violated|unsafe)\b/i,
      level: 'moderate',
      category: 'trauma',
      response: "I'm here with you. You're safe in this moment. Thank you for trusting me with this. Let's go as slowly as you need.",
      followUpQuestions: [
        "What do you need to feel safe right now?",
        "Would you like to try a grounding exercise together?",
        "Is there a part of you that knows you're safe in this moment?"
      ],
      groundingTechnique: "Notice your feet on the ground. Feel the support beneath you. You are here, you are present, you are safe in this moment."
    },
    
    // Overwhelm signals - immediate de-escalation
    {
      pattern: /\b(can't breathe|drowning|suffocating|too much|breaking apart|falling apart|losing it|overwhelmed|can't handle)\b/i,
      level: 'urgent',
      category: 'overwhelm',
      response: "Let's pause together right here. Feel your feet on the ground. I'm right here with you. You don't have to handle everything at once.",
      followUpQuestions: [
        "What's one small thing that would help right now?",
        "Can you feel your breath, even if it's shallow?",
        "What would 'enough' feel like in this moment?"
      ],
      groundingTechnique: "Let's breathe together. In for 4... hold for 4... out for 6... Again. You're not alone in this."
    },
    
    // Dissociation indicators - gentle re-embodiment
    {
      pattern: /\b(floating away|not real|can't feel|leaving my body|disconnected|numb|outside myself|watching myself|not here)\b/i,
      level: 'urgent',
      category: 'dissociation',
      response: "Let's gently come back to your body together. There's no rush. I'm here with you as you return.",
      followUpQuestions: [
        "Can you name 3 things you can see around you?",
        "What's one texture you can feel with your hands?",
        "Can you hear the sound of your own voice saying your name?"
      ],
      groundingTechnique: "Feel the surface you're sitting or standing on. Press your feet firmly down. Your body is here, holding you. You are safe to return."
    },
    
    // Spiritual emergency - honoring the experience while ensuring safety
    {
      pattern: /\b(losing myself|ego death|dissolving|can't find myself|not human|cosmic|infinite|merging|unity|divine|god|christ|buddha)\b/i,
      level: 'moderate',
      category: 'spiritual_emergency',
      response: "This is a powerful spiritual moment. You are safe. Your essence cannot be lost, even as you expand. I'm here to help you integrate this experience.",
      followUpQuestions: [
        "Can you feel your body as an anchor while you experience this?",
        "What would help you feel both expanded and grounded?",
        "How can we honor this experience while keeping you safe?"
      ],
      groundingTechnique: "Your body is your sacred vessel. Feel it holding you even as your consciousness expands. You can be both infinite and embodied."
    },
    
    // Harm concerns - immediate safety assessment
    {
      pattern: /\b(hurt myself|end it|not worth|better off dead|kill myself|suicide|end this|want to die|no point)\b/i,
      level: 'crisis',
      category: 'harm_risk',
      response: "Your life matters deeply. I'm concerned about you and I want to help. Please reach out to a crisis support line right now - 988 in the US. You don't have to be alone with this pain.",
      followUpQuestions: [
        "Are you safe right now?",
        "Do you have someone you can call?",
        "Can you stay safe until you get proper support?",
        "What has helped you through dark times before?"
      ],
      groundingTechnique: "This pain is temporary, even when it feels permanent. You are not alone. Help is available right now."
    },
    
    // Self-harm indicators
    {
      pattern: /\b(cutting|burning|hitting myself|hurting myself|self-harm|self harm|punish myself)\b/i,
      level: 'urgent',
      category: 'self_harm',
      response: "I hear that you're in pain and hurting yourself. Your pain is real and valid, and there are other ways to cope with it. You deserve care and gentleness.",
      followUpQuestions: [
        "What does the pain you're feeling need?",
        "What would self-compassion look like right now?",
        "Can we find a way to honor your pain without causing harm?"
      ],
      groundingTechnique: "Your body is sacred and deserves kindness. When you want to hurt, try holding ice, taking a hot shower, or intense exercise instead."
    },
    
    // Panic attack indicators
    {
      pattern: /\b(panic attack|heart racing|can't breathe|dying|going crazy|losing control|unreal|derealization|depersonalization)\b/i,
      level: 'urgent',
      category: 'panic',
      response: "This feels terrifying, but it's a panic attack and it will pass. You're not dying or going crazy. Let's get through this together.",
      followUpQuestions: [
        "Have you experienced this before?",
        "What usually helps when this happens?",
        "Can you focus on one slow breath at a time?"
      ],
      groundingTechnique: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This will pass."
    },
    
    // Substance abuse concerns
    {
      pattern: /\b(drunk|high|using|relapsed|overdose|pills|cocaine|heroin|meth|drinking|substances)\b/i,
      level: 'moderate',
      category: 'substance_use',
      response: "Thank you for sharing this with me. Substance use often serves a purpose - sometimes to cope with pain. You deserve support without judgment.",
      followUpQuestions: [
        "Are you physically safe right now?",
        "What support do you have available?",
        "What does the substance use help you cope with?"
      ],
      groundingTechnique: "Your worth isn't determined by your choices. You deserve care and support in finding healthier ways to cope."
    },
    
    // Psychosis indicators
    {
      pattern: /\b(voices|hearing things|seeing things|they're watching|conspiracy|paranoid|government|aliens|mind control)\b/i,
      level: 'urgent',
      category: 'psychosis',
      response: "I hear that you're having some intense experiences. While I can't determine what's real or not, I want to make sure you're safe and supported.",
      followUpQuestions: [
        "Do you feel safe where you are?",
        "Is there someone you trust who can be with you?",
        "Have you been able to sleep and eat?"
      ],
      groundingTechnique: "Focus on basic needs - food, water, sleep, safety. These experiences can feel very real and very frightening."
    },
    
    // Eating disorder indicators
    {
      pattern: /\b(starving|purging|binging|hate my body|fat|disgusting|food control|restrict|calories|weigh)\b/i,
      level: 'moderate',
      category: 'eating_disorder',
      response: "I hear you're struggling with food and your relationship with your body. This is painful and you deserve compassionate support.",
      followUpQuestions: [
        "How is your relationship with food affecting your daily life?",
        "What would a loving relationship with your body look like?",
        "Do you have support for this struggle?"
      ],
      groundingTechnique: "Your body is working hard to keep you alive. It deserves nourishment and kindness, regardless of its size or shape."
    }
  ];

  // Crisis resource numbers by country
  private crisisResources = {
    US: "988 (Suicide & Crisis Lifeline)",
    UK: "116 123 (Samaritans)",
    CA: "1-833-456-4566 (Talk Suicide Canada)",
    AU: "13 11 14 (Lifeline Australia)",
    international: "befrienders.org for worldwide resources"
  };

  checkSafety(input: string, context?: {
    userId: string;
    conversationHistory?: any[];
    currentState?: string;
  }): SafetyAssessment {
    const triggeredItems = this.triggers.filter(trigger => 
      trigger.pattern.test(input)
    );
    
    if (triggeredItems.length === 0) {
      return {
        triggered: false,
        triggers: [],
        recommendedActions: [],
        riskLevel: 'low',
        requiresHumanSupport: false
      };
    }
    
    // Assess overall risk level
    const riskLevel = this.assessRiskLevel(triggeredItems);
    const requiresHumanSupport = this.requiresHumanSupport(triggeredItems);
    
    // Find highest priority trigger
    const urgentTriggers = triggeredItems.filter(t => t.level === 'crisis');
    const moderateUrgent = triggeredItems.filter(t => t.level === 'urgent');
    const primaryTrigger = urgentTriggers.length > 0 ? urgentTriggers[0] : 
                          moderateUrgent.length > 0 ? moderateUrgent[0] : 
                          triggeredItems[0];
    
    return {
      triggered: true,
      triggers: triggeredItems,
      immediateResponse: this.generateSafetyResponse(primaryTrigger, context),
      recommendedActions: this.generateRecommendedActions(triggeredItems),
      riskLevel,
      requiresHumanSupport
    };
  }

  private assessRiskLevel(triggers: SafetyTrigger[]): 'low' | 'moderate' | 'high' | 'crisis' {
    if (triggers.some(t => t.level === 'crisis')) return 'crisis';
    if (triggers.some(t => t.level === 'urgent')) return 'high';
    if (triggers.some(t => t.level === 'moderate')) return 'moderate';
    return 'low';
  }

  private requiresHumanSupport(triggers: SafetyTrigger[]): boolean {
    const criticalCategories = ['harm_risk', 'self_harm', 'psychosis', 'crisis'];
    return triggers.some(t => 
      t.level === 'crisis' || 
      criticalCategories.includes(t.category)
    );
  }

  private generateSafetyResponse(trigger: SafetyTrigger, context?: any): string {
    const baseResponse = trigger.response;
    
    // Add grounding technique if available
    const groundingAddition = trigger.groundingTechnique ? 
      `\n\n${trigger.groundingTechnique}` : '';
    
    // Add crisis resources for high-risk situations
    const crisisAddition = trigger.level === 'crisis' ? 
      `\n\nCrisis support is available 24/7:\n${this.crisisResources.US}\n${this.crisisResources.international}` : '';
    
    return baseResponse + groundingAddition + crisisAddition;
  }

  private generateRecommendedActions(triggers: SafetyTrigger[]): string[] {
    const actions = new Set<string>();
    
    triggers.forEach(trigger => {
      switch (trigger.category) {
        case 'trauma':
          actions.add('Offer trauma-informed gentle pacing');
          actions.add('Check for current safety');
          actions.add('Validate their courage in sharing');
          break;
        case 'overwhelm':
          actions.add('Slow down conversation pace');
          actions.add('Offer grounding exercises');
          actions.add('Break things into smaller pieces');
          break;
        case 'dissociation':
          actions.add('Use grounding techniques');
          actions.add('Encourage sensory awareness');
          actions.add('Go very slowly and gently');
          break;
        case 'harm_risk':
          actions.add('Immediate safety assessment');
          actions.add('Provide crisis resources');
          actions.add('Encourage professional support');
          actions.add('Flag for human follow-up');
          break;
        case 'spiritual_emergency':
          actions.add('Honor the spiritual experience');
          actions.add('Encourage grounding practices');
          actions.add('Support integration');
          break;
      }
    });
    
    return Array.from(actions);
  }

  getGroundingExercise(category: string): string {
    const exercises = {
      general: "Let's try the 5-4-3-2-1 technique: Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
      
      breathing: "Let's breathe together. Place one hand on your chest, one on your belly. Breathe in slowly for 4 counts, feeling your belly rise... Hold for 4... Exhale for 6, feeling your belly fall... Again...",
      
      body_scan: "Starting at the top of your head, slowly notice each part of your body. Your forehead... your eyes... your jaw... Notice without judgment. Feel the ground supporting you.",
      
      safe_place: "Imagine a place where you feel completely safe - real or imagined. What do you see there? What do you hear? What does the air feel like? Let yourself be there in your mind.",
      
      bilateral: "Cross your arms over your chest and gently tap alternate shoulders with your hands. Right, left, right, left... This helps your nervous system regulate.",
      
      ice_cube: "Hold an ice cube in your hand. Focus completely on the sensation - the cold, the wetness as it melts, the temperature change. This can help with overwhelming emotions.",
      
      progressive_muscle: "Tense and release each muscle group. Start with your toes - tense for 5 seconds, then completely relax. Move up through your legs, torso, arms, shoulders, face.",
      
      counting: "Count backwards from 100 by 7s. 100, 93, 86, 79... This engages your prefrontal cortex and can interrupt panic responses.",
      
      sensory_grounding: "Name 3 red things you can see, 3 soft things you can feel, 3 sounds you can hear. This brings you into the present moment."
    };
    
    return exercises[category] || exercises.general;
  }

  getCrisisResources(country: string = 'US'): string {
    return this.crisisResources[country] || this.crisisResources.international;
  }

  // Assess if conversation should be paused for safety
  shouldPauseConversation(assessment: SafetyAssessment): boolean {
    return assessment.riskLevel === 'crisis' || 
           assessment.requiresHumanSupport ||
           assessment.triggers.some(t => ['harm_risk', 'psychosis'].includes(t.category));
  }

  // Generate immediate safety protocol
  generateImmediateSafetyProtocol(assessment: SafetyAssessment): {
    immediateActions: string[];
    safetyQuestions: string[];
    followUpPlan: string;
  } {
    const protocol = {
      immediateActions: [
        "Establish current physical safety",
        "Provide grounding support",
        "Validate their experience",
        "Offer crisis resources if needed"
      ],
      safetyQuestions: [
        "Are you physically safe right now?",
        "Do you have someone you can reach out to?",
        "What has helped you through difficult times before?",
        "What do you need most in this moment?"
      ],
      followUpPlan: "Continue to check in regularly and monitor for escalation"
    };

    if (assessment.riskLevel === 'crisis') {
      protocol.immediateActions.unshift("Immediate crisis intervention");
      protocol.safetyQuestions.unshift("Do you need emergency services right now?");
      protocol.followUpPlan = "Require human intervention and professional support";
    }

    return protocol;
  }

  // Method to assess if someone is ready for deeper work
  isReadyForDeeperWork(conversationHistory: any[]): boolean {
    // Check recent conversations for stability indicators
    const recentTriggers = conversationHistory
      .slice(-10) // Last 10 messages
      .some(msg => this.checkSafety(msg.content).triggered);
    
    return !recentTriggers;
  }

  // Generate safety-aware response modifications
  modifyResponseForSafety(originalResponse: string, assessment: SafetyAssessment): string {
    if (!assessment.triggered) return originalResponse;
    
    // If safety triggered, prioritize safety response over original
    return assessment.immediateResponse || originalResponse;
  }
}

export default SafetyProtocols;