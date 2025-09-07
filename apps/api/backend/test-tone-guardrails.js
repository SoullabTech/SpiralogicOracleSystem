/**
 * Test Tone Guardrails
 * Demonstrates how tone controls prevent overly saccharine language
 */

// Mock imports for testing
const ToneGuardrails = {
  toneGuardrails: new (class {
    sacredTerms = [
      'dear soul', 'beautiful one', 'radiant being', 'sacred traveler',
      'luminous vessel', 'beloved'
    ];

    tonePresets = {
      grounded: {
        style: 'grounded',
        maxPoeticDensity: 0.2,
        maxSacredTerms: 1,
        requireGrounding: true,
        personalPronounLimit: 2
      },
      balanced: {
        style: 'balanced',
        maxPoeticDensity: 0.35,
        maxSacredTerms: 2,
        requireGrounding: true,
        personalPronounLimit: 3
      },
      poetic: {
        style: 'poetic',
        maxPoeticDensity: 0.5,
        maxSacredTerms: 3,
        requireGrounding: false,
        personalPronounLimit: 4
      },
      mythic: {
        style: 'mythic',
        maxPoeticDensity: 0.7,
        maxSacredTerms: 5,
        requireGrounding: false,
        personalPronounLimit: 5
      }
    };

    applyGuardrails(greeting, config, userName) {
      let result = greeting;
      
      // Simple mock implementation
      // Replace excessive sacred terms
      let sacredCount = 0;
      this.sacredTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        result = result.replace(regex, (match) => {
          sacredCount++;
          if (sacredCount > config.maxSacredTerms) {
            return userName || 'friend';
          }
          return match;
        });
      });

      // Add grounding if needed
      if (config.requireGrounding && !result.includes('today') && !result.includes('now')) {
        result += ' How are you feeling in your body today?';
      }

      return result;
    }

    analyzeTone(text) {
      const words = text.split(/\s+/);
      const sacredCount = this.sacredTerms.filter(term => 
        text.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      const mythicWords = ['moon', 'spiral', 'cosmos', 'sacred', 'divine'];
      const mythicCount = words.filter(w => 
        mythicWords.includes(w.toLowerCase())
      ).length;

      const poeticDensity = mythicCount / words.length;

      return {
        poeticDensity: poeticDensity.toFixed(2),
        sacredTermCount: sacredCount,
        mythicWordCount: mythicCount,
        toneClassification: poeticDensity > 0.3 ? 'mythic' : 
                           poeticDensity > 0.15 ? 'poetic' : 'grounded'
      };
    }
  })()
};

// Test greetings
const testGreetings = [
  {
    name: "Overly Saccharine",
    raw: "✨ Welcome back, dear soul. Beautiful one, your radiant being illuminates this sacred space. Beloved luminous vessel, you are a divine spark of cosmic consciousness. Dear soul, your sacred journey continues in this mystical realm.",
    userName: "Sarah"
  },
  {
    name: "Mythic Overload",
    raw: "🌙 The moon whispers through the cosmic spiral as your sacred soul enters the divine temple. The eternal cosmos dances with your luminous essence. Sacred cycles of infinite wisdom spiral through your transcendent being.",
    userName: "Alex"
  },
  {
    name: "Balanced Mythic",
    raw: "✨ Welcome back, traveler. The moon appears in your field — a reminder of cycles and inner tides. Your journey continues to deepen.",
    userName: "Jordan"
  },
  {
    name: "Already Grounded",
    raw: "Good morning. How are you feeling today? Let's explore what's present for you right now.",
    userName: "Pat"
  }
];

console.log('🧪 TONE GUARDRAIL TESTS\n');
console.log('═'.repeat(60));

testGreetings.forEach(test => {
  console.log(`\n📝 Test: ${test.name}`);
  console.log('─'.repeat(60));
  
  console.log('\n🔤 RAW GREETING:');
  console.log(test.raw);
  
  // Analyze raw tone
  const rawAnalysis = ToneGuardrails.toneGuardrails.analyzeTone(test.raw);
  console.log('\n📊 Raw Analysis:', rawAnalysis);
  
  // Apply different tone styles
  console.log('\n🎨 TONE VARIATIONS:\n');
  
  ['grounded', 'balanced', 'poetic'].forEach(style => {
    const config = ToneGuardrails.toneGuardrails.tonePresets[style];
    const processed = ToneGuardrails.toneGuardrails.applyGuardrails(
      test.raw, 
      config, 
      test.userName
    );
    
    console.log(`${style.toUpperCase()}:`);
    console.log(processed);
    console.log();
  });
});

// Test specific scenarios
console.log('\n' + '═'.repeat(60));
console.log('🎯 SPECIFIC SCENARIOS\n');

const scenarios = [
  {
    name: "Journal Reference (Avoid Cringe)",
    raw: "Your beautiful soul wrote: 'I feel lost' — such divine wisdom emanates from your sacred words, beloved one.",
    expected: "You wrote: 'I feel lost' — those words still resonate today."
  },
  {
    name: "Symbol Reference (Keep Mythic, Add Ground)",
    raw: "The moon and stag dance through your cosmic spiral, weaving eternal patterns of transcendent wisdom.",
    expected: "The moon and stag appear in your journey, weaving patterns. What feels most real about this today?"
  },
  {
    name: "Elemental Balance (Simple)",
    raw: "Your sacred fire burns with divine luminosity while your precious water element yearns for cosmic attention.",
    expected: "Your fire energy is strong, while water could use more attention."
  }
];

scenarios.forEach(scenario => {
  console.log(`\n🎯 ${scenario.name}`);
  console.log('─'.repeat(40));
  console.log('Raw:', scenario.raw);
  
  const processed = ToneGuardrails.toneGuardrails.applyGuardrails(
    scenario.raw,
    ToneGuardrails.toneGuardrails.tonePresets.balanced,
    'You'
  );
  
  console.log('Processed:', processed);
  console.log('Expected:', scenario.expected);
});

// Show tone slider effect
console.log('\n' + '═'.repeat(60));
console.log('🎚️ TONE SLIDER DEMONSTRATION\n');

const sliderExample = "✨ Welcome, dear soul. Your fire burns bright with sacred passion. The moon whispers ancient wisdom.";

console.log('Base greeting:', sliderExample);
console.log('\nSlider positions:\n');

Object.keys(ToneGuardrails.toneGuardrails.tonePresets).forEach(style => {
  const config = ToneGuardrails.toneGuardrails.tonePresets[style];
  const result = ToneGuardrails.toneGuardrails.applyGuardrails(
    sliderExample,
    config,
    'Friend'
  );
  
  console.log(`[${style.toUpperCase()}]`);
  console.log(`  Sacred terms allowed: ${config.maxSacredTerms}`);
  console.log(`  Poetic density max: ${config.maxPoeticDensity}`);
  console.log(`  Result: ${result}`);
  console.log();
});

console.log('✅ Tone guardrail tests complete!\n');