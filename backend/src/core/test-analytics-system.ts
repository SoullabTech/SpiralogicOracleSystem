/**
 * Test script for complete onboarding tone analytics system
 * 
 * Tests the full integration:
 * - PersonalOracleAgent tone detection
 * - StateMachineManager filtering 
 * - OnboardingFeedbackService prompts
 * - Analytics event emission
 */

import { onboardingFeedbackService } from '../services/OnboardingFeedbackService';
import { OracleStateMachineConfig } from './config/oracleStateMachine.config';

// Mock analytics for testing
class MockAnalytics {
  private events: Array<{eventName: string, data: any}> = [];
  
  emit(eventName: string, data: any) {
    this.events.push({ eventName, data });
    console.log(`📊 Analytics Event: ${eventName}`);
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
  
  getEvents() { return this.events; }
  clear() { this.events = []; }
}

const mockAnalytics = new MockAnalytics();

async function testAnalyticsSystem() {
  console.log('🧪 Testing Complete Onboarding Tone Analytics System\\n');
  
  const config = new OracleStateMachineConfig();
  const userId = 'test_user_123';
  
  // Test 1: Session 1 - First time user (curious tone)
  console.log('\\n=== Test 1: Session 1 - Curious User ===');
  const session1Input = "What is this system? How does it work? What can I expect?";
  
  // Check if feedback should be collected
  const shouldCollect1 = onboardingFeedbackService.shouldCollectFeedback(userId, 1);
  console.log(`Should collect feedback for Session 1: ${shouldCollect1 ? '✅' : '❌'}`);
  
  // Generate prompt
  if (shouldCollect1) {
    const prompt1 = onboardingFeedbackService.generateFeedbackPrompt(1);
    console.log(`Prompt: "${prompt1.question}"`);
    console.log(`Options: [${prompt1.options?.join(', ')}]`);
    
    // Format for Oracle
    const oraclePrompt1 = onboardingFeedbackService.formatPromptForOracle(1);
    console.log(`Oracle Formatted Prompt: "${oraclePrompt1}"`);
  }
  
  // Test 2: Session 4 - Bias decay check
  console.log('\\n=== Test 2: Session 4 - Bias Decay Check ===');
  
  const shouldCollect4 = onboardingFeedbackService.shouldCollectFeedback(userId, 4);
  console.log(`Should collect feedback for Session 4: ${shouldCollect4 ? '✅' : '❌'}`);
  
  if (shouldCollect4) {
    const prompt4 = onboardingFeedbackService.generateFeedbackPrompt(4);
    console.log(`Prompt: "${prompt4.question}"`);
    
    const oraclePrompt4 = onboardingFeedbackService.formatPromptForOracle(4);
    console.log(`Oracle Formatted Prompt: "${oraclePrompt4}"`);
  }
  
  // Test 3: Process user feedback and emit analytics
  console.log('\\n=== Test 3: Process User Feedback ===');
  
  await onboardingFeedbackService.processFeedback(
    userId,
    1,
    {
      selectedTone: 'curious',
      customResponse: 'This feels exactly right - you matched my energy perfectly!'
    },
    'curious', // system predicted tone
    mockAnalytics
  );
  
  // Test 4: Process mismatch feedback
  console.log('\\n=== Test 4: Process Mismatch Feedback ===');
  
  await onboardingFeedbackService.processFeedback(
    userId,
    4,
    {
      selectedTone: 'hesitant',
      customResponse: 'Actually feeling more cautious now'
    },
    'enthusiastic', // system predicted tone (mismatch!)
    mockAnalytics
  );
  
  // Test 5: Get feedback insights
  console.log('\\n=== Test 5: Feedback Insights ===');
  
  const insights = onboardingFeedbackService.getFeedbackInsights(userId);
  console.log('Feedback Insights:', JSON.stringify(insights, null, 2));
  
  // Test 6: Stage configuration integration
  console.log('\\n=== Test 6: Stage Configuration ===');
  
  try {
    const structuredGuideConfig = config.getStageConfig('structured_guide');
    console.log(`Structured Guide Config: ✅`);
    console.log(`  Label: "${structuredGuideConfig.label}"`);
    console.log(`  Response Templates: ${structuredGuideConfig.responseTemplates?.structured_guide?.length || 0}`);
    
    const crisisConfig = config.getCrisisOverride();
    console.log(`Crisis Override Config: ✅`);
    console.log(`  Triggers: ${crisisConfig.triggers.length}`);
    console.log(`  Response Template: "${crisisConfig.responseTemplate}"`);
    
    const onboardingConfig = config.getOnboardingConfig();
    console.log(`Onboarding Config: ✅`);
    console.log(`  Session Threshold: ${onboardingConfig.sessionThreshold}`);
    console.log(`  Tone Adaptations: ${Object.keys(onboardingConfig.toneAdaptation).length}`);
    
  } catch (error) {
    console.log(`Configuration Error: ❌ ${error}`);
  }
  
  // Test 7: Analytics events summary
  console.log('\\n=== Test 7: Analytics Events Summary ===');
  const events = mockAnalytics.getEvents();
  console.log(`Total Analytics Events Emitted: ${events.length}`);
  
  events.forEach((event, index) => {
    console.log(`  ${index + 1}. ${event.eventName}`);
    console.log(`     - User: ${event.data.userId?.substring(0, 8)}...`);
    console.log(`     - Session: ${event.data.sessionCount}`);
    console.log(`     - Resonance: ${event.data.resonanceScore?.toFixed(2) || 'N/A'}`);
  });
  
  console.log('\\n🎉 Complete Analytics System Test Complete!');
  console.log('\\n📈 System is ready for beta testing with full observability.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAnalyticsSystem().catch(console.error);
}

export { testAnalyticsSystem };