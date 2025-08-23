// Maya Greeting System - Dynamic, warm first-turn greetings
// Creates personalized, conversational openings that set a human tone

export interface GreetingContext {
  userName?: string;
  isFirstTurn: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface GreetingResult {
  greeting: string;
  template: string;
  warmthLevel: number;
}

const GREETING_TEMPLATES = [
  {
    id: 'presence_with_you',
    template: "Hi {name}—I'm here with you. ",
    warmth: 0.9,
    contexts: ['any']
  },
  {
    id: 'gentle_arrival',
    template: "Hello {name}. I'm glad you're here. ",
    warmth: 0.8,
    contexts: ['gentle', 'supportive']
  },
  {
    id: 'invitation_to_connect',
    template: "Hi {name}—what a gift to connect with you. ",
    warmth: 0.85,
    contexts: ['encouraging', 'positive']
  },
  {
    id: 'witnessing_moment',
    template: "Hello {name}. I'm witnessing this moment with you. ",
    warmth: 0.9,
    contexts: ['deep', 'reflective', 'negative']
  },
  {
    id: 'sacred_space',
    template: "Hi {name}—welcome to this sacred space between us. ",
    warmth: 0.95,
    contexts: ['aether', 'spiritual']
  },
  {
    id: 'threshold_meeting',
    template: "Hello {name}. What an honor to meet you at this threshold. ",
    warmth: 0.9,
    contexts: ['transformational', 'mixed']
  }
];

const TIME_MODIFIERS = {
  morning: ["this morning", "as the day begins", "in this fresh start"],
  afternoon: ["this afternoon", "in this midday moment", "as light peaks"],
  evening: ["this evening", "as day transforms to night", "in this twilight"],
  night: ["tonight", "in this quiet darkness", "under night's embrace"]
};

const ELEMENT_CONNECTORS = {
  fire: "I can sense some dynamic energy stirring. ",
  water: "There's a flowing quality to this moment. ",
  earth: "I feel the steadiness you bring. ",
  air: "There's clarity and openness here. ",
  aether: "Something transcendent is touching this space. "
};

export class MayaGreetingService {
  /**
   * Generate a personalized greeting based on context
   */
  static generateGreeting(context: GreetingContext): GreetingResult {
    if (!context.isFirstTurn) {
      return {
        greeting: "",
        template: "none",
        warmthLevel: 0
      };
    }

    // Determine appropriate template
    const template = this.selectTemplate(context);
    
    // Build greeting
    let greeting = this.buildBaseGreeting(template, context);
    
    // Add contextual elements
    greeting = this.addContextualDepth(greeting, context);
    
    return {
      greeting,
      template: template.id,
      warmthLevel: template.warmth
    };
  }

  /**
   * Generate multiple greeting options for variety
   */
  static generateGreetingOptions(context: GreetingContext, count: number = 3): GreetingResult[] {
    if (!context.isFirstTurn) return [];
    
    const options: GreetingResult[] = [];
    const usedTemplates = new Set<string>();
    
    for (let i = 0; i < count && usedTemplates.size < GREETING_TEMPLATES.length; i++) {
      const template = this.selectTemplate(context, usedTemplates);
      usedTemplates.add(template.id);
      
      const greeting = this.buildBaseGreeting(template, context);
      const fullGreeting = this.addContextualDepth(greeting, context);
      
      options.push({
        greeting: fullGreeting,
        template: template.id,
        warmthLevel: template.warmth
      });
    }
    
    return options;
  }

  private static selectTemplate(context: GreetingContext, exclude?: Set<string>) {
    // Filter templates based on context
    let candidates = GREETING_TEMPLATES.filter(t => {
      if (exclude?.has(t.id)) return false;
      
      // Check context compatibility
      if (context.sentiment === 'negative' && t.contexts.includes('negative')) return true;
      if (context.sentiment === 'positive' && t.contexts.includes('positive')) return true;
      if (context.element === 'aether' && t.contexts.includes('aether')) return true;
      if (t.contexts.includes('any')) return true;
      
      return false;
    });
    
    if (candidates.length === 0) {
      candidates = GREETING_TEMPLATES.filter(t => t.contexts.includes('any'));
    }
    
    // Prefer higher warmth for first encounters
    candidates.sort((a, b) => b.warmth - a.warmth);
    
    // Add some randomness while favoring top options
    const topTier = Math.min(3, candidates.length);
    const selected = Math.floor(Math.random() * topTier);
    
    return candidates[selected];
  }

  private static buildBaseGreeting(template: any, context: GreetingContext): string {
    const name = context.userName || this.getDefaultName();
    return template.template.replace('{name}', name);
  }

  private static addContextualDepth(greeting: string, context: GreetingContext): string {
    let enhanced = greeting;
    
    // Add element awareness if detected
    if (context.element && ELEMENT_CONNECTORS[context.element]) {
      enhanced += ELEMENT_CONNECTORS[context.element];
    }
    
    // Add time awareness occasionally (20% chance)
    if (context.timeOfDay && Math.random() < 0.2) {
      const timeModifier = TIME_MODIFIERS[context.timeOfDay];
      const modifier = timeModifier[Math.floor(Math.random() * timeModifier.length)];
      enhanced = enhanced.replace('. ', ` ${modifier}. `);
    }
    
    return enhanced;
  }

  private static getDefaultName(): string {
    // Default names based on environment or configuration
    return process.env.MAYA_DEFAULT_USER_NAME || "friend";
  }

  /**
   * Check if greeting should be added to response
   */
  static shouldGreet(conversationContext: any): boolean {
    return process.env.MAYA_GREETING_ENABLED === 'true' && 
           this.isFirstTurnOfConversation(conversationContext);
  }

  private static isFirstTurnOfConversation(context: any): boolean {
    // Check various indicators of first turn
    if (context?.turnCount === 1) return true;
    if (context?.isNewConversation) return true;
    if (!context?.previousResponse) return true;
    
    return false;
  }

  /**
   * Apply greeting to response if appropriate
   */
  static applyGreeting(responseText: string, context: GreetingContext): string {
    if (!context.isFirstTurn) return responseText;
    
    const greetingResult = this.generateGreeting(context);
    if (!greetingResult.greeting) return responseText;
    
    // Ensure proper spacing
    const separator = greetingResult.greeting.endsWith(' ') ? '' : ' ';
    return greetingResult.greeting + separator + responseText;
  }
}

/**
 * Convenience function for environment-aware greeting generation
 */
export function generateMayaGreeting(context: Partial<GreetingContext> = {}): GreetingResult {
  const fullContext: GreetingContext = {
    isFirstTurn: true,
    userName: process.env.MAYA_DEFAULT_USER_NAME || undefined,
    ...context
  };
  
  return MayaGreetingService.generateGreeting(fullContext);
}

/**
 * Simple greeting application for responses
 */
export function applyMayaGreeting(responseText: string, isFirstTurn: boolean = false): string {
  if (!isFirstTurn || process.env.MAYA_GREETING_ENABLED !== 'true') {
    return responseText;
  }
  
  const defaultGreeting = process.env.MAYA_DEFAULT_GREETING || "Hi—I'm here with you. ";
  const separator = defaultGreeting.endsWith(' ') ? '' : ' ';
  
  return defaultGreeting + separator + responseText;
}