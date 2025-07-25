// ===============================================
// ADAPTIVE WISDOM ENGINE USAGE EXAMPLE
// Demonstrating Jung-Buddha routing based on patterns
// ===============================================

import { AdaptiveWisdomEngine, UserContext, Pattern, WisdomApproach } from '../AdaptiveWisdomEngine.js';

// ===============================================
// EXAMPLE USAGE
// ===============================================

export function demonstrateAdaptiveWisdom() {
  const wisdomEngine = new AdaptiveWisdomEngine();

  // Example 1: User with strong grasping patterns
  console.log('\n🧪 Example 1: Strong Grasping Patterns');
  console.log('=====================================');
  
  const graspingPatterns: Pattern[] = [
    {
      type: 'grasping',
      content: 'I need to make this work no matter what',
      intensity: 0.8,
      frequency: 3,
      timestamp: new Date()
    },
    {
      type: 'attachment',
      content: 'I can\'t let go of this relationship',
      intensity: 0.9,
      frequency: 2,
      timestamp: new Date()
    }
  ];

  const graspingContext: UserContext = {
    spiralPhase: 'seeking',
    currentElement: 'fire',
    emotionalState: 'transformation',
    recentPatterns: graspingPatterns,
    attachmentLevel: 0.8,
    shadowReadiness: 0.4,
    vulnerabilityLevel: 0.6
  };

  const graspingRouting = wisdomEngine.determineApproach(graspingContext);
  console.log('Approach:', graspingRouting.approach); // Should be 'buddha'
  console.log('Reasoning:', graspingRouting.reasoning);
  console.log('Confidence:', graspingRouting.confidence);
  console.log('Adjustments:', graspingRouting.adjustments);

  // Example 2: User with avoidance patterns
  console.log('\n🌀 Example 2: Strong Avoidance Patterns');
  console.log('=====================================');
  
  const avoidancePatterns: Pattern[] = [
    {
      type: 'avoidance',
      content: 'I don\'t want to look at this part of myself',
      intensity: 0.7,
      frequency: 4,
      timestamp: new Date()
    },
    {
      type: 'spiritual_bypass',
      content: 'I just need to think positive and transcend this',
      intensity: 0.6,
      frequency: 2,
      timestamp: new Date()
    }
  ];

  const avoidanceContext: UserContext = {
    spiralPhase: 'resistance',
    currentElement: 'water',
    emotionalState: 'stable',
    recentPatterns: avoidancePatterns,
    attachmentLevel: 0.3,
    shadowReadiness: 0.7,
    vulnerabilityLevel: 0.5
  };

  const avoidanceRouting = wisdomEngine.determineApproach(avoidanceContext);
  console.log('Approach:', avoidanceRouting.approach); // Should be 'jung'
  console.log('Reasoning:', avoidanceRouting.reasoning);
  console.log('Confidence:', avoidanceRouting.confidence);

  // Example 3: Identity crisis situation
  console.log('\n🔍 Example 3: Identity Crisis');
  console.log('============================');
  
  const identityCrisisPatterns: Pattern[] = [
    {
      type: 'identity_crisis',
      content: 'Who am I really? I don\'t recognize myself anymore',
      intensity: 0.9,
      frequency: 1,
      timestamp: new Date()
    }
  ];

  const crisisContext: UserContext = {
    spiralPhase: 'dissolution',
    currentElement: 'aether',
    emotionalState: 'crisis',
    recentPatterns: identityCrisisPatterns,
    attachmentLevel: 0.6,
    shadowReadiness: 0.5,
    vulnerabilityLevel: 0.8
  };

  const crisisRouting = wisdomEngine.determineApproach(crisisContext);
  console.log('Approach:', crisisRouting.approach); // Should be 'buddha' for identity crisis
  console.log('Reasoning:', crisisRouting.reasoning);
  console.log('Confidence:', crisisRouting.confidence);

  // Example 4: Complex mixed patterns
  console.log('\n⚖️ Example 4: Mixed Patterns (Hybrid Approach)');
  console.log('===============================================');
  
  const mixedPatterns: Pattern[] = [
    {
      type: 'grasping',
      content: 'I must figure this out',
      intensity: 0.6,
      frequency: 2,
      timestamp: new Date()
    },
    {
      type: 'shadow_emergence',
      content: 'I hate this angry part of myself',
      intensity: 0.8,
      frequency: 1,
      timestamp: new Date()
    },
    {
      type: 'avoidance',
      content: 'I don\'t want to deal with my family issues',
      intensity: 0.5,
      frequency: 3,
      timestamp: new Date()
    }
  ];

  const mixedContext: UserContext = {
    spiralPhase: 'integration',
    currentElement: 'earth',
    emotionalState: 'transformation',
    recentPatterns: mixedPatterns,
    attachmentLevel: 0.6,
    shadowReadiness: 0.8,
    vulnerabilityLevel: 0.7
  };

  const mixedRouting = wisdomEngine.determineApproach(mixedContext);
  console.log('Approach:', mixedRouting.approach); // Should be 'hybrid'
  console.log('Reasoning:', mixedRouting.reasoning);
  console.log('Supporting Factors:', mixedRouting.supportingFactors);

  // Example 5: Pattern analysis
  console.log('\n📊 Example 5: Pattern Analysis');
  console.log('=============================');
  
  const analysisPatterns: Pattern[] = [
    ...graspingPatterns,
    ...avoidancePatterns,
    ...identityCrisisPatterns,
    ...mixedPatterns
  ];

  const analysis = wisdomEngine.analyzePatterns(analysisPatterns);
  console.log('Dominant Pattern:', analysis.dominantPattern);
  console.log('Grasping Level:', analysis.graspingLevel);
  console.log('Avoidance Level:', analysis.avoidanceLevel);
  console.log('Shadow Emergence:', analysis.shadowEmergence);
  console.log('Spiritual Bypass:', analysis.spiritualBypass);
  console.log('Identity Crisis:', analysis.identityCrisis);
  console.log('Recommendations:', analysis.recommendations);

  return {
    graspingRouting,
    avoidanceRouting,
    crisisRouting,
    mixedRouting,
    analysis
  };
}

