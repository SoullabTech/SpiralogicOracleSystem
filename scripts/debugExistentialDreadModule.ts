#!/usr/bin/env npx tsx

import { existentialDreadModule } from '../lib/oracle/ExistentialDreadModule';

async function debugModule() {
  console.log('🔍 Debugging Existential Dread Module\n');

  const testInputs = [
    'i cant stop reading about economic collapse, climate disasters, and government surveillance',
    'see thats the thing, theyre all connected. the banks, the surveillance, the food supply manipulation',
    'i spend 6 hours a day reading substacks and telegram channels',
    'probably when i realized my kids wont have the life i had. theyll never own homes',
    'so what do i do? just pretend everythings fine? become one of the sheep?'
  ];

  testInputs.forEach((input, i) => {
    console.log(`${i+1}. Input: "${input}"`);
    try {
      const assessment = existentialDreadModule.detectPatterns(input);
      console.log('Assessment:', {
        patternType: assessment.patternType,
        hasRealConcerns: assessment.hasRealConcerns,
        inSpiral: assessment.inSpiral,
        informationAddiction: assessment.informationAddiction,
        parentalGuilt: assessment.parentalGuilt,
        intensity: assessment.intensity.toFixed(2)
      });

      const response = existentialDreadModule.generateResponse(assessment, input);
      if (response) {
        console.log('Response:', {
          text: response.response,
          element: response.element,
          technique: response.technique,
          priority: response.priority
        });
      } else {
        console.log('Response: null (no pattern detected)');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('---\n');
  });
}

debugModule().catch(console.error);