#!/usr/bin/env npx tsx

import { askMayaInsights } from '../lib/oracle/AskMayaInsights';

async function testAskMayaInsights() {
  console.log('🧠 Testing Ask Maya Insights System\n');

  const testQueries = [
    {
      name: "ADHD TikTok Recognition",
      socialMediaTrigger: "I saw this TikTok about ADHD and how people mask at work",
      personalResonance: "I do that exact thing - I write everything down obsessively and set 15 alarms. I thought I was just organized but now I'm wondering if this is actually masking executive dysfunction",
      context: { ageRange: 'adult', workSituation: 'employed', financialStress: 'moderate' },
      seekingType: 'understanding'
    },
    {
      name: "Trauma Response Recognition",
      socialMediaTrigger: "Someone posted about fawn responses and people pleasing",
      personalResonance: "I literally cannot say no to anyone and I'm exhausted all the time. I didn't know this was a trauma response but it makes so much sense with my childhood",
      context: { ageRange: 'young-adult', workSituation: 'student', previousTherapy: false },
      seekingType: 'coping-strategies'
    },
    {
      name: "Late Autism Recognition",
      socialMediaTrigger: "I found this Instagram account about late-diagnosed autistic women",
      personalResonance: "The masking, the special interests, the sensory issues - I've been doing all this my whole life but thought everyone did. I'm 35 and just now realizing this might be autism",
      context: { ageRange: 'adult', workSituation: 'employed', financialStress: 'low', previousTherapy: true },
      seekingType: 'next-steps'
    },
    {
      name: "Depression vs ADHD Confusion",
      socialMediaTrigger: "Saw a thread about how ADHD can look like depression",
      personalResonance: "I've been diagnosed with depression for years but the meds don't help. I have zero motivation, can't focus, and feel like I'm lazy. But what if it's actually ADHD?",
      context: { ageRange: 'adult', workSituation: 'unemployed', financialStress: 'high', previousTherapy: true },
      seekingType: 'resources'
    },
    {
      name: "Validation Seeking",
      socialMediaTrigger: "Read about rejection sensitivity dysphoria",
      personalResonance: "Any criticism makes me want to disappear. I've been told I'm 'too sensitive' my whole life. Am I broken or is this actually a real thing?",
      context: { ageRange: 'young-adult', workSituation: 'student' },
      seekingType: 'validation'
    }
  ];

  for (const query of testQueries) {
    console.log(`📊 Testing: ${query.name}`);
    console.log(`Social Media Trigger: "${query.socialMediaTrigger}"`);
    console.log(`Personal Resonance: "${query.personalResonance.substring(0, 80)}..."`);
    console.log(`Seeking: ${query.seekingType}`);
    console.log('-'.repeat(60));

    try {
      const response = askMayaInsights.processQuery(
        query.socialMediaTrigger,
        query.personalResonance,
        query.context as any,
        query.seekingType as any
      );

      console.log('✅ Maya Response Generated:');
      console.log(`🧠 Clinical Context: ${response.clinicalContext.primaryConsideration.substring(0, 100)}...`);
      console.log(`💡 Immediate Strategies: ${response.everydayApplications.immediateStrategies.length} provided`);
      console.log(`🔗 Resources: ${response.resources.length} curated`);
      console.log(`🌈 Intersectional Factors: ${response.intersectionalFactors.length} identified`);
      console.log(`💝 Validation: "${response.validationMessage}"`);
      console.log(`🎯 Next Steps: ${response.nextSteps.length} suggested`);

      // Test pattern detection
      console.log('\n🔍 Pattern Analysis:');
      const detectedPattern = (askMayaInsights as any).detectPattern(query.personalResonance);
      console.log(`Detected Pattern: ${detectedPattern}`);

      // Test differential considerations
      if (response.clinicalContext.differentialFactors.length > 0) {
        console.log(`Differential Factors: ${response.clinicalContext.differentialFactors.join(', ')}`);
      }

      console.log('\n' + '='.repeat(80) + '\n');

    } catch (error) {
      console.error(`❌ Error processing query "${query.name}":`, error);
      console.log('\n' + '='.repeat(80) + '\n');
    }
  }

  // Test specific intersectional factors
  console.log('🌈 Testing Intersectional Factor Detection\n');

  const intersectionalTests = [
    {
      context: { ageRange: 'teen', financialStress: 'high' },
      expectedFactors: ['teen brain development', 'financial stress']
    },
    {
      context: { workSituation: 'caregiver', livingSituation: 'unstable' },
      expectedFactors: ['caregiver stress', 'housing instability']
    },
    {
      context: { ageRange: 'middle-age', previousTherapy: false },
      expectedFactors: ['later-in-life recognition', 'life transitions']
    }
  ];

  for (const test of intersectionalTests) {
    console.log(`Context: ${JSON.stringify(test.context)}`);
    const factors = (askMayaInsights as any).assessIntersectionalFactors('adhd', test.context);
    console.log(`Factors Identified: ${factors.length > 0 ? factors.join('; ') : 'None'}`);
    console.log('---');
  }

  console.log('\n✅ Ask Maya Insights testing complete!');
  console.log('\n💫 Key Features Tested:');
  console.log('• Social media symptom translation');
  console.log('• Clinical context with differential considerations');
  console.log('• Everyday life applications');
  console.log('• Curated resource recommendations');
  console.log('• Intersectional factor assessment');
  console.log('• Validation and next steps');
}

testAskMayaInsights().catch(console.error);