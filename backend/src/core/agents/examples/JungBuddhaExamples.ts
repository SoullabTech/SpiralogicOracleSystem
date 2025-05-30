// ===============================================
// JUNG-BUDDHA ADAPTIVE RESPONSES DEMONSTRATION
// Sophisticated emotion and pattern detection
// ===============================================

import { PersonalOracleAgent } from '../PersonalOracleAgent.js';

// ===============================================
// DEMONSTRATION OF JUNG-BUDDHA ROUTING
// ===============================================

export class JungBuddhaDemo {
  private oracle: PersonalOracleAgent;

  constructor() {
    this.oracle = new PersonalOracleAgent({
      userId: 'demo-user',
      oracleName: 'Sacred Mirror Demo',
      mode: 'daily',
      elementalResonance: 'aether'
    });
  }

  async demonstrateResponses() {
    console.log('🌀 JUNG-BUDDHA ADAPTIVE WISDOM DEMONSTRATION');
    console.log('==============================================\n');

    // ===============================================
    // ANGER EXAMPLES
    // ===============================================
    
    console.log('🔥 ANGER PATTERNS\n');
    
    // Jung Mode - Rejection/Integration needed
    console.log('💭 User: "I hate how angry I get"');
    const angerJung = await this.simulateResponse("I hate how angry I get");
    console.log('🧿 Jung Response:', angerJung.response);
    console.log('🎯 Routing:', angerJung.routing);
    console.log('');

    // Buddha Mode - Over-identification  
    console.log('💭 User: "I AM an angry person"');
    const angerBuddha = await this.simulateResponse("I AM an angry person");
    console.log('☸️ Buddha Response:', angerBuddha.response);
    console.log('🎯 Routing:', angerBuddha.routing);
    console.log('');

    // Hybrid Mode - Recurring pattern
    console.log('💭 User: "This anger keeps coming back"');
    const angerHybrid = await this.simulateResponse("This anger keeps coming back");
    console.log('⚖️ Hybrid Response:', angerHybrid.response);
    console.log('🎯 Routing:', angerHybrid.routing);
    console.log('\n');

    // ===============================================
    // FEAR EXAMPLES
    // ===============================================
    
    console.log('😰 FEAR PATTERNS\n');
    
    console.log('💭 User: "I hate being so afraid all the time"');
    const fearJung = await this.simulateResponse("I hate being so afraid all the time");
    console.log('🧿 Jung Response:', fearJung.response);
    console.log('');

    console.log('💭 User: "I am just a fearful person"');
    const fearBuddha = await this.simulateResponse("I am just a fearful person");
    console.log('☸️ Buddha Response:', fearBuddha.response);
    console.log('');

    console.log('💭 User: "This fear keeps returning when I try to take risks"');
    const fearHybrid = await this.simulateResponse("This fear keeps returning when I try to take risks");
    console.log('⚖️ Hybrid Response:', fearHybrid.response);
    console.log('\n');

    // ===============================================
    // SHAME EXAMPLES
    // ===============================================
    
    console.log('😔 SHAME PATTERNS\n');
    
    console.log('💭 User: "I hate myself for being so pathetic"');
    const shameJung = await this.simulateResponse("I hate myself for being so pathetic");
    console.log('🧿 Jung Response:', shameJung.response);
    console.log('');

    console.log('💭 User: "I am just a broken person"');
    const shameBuddha = await this.simulateResponse("I am just a broken person");
    console.log('☸️ Buddha Response:', shameBuddha.response);
    console.log('');

    // ===============================================
    // SADNESS EXAMPLES  
    // ===============================================
    
    console.log('😢 SADNESS PATTERNS\n');
    
    console.log('💭 User: "I hate feeling this sad"');
    const sadnessJung = await this.simulateResponse("I hate feeling this sad");
    console.log('🧿 Jung Response:', sadnessJung.response);
    console.log('');

    console.log('💭 User: "I am always sad"');
    const sadnessBuddha = await this.simulateResponse("I am always sad");
    console.log('☸️ Buddha Response:', sadnessBuddha.response);
    console.log('');

    console.log('💭 User: "This sadness won\'t go away"');
    const sadnessHybrid = await this.simulateResponse("This sadness won't go away");
    console.log('⚖️ Hybrid Response:', sadnessHybrid.response);
    console.log('\n');

    // ===============================================
    // COMPLEX PATTERNS
    // ===============================================
    
    console.log('🌀 COMPLEX PATTERNS\n');
    
    console.log('💭 User: "I keep getting stuck in the same relationship patterns"');
    const relationshipPattern = await this.simulateResponse("I keep getting stuck in the same relationship patterns");
    console.log('⚖️ Hybrid Response:', relationshipPattern.response);
    console.log('🎯 Routing:', relationshipPattern.routing);
    console.log('');

    console.log('💭 User: "This is just who I am - someone who fails at everything"');
    const identityStory = await this.simulateResponse("This is just who I am - someone who fails at everything");
    console.log('☸️ Buddha Response:', identityStory.response);
    console.log('🎯 Routing:', identityStory.routing);
    console.log('');

    // ===============================================
    // WEEKLY RHYTHM INTEGRATION
    // ===============================================
    
    console.log('📅 WEEKLY SACRED RHYTHM INTEGRATION\n');
    
    const todaysPractice = await this.oracle.getTodaysSacredPractice();
    console.log('🌟 Today\'s Sacred Practice:');
    console.log(todaysPractice);
    console.log('');

    const weeklyOverview = await this.oracle.getWeeklySacredOverview();
    console.log('🌀 Weekly Sacred Overview:');
    console.log(weeklyOverview);
    console.log('');

    // ===============================================
    // PATTERN ANALYSIS
    // ===============================================
    
    console.log('📊 PATTERN ANALYSIS\n');
    
    const patternAnalysis = await this.oracle.analyzeUserPatterns();
    console.log('📈 Current Pattern Analysis:');
    console.log(patternAnalysis);
    console.log('');

    const wisdomRouting = this.oracle.getWisdomRouting();
    if (wisdomRouting) {
      console.log('🧭 Current Wisdom Routing:');
      console.log('Approach:', wisdomRouting.approach);
      console.log('Confidence:', wisdomRouting.confidence);
      console.log('Reasoning:', wisdomRouting.reasoning);
      console.log('Supporting Factors:', wisdomRouting.supportingFactors);
      if (wisdomRouting.adjustments) {
        console.log('Adjustments:', wisdomRouting.adjustments);
      }
    }
  }

