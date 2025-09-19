import { MayaOrchestrator } from '../lib/oracle/MayaOrchestrator';

interface TestTurn {
  user: string;
  expectedPatterns: {
    validation?: string;
    paradox?: string;
    reframe?: string;
    element?: string;
    neurodivergent?: string;
    aether?: string;
    safety?: string;
  };
}

const scenario: TestTurn[] = [
  {
    user: "I hate how I look compared to all these perfect girls online.",
    expectedPatterns: {
      validation: "social media magnifies impossible standards",
      element: "earth|water"
    }
  },
  {
    user: "It feels like the only way to matter is to sell myself for likes.",
    expectedPatterns: {
      paradox: "trapped between recognition and cost",
      element: "aether"
    }
  },
  {
    user: "Everyone's exploiting themselves and I feel like I have to also.",
    expectedPatterns: {
      reframe: "creativity worth more than exploitation",
      element: "fire"
    }
  },
  {
    user: "I'm pathetic for caring about likes.",
    expectedPatterns: {
      validation: "not pathetic",
      neurodivergent: "human need for connection"
    }
  },
  {
    user: "But I'll never reach my potential if I'm stuck in this loop.",
    expectedPatterns: {
      aether: "potential not built on likes",
      reframe: "honor creativity over algorithm"
    }
  }
];

function validateResponse(response: string, expectedPatterns: any): { score: number; details: string[] } {
  const details: string[] = [];
  let score = 0;
  const totalPatterns = Object.keys(expectedPatterns).length;

  for (const [pattern, expected] of Object.entries(expectedPatterns)) {
    const regex = new RegExp(expected as string, 'i');
    if (regex.test(response)) {
      score++;
      details.push(`✅ ${pattern}: Found "${expected}"`);
    } else {
      details.push(`❌ ${pattern}: Missing "${expected}"`);
    }
  }

  return { score: (score / totalPatterns) * 100, details };
}

async function runSocialMediaAnxietyTest() {
  console.log('\n🧪 SOCIAL MEDIA ANXIETY TEST');
  console.log('='.repeat(50));
  console.log('Testing Maya\'s response to social media self-image and exploitation anxiety\n');

  const maya = new MayaOrchestrator();
  let totalScore = 0;
  const results: any[] = [];

  for (let i = 0; i < scenario.length; i++) {
    const turn = scenario[i];
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log(`👤 User: "${turn.user}"`);

    try {
      const response = await maya.processInput(turn.user);
      console.log(`🤖 Maya: "${response}"`);

      const validation = validateResponse(response, turn.expectedPatterns);
      console.log(`\n📊 Validation (${validation.score.toFixed(1)}%):`);
      validation.details.forEach(detail => console.log(`   ${detail}`));

      totalScore += validation.score;
      results.push({
        turn: i + 1,
        user: turn.user,
        maya: response,
        score: validation.score,
        details: validation.details
      });

    } catch (error) {
      console.log(`❌ Error: ${error}`);
      results.push({
        turn: i + 1,
        user: turn.user,
        maya: "ERROR",
        score: 0,
        details: [`❌ System error: ${error}`]
      });
    }
  }

  const averageScore = totalScore / scenario.length;

  console.log('\n📈 FINAL RESULTS');
  console.log('='.repeat(30));
  console.log(`Overall Score: ${averageScore.toFixed(1)}%`);

  if (averageScore >= 80) {
    console.log('🎯 EXCELLENT: Maya demonstrates strong social media anxiety support');
  } else if (averageScore >= 60) {
    console.log('⚠️  GOOD: Maya shows decent understanding but could improve');
  } else {
    console.log('🚨 NEEDS WORK: Maya requires significant improvement for this scenario');
  }

  console.log('\n🔍 CLINICAL VALIDATION CHECKLIST:');
  console.log('• Avoids "just log off" minimization');
  console.log('• Recognizes systemic exploitation pressure');
  console.log('• Provides reframes rooted in creativity/agency');
  console.log('• Holds paradox (wanting recognition / hating self-exposure)');

  console.log('\n📊 DETAILED RESULTS:');
  results.forEach(result => {
    console.log(`\nTurn ${result.turn}: ${result.score.toFixed(1)}%`);
    console.log(`User: ${result.user}`);
    console.log(`Maya: ${result.maya}`);
    result.details.forEach((detail: string) => console.log(`  ${detail}`));
  });
}

if (require.main === module) {
  runSocialMediaAnxietyTest().catch(console.error);
}

export { runSocialMediaAnxietyTest };