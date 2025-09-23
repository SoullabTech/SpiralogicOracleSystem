#!/usr/bin/env ts-node

/**
 * MAIA Beta Systems Test
 * Run this NOW to verify all systems for 09/29/25 launch
 */

import { betaMonitoring } from '../lib/beta/BetaMonitoring';
import { betaExperienceManager } from '../lib/beta/BetaExperienceManager';

async function testBetaSystems() {
  console.log('🔍 Testing MAIA Beta Systems for 09/29/25 Launch...\n');
  console.log('═══════════════════════════════════════════════════\n');

  let passCount = 0;
  let failCount = 0;

  // Test 1: MAIA Response with Preferences
  console.log('1️⃣ Testing MAIA Orchestrator with preferences...');
  try {
    const { getMaiaOrchestrator } = require('../lib/oracle/MaiaFullyEducatedOrchestrator');
    const orchestrator = getMaiaOrchestrator();

    const response = await orchestrator.speak('Hello MAIA', 'test_user', {
      communicationStyle: 'gentle',
      explorationDepth: 'moderate',
      practiceOpenness: true,
      tone: 0.3,
      style: 'prose'
    });

    if (response && response.message) {
      console.log('✅ MAIA Response: WORKING');
      console.log('   Response preview:', response.message.substring(0, 50) + '...');
      passCount++;
    } else {
      throw new Error('No response received');
    }
  } catch (error) {
    console.log('❌ MAIA Response: FAILED');
    console.log('   Error:', error.message);
    failCount++;
  }

  // Test 2: Beta Monitoring System
  console.log('\n2️⃣ Testing Beta Monitoring System...');
  try {
    const testerId = betaMonitoring.registerTester({
      email: 'test@beta.com',
      onboardingCompleted: true,
      currentDay: 1,
      currentPhase: 'entry',
      preferences: {
        communicationStyle: 'balanced',
        explorationDepth: 'moderate',
        practiceOpenness: true,
        reasonForJoining: 'System test'
      }
    });

    const dashboard = betaMonitoring.getTesterDashboard(testerId);
    if (dashboard) {
      console.log('✅ Beta Monitoring: WORKING');
      console.log('   Dashboard generated for:', testerId);
      passCount++;
    } else {
      throw new Error('Dashboard generation failed');
    }
  } catch (error) {
    console.log('❌ Beta Monitoring: FAILED');
    console.log('   Error:', error.message);
    failCount++;
  }

  // Test 3: Beta Experience Manager
  console.log('\n3️⃣ Testing Beta Experience Manager...');
  try {
    const testUserId = 'test_experience_user';
    betaExperienceManager.setUserPreferences(testUserId, {
      communicationStyle: 'balanced',
      explorationDepth: 'moderate',
      practiceOpenness: true,
      tone: 0.5,
      style: 'prose',
      betaMode: true,
      startDate: new Date(),
      skipLevel: 'moderate',
      preferredTransition: 'guided'
    });

    const state = betaExperienceManager.getUserState(testUserId);
    const day = betaExperienceManager.getCurrentDay(testUserId);

    if (state && day) {
      console.log('✅ Experience Manager: WORKING');
      console.log('   Current Day:', day.day, '- Element:', day.element);
      passCount++;
    } else {
      throw new Error('State retrieval failed');
    }
  } catch (error) {
    console.log('❌ Experience Manager: FAILED');
    console.log('   Error:', error.message);
    failCount++;
  }

  // Test 4: Safety Pipeline
  console.log('\n4️⃣ Testing Safety Pipeline...');
  try {
    // Import safety system if available
    const { SafetyPipeline } = require('../lib/safety/SafetyPipeline');
    const safety = new SafetyPipeline();

    const assessment = await safety.assessRisk({
      userId: 'test_safety_user',
      message: 'feeling a bit overwhelmed',
      context: { currentPhase: 'entry', element: 'fire' }
    });

    if (assessment) {
      console.log('✅ Safety Pipeline: WORKING');
      console.log('   Risk Level:', assessment.riskLevel || 'low');
      passCount++;
    }
  } catch (error) {
    console.log('⚠️  Safety Pipeline: MODULE NOT FOUND (implement before launch)');
    console.log('   This is critical for user safety!');
    failCount++;
  }

  // Test 5: Phase Transitions
  console.log('\n5️⃣ Testing Phase Transitions...');
  try {
    const testUserId = 'test_transition_user';
    const initialPhase = betaExperienceManager.getUserState(testUserId).currentPhase;

    betaExperienceManager.updatePhase(testUserId, 'journal', {
      entryResponse: 'Test journal entry'
    });

    const updatedPhase = betaExperienceManager.getUserState(testUserId).currentPhase;

    if (updatedPhase === 'journal') {
      console.log('✅ Phase Transitions: WORKING');
      console.log('   Transition:', initialPhase, '→', updatedPhase);
      passCount++;
    } else {
      throw new Error('Phase transition failed');
    }
  } catch (error) {
    console.log('❌ Phase Transitions: FAILED');
    console.log('   Error:', error.message);
    failCount++;
  }

  // Final Report
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY\n');
  console.log(`✅ Passed: ${passCount}/5`);
  console.log(`❌ Failed: ${failCount}/5`);

  if (failCount === 0) {
    console.log('\n🎉 ALL SYSTEMS GO FOR LAUNCH!');
    console.log('Your beta is ready for Monday 09/29/25');
  } else if (failCount <= 1) {
    console.log('\n⚠️  MOSTLY READY - Fix remaining issue before launch');
  } else {
    console.log('\n🚨 CRITICAL ISSUES - Do not launch until fixed!');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Fix any failed tests');
  console.log('2. Generate 20 unique beta links');
  console.log('3. Send welcome emails Tuesday');
  console.log('4. Monitor dashboard Sunday evening');
  console.log('5. Launch Monday morning!');
}

// Run tests
if (require.main === module) {
  testBetaSystems().catch(console.error);
}

export { testBetaSystems };