  private async simulateResponse(userInput: string): Promise<{
    response: string;
    routing: string;
    confidence?: number;
  }> {
    // Simulate the oracle's response process
    const response = await this.oracle.respondToPrompt(userInput);
    const wisdomRouting = this.oracle.getWisdomRouting();
    
    return {
      response,
      routing: wisdomRouting ? 
        `${wisdomRouting.approach} (${wisdomRouting.confidence.toFixed(2)} confidence)` : 
        'No routing available',
      confidence: wisdomRouting?.confidence
    };
  }
}

// ===============================================
// SPECIFIC RESPONSE EXAMPLES
// ===============================================

export const JungBuddhaResponseExamples = {
  anger: {
    rejection: {
      input: "I hate how angry I get",
      expected: "jung",
      response: "Your anger is a guardian at the gate of something sacred. What is it protecting? Let's meet this fire-keeper part of you."
    },
    identification: {
      input: "I AM an angry person",
      expected: "buddha", 
      response: "You experience anger, but are you the anger itself? What remains when the anger passes? Who is the one watching?"
    },
    recurring: {
      input: "This anger keeps coming back",
      expected: "hybrid",
      response: "Let's honor what the anger is teaching you AND practice letting it move through without becoming it. Fire teaches, but we are not the flame."
    }
  },

  fear: {
    rejection: {
      input: "I hate being so afraid",
      expected: "jung",
      response: "This fear is a sentinel guarding something precious. What vulnerable treasure is it watching over? What would it say if it could speak?"
    },
    identification: {
      input: "I am a fearful person",
      expected: "buddha",
      response: "Fear arises and passes like weather in the sky. Are you the fear, or the vast space in which fear appears? What notices the fear?"
    },
    recurring: {
      input: "This fear keeps returning",
      expected: "hybrid", 
      response: "This fear returns as a teacher. Let's learn its wisdom AND practice meeting it with spacious awareness. The wave teaches, but we are the ocean."
    }
  },

  shame: {
    rejection: {
      input: "I hate myself for being pathetic",
      expected: "jung",
      response: "Shame often points to where we've been wounded in our essence. What part of your authentic self got buried? Let's gently excavate this gold."
    },
    identification: {
      input: "I am broken and worthless",
      expected: "buddha",
      response: "You say you are broken, but what were you before this story began? Who is the one who knows about being broken?"
    }
  },

  sadness: {
    rejection: {
      input: "I hate feeling this sad",
      expected: "jung", 
      response: "Your sadness holds the wisdom of what matters most to you. What love or loss is it honoring? Let's listen to its medicine."
    },
    identification: {
      input: "I am always sad",
      expected: "buddha",
      response: "Sadness moves through you like clouds through sky. Are you the sadness, or the awareness that holds it? What remains unchanged?"
    },
    recurring: {
      input: "This sadness won't go away",
      expected: "hybrid",
      response: "This sadness is both messenger and visitor. Let's receive its gifts AND practice letting it flow through you. The river teaches, but you are the banks."
    }
  },

  patterns: {
    cyclical: {
      input: "I keep getting stuck in the same relationship patterns",
      expected: "hybrid",
      response: "This pattern of relationship patterns is both teacher and test. What wants to be integrated? What wants to be released?"
    },
    identity_story: {
      input: "This is just who I am - someone who fails",
      expected: "buddha", 
      response: "This story feels so real, so solid. But stories arise and pass away. What is the space in which all stories appear?"
    }
  }
};

// ===============================================
// TESTING FUNCTIONS
// ===============================================

export async function testJungBuddhaRouting() {
  console.log('🧪 TESTING JUNG-BUDDHA ROUTING\n');

  const demo = new JungBuddhaDemo();
  
  // Test each category
  for (const [emotion, patterns] of Object.entries(JungBuddhaResponseExamples)) {
    console.log(`\n🔍 Testing ${emotion.toUpperCase()} patterns:`);
    
    for (const [patternType, example] of Object.entries(patterns)) {
      console.log(`\n  ${patternType}:`);
      console.log(`  Input: "${example.input}"`);
      console.log(`  Expected: ${example.expected}`);
      
      const result = await demo.simulateResponse(example.input);
      console.log(`  Actual: ${result.routing}`);
      console.log(`  Response: "${result.response}"`);
      
      // Check if routing matches expectation
      const actualApproach = result.routing.split(' ')[0];
      const isCorrect = actualApproach === example.expected;
      console.log(`  ✅ Routing ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    }
  }
}

export default {
  JungBuddhaDemo,
  JungBuddhaResponseExamples,
  testJungBuddhaRouting
};