// ===============================================
// INTEGRATION EXAMPLES
// ===============================================

export class ExampleOracle {
  private wisdomEngine: AdaptiveWisdomEngine;

  constructor() {
    this.wisdomEngine = new AdaptiveWisdomEngine();
  }

  async respondToUser(userInput: string, userHistory: any): Promise<string> {
    // Build context from user input and history
    const context = this.buildUserContext(userInput, userHistory);
    
    // Get routing decision
    const routing = this.wisdomEngine.determineApproach(context);
    
    // Generate response based on approach
    let response = '';
    
    switch (routing.approach) {
      case 'jung':
        response = this.generateJungResponse(userInput, routing);
        break;
      case 'buddha':
        response = this.generateBuddhaResponse(userInput, routing);
        break;
      case 'hybrid':
        response = this.generateHybridResponse(userInput, routing);
        break;
    }

    // Apply adjustments
    if (routing.adjustments?.tone === 'nurturing') {
      response = this.makeMoreNurturing(response);
    }

    console.log(`🎯 Used ${routing.approach} approach (confidence: ${routing.confidence})`);
    console.log(`📝 Reasoning: ${routing.reasoning}`);

    return response;
  }

  private buildUserContext(input: string, history: any): UserContext {
    // This would analyze the input and build proper context
    // For demo purposes, simplified:
    const patterns: Pattern[] = [];
    
    if (input.toLowerCase().includes('need to') || input.toLowerCase().includes('must')) {
      patterns.push({
        type: 'grasping',
        content: input,
        intensity: 0.7,
        frequency: 1,
        timestamp: new Date()
      });
    }

    if (input.toLowerCase().includes('avoid') || input.toLowerCase().includes('don\'t want')) {
      patterns.push({
        type: 'avoidance',
        content: input,
        intensity: 0.6,
        frequency: 1,
        timestamp: new Date()
      });
    }

    return {
      spiralPhase: 'exploration',
      currentElement: 'air',
      emotionalState: 'stable',
      recentPatterns: patterns,
      attachmentLevel: 0.5,
      shadowReadiness: 0.6,
      vulnerabilityLevel: 0.5
    };
  }

  private generateJungResponse(input: string, routing: WisdomRouting): string {
    return `I notice something wanting to be integrated here. ${routing.reasoning} What part of yourself might be asking for attention?`;
  }

  private generateBuddhaResponse(input: string, routing: WisdomRouting): string {
    return `Let's pause and notice the space around this experience. ${routing.reasoning} What happens when you're not grasping for a solution?`;
  }

  private generateHybridResponse(input: string, routing: WisdomRouting): string {
    return `This calls for both embracing and releasing. ${routing.reasoning} What needs integration AND what needs to be let go?`;
  }

  private makeMoreNurturing(response: string): string {
    return `I'm here with you in this. ${response} Take your time - there's no rush.`;
  }
}

// Export for use in other parts of the system
export default {
  demonstrateAdaptiveWisdom,
  ExampleOracle
};