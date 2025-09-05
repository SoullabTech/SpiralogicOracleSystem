/**
 * Test the Dialogical Architecture Anti-Solipsistic Safeguards
 * 
 * Verifies that the Daimon and Elements remain as genuine Others
 * rather than collapsing into self-projections or wishful thinking.
 */

import { DaimonicDialogueService, DaimonicOtherness } from './services/DaimonicDialogue';
import { ElementalDialogueService, ElementalDialogue } from './services/ElementalDialogue';
import { SynapticResonanceService, SynapticSpace } from './services/SynapticResonance';

async function testDialogicalArchitecture() {
  console.log('🔮 Testing Dialogical Architecture Anti-Solipsistic Safeguards\n');
  
  const daimonicDialogue = new DaimonicDialogueService();
  const elementalDialogue = new ElementalDialogueService();
  const synapticResonance = new SynapticResonanceService();
  
  // Test Case 1: Profile with high ego control (should trigger warnings)
  console.log('📋 Test Case 1: High Ego Control Profile');
  const highControlProfile = {
    userId: 'test-user-1',
    personality: {
      control: 0.9,
      boundaries: 0.8,
      mental: 0.85,
      selfFocus: 0.9
    },
    elemental: {
      fire: { 
        intensity: 0.8, 
        control: 0.9, 
        resistsControl: 0.1,
        unexpectedDirection: 0.1,
        burnsBeyondComfort: 0.2,
        visionBeyondSelf: 0.1
      },
      water: { 
        flow: 0.7, 
        containment: 0.9, 
        overflowsBoundary: 0.1,
        connectsBeyondSelf: 0.2,
        emotionalAutonomy: 0.1,
        tideTiming: 0.1
      }
    }
  };
  
  const daimonicOther1 = await daimonicDialogue.recognizeDaimonicOther(highControlProfile);
  const elementalDialogue1 = await elementalDialogue.generateElementalDialogue(highControlProfile);
  const synapticSpace1 = await synapticResonance.mapSynapticSpace(highControlProfile, daimonicOther1);
  
  console.log(`   Daimonic Alterity Irreducibility: ${daimonicOther1.alterity.irreducibility.toFixed(2)}`);
  console.log(`   Elemental Others Detected: ${elementalDialogue1.activeOthers.length}`);
  console.log(`   Anti-Solipsistic Warnings: ${elementalDialogue1.antiSolipsisticWarnings.length}`);
  console.log(`   Synaptic Gap Width: ${synapticSpace1.gap.width.toFixed(2)}`);
  
  if (elementalDialogue1.antiSolipsisticWarnings.length > 0) {
    console.log(`   ⚠️  WARNING: ${elementalDialogue1.antiSolipsisticWarnings[0]}`);
  }
  console.log();
  
  // Test Case 2: Profile with genuine otherness (should pass safely)
  console.log('📋 Test Case 2: Genuine Otherness Profile');
  const genuineOthernessProfile = {
    userId: 'test-user-2',
    personality: {
      control: 0.3,
      boundaries: 0.4,
      mental: 0.5,
      selfFocus: 0.3
    },
    elemental: {
      fire: { 
        intensity: 0.7, 
        control: 0.2, 
        resistsControl: 0.8,
        unexpectedDirection: 0.7,
        burnsBeyondComfort: 0.8,
        visionBeyondSelf: 0.9
      },
      water: { 
        flow: 0.8, 
        containment: 0.3, 
        overflowsBoundary: 0.7,
        connectsBeyondSelf: 0.8,
        emotionalAutonomy: 0.7,
        tideTiming: 0.6
      },
      earth: {
        connection: 0.8,
        pace: 0.3,
        awareness: 0.7,
        seasonalWisdom: 0.8,
        bodyIntelligence: 0.7,
        naturalTiming: 0.8,
        groundTruth: 0.7
      }
    }
  };
  
  const daimonicOther2 = await daimonicDialogue.recognizeDaimonicOther(genuineOthernessProfile);
  const elementalDialogue2 = await elementalDialogue.generateElementalDialogue(genuineOthernessProfile);
  const synapticSpace2 = await synapticResonance.mapSynapticSpace(genuineOthernessProfile, daimonicOther2);
  
  console.log(`   Daimonic Alterity Irreducibility: ${daimonicOther2.alterity.irreducibility.toFixed(2)}`);
  console.log(`   Elemental Others Detected: ${elementalDialogue2.activeOthers.length}`);
  console.log(`   Anti-Solipsistic Warnings: ${elementalDialogue2.antiSolipsisticWarnings.length}`);
  console.log(`   Synaptic Gap Width: ${synapticSpace2.gap.width.toFixed(2)}`);
  console.log(`   Dominant Voice: ${elementalDialogue2.dominantVoice?.element?.toUpperCase()}`);
  
  if (elementalDialogue2.dominantVoice) {
    console.log(`   🔥 Message: "${elementalDialogue2.dominantVoice.message}"`);
    console.log(`   📋 Demand: ${elementalDialogue2.dominantVoice.demand}`);
    console.log(`   🎁 Gift: ${elementalDialogue2.dominantVoice.gift}`);
  }
  console.log();
  
  // Test Case 3: Suspicious perfect harmony (should trigger warnings)
  console.log('📋 Test Case 3: Suspicious Perfect Harmony Profile');
  const perfectHarmonyProfile = {
    userId: 'test-user-3',
    personality: {
      control: 0.5,
      boundaries: 0.5,
      mental: 0.5,
      selfFocus: 0.5
    },
    elemental: {
      fire: { 
        intensity: 0.8, 
        control: 0.8,
        resistsControl: 0.1,
        unexpectedDirection: 0.1,
        burnsBeyondComfort: 0.1,
        visionBeyondSelf: 0.1
      },
      water: { 
        flow: 0.8, 
        containment: 0.8,
        overflowsBoundary: 0.1,
        connectsBeyondSelf: 0.1,
        emotionalAutonomy: 0.1,
        tideTiming: 0.1
      }
    }
  };
  
  // Manually set synaptic gaps to be too high (perfect agreement)
  const elementalDialogue3 = await elementalDialogue.generateElementalDialogue(perfectHarmonyProfile);
  
  console.log(`   Elemental Others Detected: ${elementalDialogue3.activeOthers.length}`);
  console.log(`   Anti-Solipsistic Warnings: ${elementalDialogue3.antiSolipsisticWarnings.length}`);
  
  if (elementalDialogue3.antiSolipsisticWarnings.length > 0) {
    console.log(`   ⚠️  WARNING: ${elementalDialogue3.antiSolipsisticWarnings[0]}`);
  }
  console.log();
  
  // Summary
  console.log('🎯 Test Results Summary:');
  console.log('─────────────────────────');
  console.log(`✓ High Control Profile: ${elementalDialogue1.antiSolipsisticWarnings.length > 0 ? 'WARNINGS TRIGGERED' : 'No warnings'}`);
  console.log(`✓ Genuine Otherness Profile: ${elementalDialogue2.antiSolipsisticWarnings.length === 0 ? 'CLEAN PASSAGE' : 'Warnings triggered'}`);
  console.log(`✓ Perfect Harmony Profile: ${elementalDialogue3.antiSolipsisticWarnings.length > 0 ? 'WARNINGS TRIGGERED' : 'No warnings'}`);
  
  const passedTests = [
    elementalDialogue1.antiSolipsisticWarnings.length > 0,
    elementalDialogue2.antiSolipsisticWarnings.length === 0 && elementalDialogue2.activeOthers.length > 0,
    elementalDialogue3.antiSolipsisticWarnings.length > 0
  ].filter(Boolean).length;
  
  console.log(`\n📊 Overall Result: ${passedTests}/3 tests passed`);
  
  if (passedTests === 3) {
    console.log('🎉 Anti-Solipsistic Safeguards are working correctly!');
    console.log('   The system successfully maintains the Daimon and Elements as genuine Others');
    console.log('   rather than allowing them to collapse into self-projections.');
  } else {
    console.log('⚠️  Some safeguards may need adjustment.');
  }
}

// Export for testing
export { testDialogicalArchitecture };

// Run test if called directly
if (require.main === module) {
  testDialogicalArchitecture().catch(console.error);
}