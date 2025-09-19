#!/usr/bin/env npx tsx

import { existentialCrisisSupport } from '../lib/oracle/ExistentialCrisisSupport';

const testInputs = [
  "i literally cannot stop checking instagram even though it makes me want to die. everyone from high school is getting engaged or promoted and im still living with my parents working at starbucks",
  "spent 2 hours yesterday trying to get one photo that looked 'effortless' lmaooo im so tired",
  "my therapist keeps telling me to just take a social media break but like... thats how i find jobs, stay connected, promote my art. its not optional anymore",
  "sometimes i don't even know who i actually am vs who i perform online. like which one is the real me"
];

console.log('🔍 TESTING EXISTENTIAL CRISIS PATTERN DETECTION\n');

testInputs.forEach((input, i) => {
  console.log(`\nTest ${i + 1}: "${input}"`);
  console.log('─'.repeat(60));

  const isExistential = existentialCrisisSupport.isExistentialCrisis(input);
  console.log(`Is Existential Crisis: ${isExistential}`);

  const pattern = existentialCrisisSupport.detectPattern(input);
  console.log(`Pattern Detected: ${pattern ? pattern.name : 'None'}`);

  const response = existentialCrisisSupport.generateResponse(input);
  console.log(`Response Generated: ${response ? 'Yes' : 'No'}`);

  if (response) {
    console.log(`Response: "${response}"`);
  }

  const intensity = existentialCrisisSupport.assessCrisisIntensity(input);
  console.log(`Crisis Intensity: ${intensity}`);
});