#!/usr/bin/env ts-node
/**
 * Pre-Beta Automated Check
 * Runs critical tests before beta sessions
 */

import { SystemHealthChecker } from './systemHealthCheck';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

class PreBetaChecker {
  private results: TestResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('\n🚀 MAIA PRE-BETA VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await this.checkSystemHealth();
    await this.checkProductionHealth();
    await this.checkCriticalComponents();
    await this.checkEnvironmentConfig();

    this.displayResults();
    this.displayRecommendations();

    const allCriticalPassed = this.results
      .filter(r => r.critical)
      .every(r => r.passed);

    if (!allCriticalPassed) {
      console.log('\n❌ CRITICAL ISSUES FOUND - DO NOT LAUNCH BETA');
      process.exit(1);
    } else {
      console.log('\n✅ ALL CRITICAL CHECKS PASSED - READY FOR BETA');
    }
  }

  private async checkSystemHealth(): Promise<void> {
    console.log('🏥 Running System Health Check...\n');

    try {
      const checker = new SystemHealthChecker();
      await checker.runQuickHealthCheck();

      this.addResult(
        'System Health',
        true,
        'Core systems operational',
        true
      );
    } catch (error) {
      this.addResult(
        'System Health',
        false,
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      );
    }
  }

  private async checkProductionHealth(): Promise<void> {
    console.log('\n🌐 Checking Production Health Endpoint...\n');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soullab.life';
      const response = await fetch(`${baseUrl}/api/health/maia`);

      if (response.ok) {
        const data = await response.json();

        if (data.status === 'healthy') {
          this.addResult(
            'Production Health',
            true,
            'All production components healthy',
            true
          );
        } else {
          const degradedComponents = data.components
            .filter((c: any) => c.status !== 'healthy')
            .map((c: any) => c.component);

          this.addResult(
            'Production Health',
            false,
            `Degraded components: ${degradedComponents.join(', ')}`,
            true
          );
        }
      } else {
        this.addResult(
          'Production Health',
          false,
          `Health endpoint returned ${response.status}`,
          true
        );
      }
    } catch (error) {
      this.addResult(
        'Production Health',
        false,
        `Cannot reach production: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      );
    }
  }

  private async checkCriticalComponents(): Promise<void> {
    console.log('\n🔍 Checking Critical Components...\n');

    await this.checkMycelialNetwork();
    await this.checkVoiceSystem();
    await this.checkFAQPage();
  }

  private async checkMycelialNetwork(): Promise<void> {
    try {
      const { MycelialNetwork } = await import('../lib/oracle/field/MycelialNetwork');
      const network = new MycelialNetwork();

      const hasMethod = typeof network.accessCollectiveWisdom === 'function';

      this.addResult(
        'Mycelial Network',
        hasMethod,
        hasMethod ? 'accessCollectiveWisdom method present' : 'Missing accessCollectiveWisdom method',
        true
      );
    } catch (error) {
      this.addResult(
        'Mycelial Network',
        false,
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      );
    }
  }

  private async checkVoiceSystem(): Promise<void> {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;

    this.addResult(
      'Voice System',
      hasOpenAI || hasElevenLabs,
      `TTS providers: OpenAI=${hasOpenAI}, ElevenLabs=${hasElevenLabs}`,
      true
    );
  }

  private async checkFAQPage(): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const faqPath = path.join(process.cwd(), 'components/beta/SoulfulOnboarding.tsx');
      const faqExists = fs.existsSync(faqPath);

      if (faqExists) {
        const content = fs.readFileSync(faqPath, 'utf-8');
        const hasFAQStep = content.includes("case 'faq':");

        this.addResult(
          'FAQ Page',
          hasFAQStep,
          hasFAQStep ? 'FAQ step present in onboarding' : 'FAQ step missing',
          false
        );
      } else {
        this.addResult(
          'FAQ Page',
          false,
          'SoulfulOnboarding component not found',
          false
        );
      }
    } catch (error) {
      this.addResult(
        'FAQ Page',
        false,
        `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false
      );
    }
  }

  private async checkEnvironmentConfig(): Promise<void> {
    console.log('\n⚙️  Checking Environment Configuration...\n');

    const requiredVars = [
      { name: 'ANTHROPIC_API_KEY', critical: true },
      { name: 'OPENAI_API_KEY', critical: false },
      { name: 'ELEVENLABS_API_KEY', critical: false },
      { name: 'NEXT_PUBLIC_SUPABASE_URL', critical: true },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', critical: true }
    ];

    for (const varConfig of requiredVars) {
      const isSet = !!process.env[varConfig.name];
      this.addResult(
        `ENV: ${varConfig.name}`,
        isSet,
        isSet ? 'Configured' : 'Not configured',
        varConfig.critical
      );
    }
  }

  private addResult(name: string, passed: boolean, message: string, critical: boolean): void {
    this.results.push({ name, passed, message, critical });

    const icon = passed ? '✅' : (critical ? '❌' : '⚠️');
    const tag = critical ? ' [CRITICAL]' : '';
    console.log(`  ${icon} ${name}${tag}: ${message}`);
  }

  private displayResults(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const critical = this.results.filter(r => r.critical).length;
    const criticalPassed = this.results.filter(r => r.critical && r.passed).length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}/${total} (${Math.round(passed / total * 100)}%)`);
    console.log(`🔴 Critical Tests: ${criticalPassed}/${critical}`);

    const failedCritical = this.results.filter(r => r.critical && !r.passed);
    if (failedCritical.length > 0) {
      console.log(`\n⚠️  Failed Critical Tests: ${failedCritical.length}`);
    }
  }

  private displayRecommendations(): void {
    const failures = this.results.filter(r => !r.passed);

    if (failures.length === 0) {
      return;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 ACTION ITEMS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const criticalFailures = failures.filter(f => f.critical);
    const warnings = failures.filter(f => !f.critical);

    if (criticalFailures.length > 0) {
      console.log('🔧 CRITICAL FIXES REQUIRED:\n');
      criticalFailures.forEach(f => {
        console.log(`   • ${f.name}: ${f.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚡ RECOMMENDED IMPROVEMENTS:\n');
      warnings.forEach(w => {
        console.log(`   • ${w.name}: ${w.message}`);
      });
    }

    console.log('\n📚 NEXT STEPS:');
    console.log('   • Review docs/PRE_BETA_TESTING.md for detailed testing guide');
    console.log('   • Run: npm run health - for full system diagnostics');
    console.log('   • Check: Vercel logs for production errors');
    console.log('   • Test: Manual voice conversation before launch');
  }
}

// CLI
async function main() {
  const checker = new PreBetaChecker();
  await checker.runAllChecks();
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Pre-beta check failed:', error);
    process.exit(1);
  });
}

export { PreBetaChecker };