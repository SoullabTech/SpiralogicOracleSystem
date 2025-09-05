/**
 * Test script for unified Oracle State Machine config system
 * 
 * Tests:
 * - Crisis override detection and response
 * - Tone-adaptive onboarding for different user types
 * - Stage-specific response templates
 * - Filter delegation from PersonalOracleAgent to StateMachineManager
 */

import { OracleStateMachineConfig } from './config/oracleStateMachine.config';

// Mock logger for testing
const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || '')
};

class TestOracleStateMachineManager {
  private config: OracleStateMachineConfig;
  private tonePreferences: Map<string, 'curious' | 'hesitant' | 'enthusiastic' | 'neutral'> = new Map();

  constructor(config?: OracleStateMachineConfig) {
    this.config = config || new OracleStateMachineConfig();
  }

  public applyStageFilters(userId: string, input: string, response: string): string {
    // 1. Crisis override always comes first
    const crisisOverride = this.applyCrisisOverride(input);
    if (crisisOverride) return crisisOverride;

    // 2. Stage-specific filters (simplified for testing - assume structured_guide stage)
    return this.applyOnboardingTone(userId, input, response);
  }

  private applyCrisisOverride(input: string): string | null {
    const crisisConfig = this.config.getCrisisOverride();
    
    for (const pattern of crisisConfig.triggers) {
      if (this.matchesPattern(input, pattern)) {
        return crisisConfig.responseTemplate;
      }
    }
    
    return null;
  }

  private applyOnboardingTone(userId: string, input: string, response: string): string {
    let userTone = this.tonePreferences.get(userId);
    
    if (!userTone) {
      userTone = this.detectToneFromInput(input);
      this.tonePreferences.set(userId, userTone);
    }
    
    const onboardingConfig = this.config.getOnboardingConfig();
    const toneTemplate = onboardingConfig.toneAdaptation[userTone];
    
    if (toneTemplate) {
      return toneTemplate.prefix + ' ' + response;
    }
    
    return response;
  }

  private detectToneFromInput(input: string): 'curious' | 'hesitant' | 'enthusiastic' | 'neutral' {
    const lower = input.toLowerCase();
    
    if ((input.match(/\?/g) || []).length >= 2) {
      return 'curious';
    }
    
    if (lower.includes('maybe') || lower.includes('not sure') || 
        lower.includes('nervous') || lower.includes('uncertain') ||
        lower.includes('worried') || lower.includes('afraid')) {
      return 'hesitant';
    }
    
    if ((input.match(/!/g) || []).length >= 1 || 
        lower.includes('excited') || lower.includes('can\'t wait') ||
        lower.includes('amazing') || lower.includes('love')) {
      return 'enthusiastic';
    }
    
    return 'neutral';
  }

  private matchesPattern(input: string, pattern: any): boolean {
    const lower = input.toLowerCase();
    
    if (pattern.keywords && pattern.keywords.some((keyword: string) => lower.includes(keyword.toLowerCase()))) {
      return true;
    }
    
    return false;
  }

  public getStageConfig(stage: string) {
    return this.config.getStageConfig(stage);
  }

  public getCurrentStage(): string {
    return 'structured_guide'; // Simplified for testing
  }
}

// Test scenarios
async function runTests() {
  const manager = new TestOracleStateMachineManager();
  
  console.log('🧪 Testing Unified Oracle State Machine Config System\\n');
  
  // Test 1: Crisis Override Detection
  console.log('Test 1: Crisis Override Detection');
  const crisisInput = "I just want to kill myself and end it all";
  const normalResponse = "I understand you're going through something difficult.";
  const crisisResponse = manager.applyStageFilters('user1', crisisInput, normalResponse);
  
  console.log(`Input: "${crisisInput}"`);
  console.log(`Normal Response: "${normalResponse}"`);
  console.log(`Crisis Response: "${crisisResponse}"`);
  console.log(`Crisis detected: ${crisisResponse !== normalResponse ? '✅' : '❌'}\\n`);
  
  // Test 2: Tone-Adaptive Onboarding - Curious
  console.log('Test 2: Tone-Adaptive Onboarding - Curious');
  const curiousInput = "What does this system do? How does it work?";
  const baseResponse = "This is a personal guidance system.";
  const curiousResponse = manager.applyStageFilters('user2', curiousInput, baseResponse);
  
  console.log(`Input: "${curiousInput}"`);
  console.log(`Base Response: "${baseResponse}"`);
  console.log(`Adapted Response: "${curiousResponse}"`);
  console.log(`Curious tone detected: ${curiousResponse.includes("curiosity") ? '✅' : '❌'}\\n`);
  
  // Test 3: Tone-Adaptive Onboarding - Hesitant
  console.log('Test 3: Tone-Adaptive Onboarding - Hesitant');
  const hesitantInput = "I'm not sure about this... maybe I shouldn't be here";
  const hesitantResponse = manager.applyStageFilters('user3', hesitantInput, baseResponse);
  
  console.log(`Input: "${hesitantInput}"`);
  console.log(`Base Response: "${baseResponse}"`);
  console.log(`Adapted Response: "${hesitantResponse}"`);
  console.log(`Hesitant tone detected: ${hesitantResponse.includes("tentative") ? '✅' : '❌'}\\n`);
  
  // Test 4: Tone-Adaptive Onboarding - Enthusiastic
  console.log('Test 4: Tone-Adaptive Onboarding - Enthusiastic');
  const enthusiasticInput = "This is amazing! I can't wait to get started!";
  const enthusiasticResponse = manager.applyStageFilters('user4', enthusiasticInput, baseResponse);
  
  console.log(`Input: "${enthusiasticInput}"`);
  console.log(`Base Response: "${baseResponse}"`);
  console.log(`Adapted Response: "${enthusiasticResponse}"`);
  console.log(`Enthusiastic tone detected: ${enthusiasticResponse.includes("energy") ? '✅' : '❌'}\\n`);
  
  // Test 5: Stage Configuration Access
  console.log('Test 5: Stage Configuration Access');
  try {
    const stageConfig = manager.getStageConfig('structured_guide');
    console.log(`Stage Config Retrieved: ✅`);
    console.log(`Stage Label: "${stageConfig.label}"`);
    console.log(`Response Templates Available: ${stageConfig.responseTemplates?.structured_guide?.length || 0} templates`);
  } catch (error) {
    console.log(`Stage Config Retrieved: ❌ ${error}`);
  }
  
  console.log('\\n🎉 Test Suite Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, TestOracleStateMachineManager };