#!/usr/bin/env ts-node
/**
 * System Health Check - Comprehensive Maya System Validation
 * Tests all conversational intelligence components
 */

import { MayaOrchestrator } from '../lib/backend/MayaOrchestrator';
import { conversationChecklist } from '../lib/oracle/ConversationChecklist';
import { conversationAnalyzer } from '../lib/oracle/ConversationAnalyzer';
import { activeListening } from '../lib/oracle/ActiveListeningCore';

interface HealthCheckResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class SystemHealthChecker {
  private results: HealthCheckResult[] = [];

  async runQuickHealthCheck(): Promise<void> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Quick tests - just core functionality
    await this.testEnvironment();
    await this.testActiveListening();
    await this.testConversationChecklist();

    // Display quick results
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const total = this.results.length;
    const quickHealth = (passed / total) * 100;

    console.log(`\n⚡ Quick Health: ${quickHealth.toFixed(0)}% (${passed}/${total} core tests passing)`);

    if (quickHealth >= 80) {
      console.log('🟢 Status: READY FOR DEVELOPMENT');
    } else {
      console.log('🔴 Status: ISSUES DETECTED - Run full health check');
    }
  }

  async runFullHealthCheck(): Promise<void> {
    console.log('\n🏥 MAYA SYSTEM HEALTH CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Test all components
    await this.testEnvironment();
    await this.testActiveListening();
    await this.testConversationChecklist();
    await this.testConversationAnalyzer();
    await this.testMayaOrchestrator();
    await this.testIntegration();

    // Display results
    this.displayResults();
    this.displayRecommendations();
  }

  private async testEnvironment(): Promise<void> {
    console.log('\n🔍 Testing Environment...');

    try {
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

      if (majorVersion >= 18) {
        this.addResult('Environment', 'PASS', `Node.js ${nodeVersion} ✓`);
      } else {
        this.addResult('Environment', 'WARN', `Node.js ${nodeVersion} (recommend 18+)`);
      }

      // Check environment variables
      const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
      if (hasAnthropicKey) {
        this.addResult('API Keys', 'PASS', 'Anthropic API key configured ✓');
      } else {
        this.addResult('API Keys', 'WARN', 'Anthropic API key not found (needed for full Maya responses)');
      }

    } catch (error) {
      this.addResult('Environment', 'FAIL', `Environment check failed: ${error.message}`);
    }
  }

  private async testActiveListening(): Promise<void> {
    console.log('🎧 Testing Active Listening Core...');

    try {
      // Test basic listening response
      const testInput = "I feel stuck in my job";
      const response = activeListening.listen(testInput);

      if (response && response.response) {
        this.addResult('Active Listening', 'PASS', `Generated response: "${response.response}"`);
      } else {
        this.addResult('Active Listening', 'FAIL', 'No response generated');
      }

      // Test emotional attunement
      const emotionalInput = "I'm feeling overwhelmed lately";
      const emotionalResponse = activeListening.listen(emotionalInput);

      if (emotionalResponse.technique.element === 'water') {
        this.addResult('Emotional Attunement', 'PASS', 'Correctly detected emotional content');
      } else {
        this.addResult('Emotional Attunement', 'WARN', `Expected water element, got ${emotionalResponse.technique.element}`);
      }

      // Test summarization
      const summary = activeListening.summarize(['I feel stuck', 'Everything seems impossible', 'I need help']);
      if (summary && summary.length > 0) {
        this.addResult('Summarization', 'PASS', `Summary: "${summary}"`);
      } else {
        this.addResult('Summarization', 'FAIL', 'Summarization failed');
      }

    } catch (error) {
      this.addResult('Active Listening', 'FAIL', `Active Listening test failed: ${error.message}`);
    }
  }

  private async testConversationChecklist(): Promise<void> {
    console.log('📋 Testing Conversation Checklist...');

    try {
      // Test checklist evaluation
      const userMessage = "I feel lost and don't know what to do";
      const mayaResponse = "Feeling lost... What's that like for you?";

      const results = conversationChecklist.evaluateExchange(userMessage, mayaResponse);
      const quality = conversationChecklist.calculateQualityScore(results);

      if (results && results.length > 0) {
        this.addResult('Checklist Evaluation', 'PASS', `Evaluated ${results.length} conversation markers`);
      } else {
        this.addResult('Checklist Evaluation', 'FAIL', 'No checklist results generated');
      }

      if (quality && typeof quality.overall === 'number') {
        this.addResult('Quality Scoring', 'PASS', `Quality score: ${(quality.overall * 100).toFixed(0)}%`);
      } else {
        this.addResult('Quality Scoring', 'FAIL', 'Quality scoring failed');
      }

    } catch (error) {
      this.addResult('Conversation Checklist', 'FAIL', `Checklist test failed: ${error.message}`);
    }
  }

  private async testConversationAnalyzer(): Promise<void> {
    console.log('🔬 Testing Conversation Analyzer...');

    try {
      // Test analyzer functionality
      const userMessage = "I'm struggling with making decisions";
      const mayaResponse = "What feels most challenging about making decisions right now?";

      const analysis = conversationAnalyzer.analyze(userMessage, mayaResponse);

      if (analysis && typeof analysis.overall === 'number') {
        this.addResult('Conversation Analysis', 'PASS', `Analysis score: ${(analysis.overall * 100).toFixed(0)}%`);
      } else {
        this.addResult('Conversation Analysis', 'FAIL', 'Analysis failed to generate score');
      }

      // Test history tracking
      const history = conversationAnalyzer.getHistory();
      if (history && history.length > 0) {
        this.addResult('History Tracking', 'PASS', `Tracking ${history.length} conversation turn(s)`);
      } else {
        this.addResult('History Tracking', 'WARN', 'No conversation history found');
      }

      // Test export functionality
      try {
        conversationAnalyzer.exportToFile('test-export.json');
        this.addResult('Export Functionality', 'PASS', 'Export test completed');
      } catch (error) {
        this.addResult('Export Functionality', 'FAIL', `Export failed: ${error.message}`);
      }

    } catch (error) {
      this.addResult('Conversation Analyzer', 'FAIL', `Analyzer test failed: ${error.message}`);
    }
  }

  private async testMayaOrchestrator(): Promise<void> {
    console.log('🌸 Testing Maya Orchestrator...');

    try {
      const maya = new MayaOrchestrator();

      // Test basic response generation
      const testInput = "Hello Maya";
      const response = await maya.speak(testInput, 'health-check-user');

      if (response && response.message) {
        this.addResult('Maya Response', 'PASS', `Generated: "${response.message.slice(0, 50)}..."`);

        // Check response characteristics
        if (response.element) {
          this.addResult('Elemental Response', 'PASS', `Element: ${response.element}`);
        } else {
          this.addResult('Elemental Response', 'WARN', 'No elemental classification');
        }

      } else {
        this.addResult('Maya Response', 'FAIL', 'No response generated');
      }

    } catch (error) {
      this.addResult('Maya Orchestrator', 'FAIL', `Orchestrator test failed: ${error.message}`);
    }
  }

  private async testIntegration(): Promise<void> {
    console.log('🔗 Testing System Integration...');

    try {
      // Test full pipeline: input -> Maya -> analysis
      const maya = new MayaOrchestrator();
      const testInput = "I'm feeling anxious about my future";

      // Clear previous history
      conversationAnalyzer.clearHistory();

      // Get Maya response
      const response = await maya.speak(testInput, 'integration-test');

      if (response && response.message) {
        // The analyzer should have been called automatically in development mode
        const history = conversationAnalyzer.getHistory();

        if (history.length > 0) {
          this.addResult('Full Integration', 'PASS', 'Complete pipeline working: Input -> Maya -> Analysis');
        } else {
          this.addResult('Full Integration', 'WARN', 'Pipeline partial: Maya responds but analysis not auto-triggered');
        }
      } else {
        this.addResult('Full Integration', 'FAIL', 'Integration pipeline broken');
      }

    } catch (error) {
      this.addResult('System Integration', 'FAIL', `Integration test failed: ${error.message}`);
    }
  }

  private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any): void {
    this.results.push({ component, status, message, details });

    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'WARN': '⚠️'
    }[status];

    console.log(`  ${statusIcon} ${component}: ${message}`);
  }

  private displayResults(): void {
    console.log('\n📊 HEALTH CHECK SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);

    const healthScore = (passed / total) * 100;
    console.log(`\n🏥 System Health: ${healthScore.toFixed(0)}%`);

    if (healthScore >= 80) {
      console.log('🟢 System Status: HEALTHY');
    } else if (healthScore >= 60) {
      console.log('🟡 System Status: NEEDS ATTENTION');
    } else {
      console.log('🔴 System Status: CRITICAL');
    }
  }

  private displayRecommendations(): void {
    const failures = this.results.filter(r => r.status === 'FAIL');
    const warnings = this.results.filter(r => r.status === 'WARN');

    if (failures.length > 0 || warnings.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      failures.forEach(failure => {
        console.log(`🔧 Fix: ${failure.component} - ${failure.message}`);
      });

      warnings.forEach(warning => {
        console.log(`⚡ Improve: ${warning.component} - ${warning.message}`);
      });
    }

    console.log('\n📚 Next Steps:');
    console.log('  • Run: npm run test:convo:batch - Test conversational intelligence');
    console.log('  • Run: npm run test:convo:interactive - Interactive testing');
    console.log('  • Check: logs for detailed error messages');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const checker = new SystemHealthChecker();

  if (args.includes('--quick') || args.includes('-q')) {
    console.log('🏥 Quick Health Check - Basic functionality only');
    await checker.runQuickHealthCheck();
    return;
  }

  await checker.runFullHealthCheck();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Health check complete! 🎯');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

export { SystemHealthChecker };