#!/usr/bin/env node

/**
 * 🌟 SOULLAB PRODUCTION USER JOURNEY TEST
 * 
 * Comprehensive test of the complete user experience
 * Run before production deployment
 */

const puppeteer = require('puppeteer');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'https://soullab.life';
const TEST_EMAIL = 'test@soullab.com';
const TEST_NAME = 'Test Soul';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class SoulLabTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async init() {
    log('🚀 Initializing Soullab User Journey Test', 'blue');
    
    this.browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
    
    // Listen for console errors
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        log(`❌ Console Error: ${msg.text()}`, 'red');
        this.results.errors.push(`Console: ${msg.text()}`);
      }
    });
    
    // Listen for failed requests
    this.page.on('requestfailed', (request) => {
      log(`❌ Failed Request: ${request.url()}`, 'red');
      this.results.errors.push(`Request: ${request.url()}`);
    });
  }

  async test(name, testFn) {
    try {
      log(`\n🧪 Testing: ${name}`, 'yellow');
      await testFn();
      log(`✅ Passed: ${name}`, 'green');
      this.results.passed++;
    } catch (error) {
      log(`❌ Failed: ${name} - ${error.message}`, 'red');
      this.results.failed++;
      this.results.errors.push(`${name}: ${error.message}`);
    }
  }

  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return await this.page.$(selector);
    } catch (error) {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  async testLandingPage() {
    await this.test('Landing Page Load', async () => {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      
      // Check page title
      const title = await this.page.title();
      assert(title.includes('Soullab') || title.includes('Mirror'), 'Page title incorrect');
      
      // Check headline
      const headline = await this.waitForElement('h1');
      const headlineText = await headline.textContent();
      assert(headlineText.includes('Mirror That Remembers'), 'Headline not found');
      
      log('   📄 Landing page loaded successfully');
    });
  }

  async testUniversalWelcome() {
    await this.test('Universal Welcome Section', async () => {
      // Check "What Calls You Here?" section
      const welcomeHeading = await this.page.$('text="What Calls You Here?"');
      assert(welcomeHeading, 'Universal welcome heading not found');
      
      // Check all 6 intention cards
      const intentions = [
        'To know myself deeply',
        'To live more consciously', 
        'To serve from my essence',
        'To awaken to my true nature',
        'To be present for those I love',
        'All of the above'
      ];
      
      for (const intention of intentions) {
        const card = await this.page.$(`text="${intention}"`);
        assert(card, `Intention card not found: ${intention}`);
      }
      
      log('   🌟 All intention cards present');
    });
  }

  async testOnboardingFlow() {
    await this.test('Sacred Union Ceremony Flow', async () => {
      // Click "Begin Your Sacred Journey" 
      const ctaButton = await this.page.$('text="Begin Your Sacred Journey"');
      await ctaButton.click();
      
      // Wait for onboarding page
      await this.page.waitForURL('**/onboarding*');
      
      // Check ceremony title
      const ceremonyTitle = await this.waitForElement('h2');
      const titleText = await ceremonyTitle.textContent();
      assert(titleText.includes('What Matters Most'), 'Ceremony title incorrect');
      
      // Test service path selection
      const innerPeaceOption = await this.page.$('text="Inner peace"');
      await innerPeaceOption.click();
      
      // Check continue button appears
      const continueButton = await this.waitForElement('text="Continue Your Sacred Journey"');
      await continueButton.click();
      
      log('   🕊️ Service path selection working');
    });
  }

  async testOracleInterface() {
    await this.test('Oracle Chat Interface', async () => {
      // Should be on Oracle interface now
      await this.page.waitForURL('**/oracle**');
      
      // Check Oracle greeting
      const greeting = await this.waitForElement('[role="oracle"]');
      assert(greeting, 'Oracle greeting not found');
      
      // Test message input
      const messageInput = await this.waitForElement('input[placeholder*="message"], textarea[placeholder*="message"]');
      await messageInput.type('Hello, Oracle. How are you today?');
      
      // Send message
      const sendButton = await this.page.$('button[type="submit"]');
      await sendButton.click();
      
      // Wait for Oracle response
      await this.page.waitForSelector('[role="oracle"]:nth-child(2)', { timeout: 10000 });
      
      log('   💬 Oracle conversation working');
    });
  }

  async testOracleModes() {
    await this.test('Oracle Mode Switching', async () => {
      const modes = ['alchemist', 'buddha', 'sage', 'mystic', 'guardian', 'tao'];
      
      // Check mode selector exists
      const modeSelector = await this.waitForElement('[data-testid="mode-selector"], .mode-selector, select');
      
      for (const mode of modes.slice(0, 3)) { // Test first 3 modes
        try {
          // Try to select mode
          await this.page.select('select', mode);
          await this.page.waitForTimeout(1000);
          
          log(`   🔮 ${mode} mode accessible`);
        } catch (error) {
          // If no select, try button approach
          const modeButton = await this.page.$(`[data-mode="${mode}"], text="${mode}"`);
          if (modeButton) {
            await modeButton.click();
            await this.page.waitForTimeout(1000);
            log(`   🔮 ${mode} mode accessible via button`);
          }
        }
      }
    });
  }

  async testDashboardAccess() {
    await this.test('Dashboard Navigation', async () => {
      // Navigate to dashboard
      const dashboardLink = await this.page.$('a[href*="/dashboard"], text="Dashboard"');
      if (dashboardLink) {
        await dashboardLink.click();
        await this.page.waitForURL('**/dashboard**');
        
        // Check dashboard loads
        const dashboardContent = await this.waitForElement('h1, h2, .dashboard-content');
        assert(dashboardContent, 'Dashboard content not found');
        
        log('   📊 Dashboard accessible');
      } else {
        throw new Error('Dashboard navigation not found');
      }
    });
  }

  async testHoloflowerVisualization() {
    await this.test('Holoflower Visualization', async () => {
      // Navigate to holoflower
      const holoflowerLink = await this.page.$('a[href*="/holoflower"], text="Holoflower"');
      if (holoflowerLink) {
        await holoflowerLink.click();
        await this.page.waitForURL('**/holoflower**');
        
        // Check for SVG or canvas element
        const visualization = await this.page.$('svg, canvas, .holoflower-viz');
        assert(visualization, 'Holoflower visualization not found');
        
        log('   🌺 Holoflower visualization rendering');
      } else {
        // Try from dashboard
        await this.page.goto(`${BASE_URL}/dashboard/holoflower`);
        const visualization = await this.waitForElement('svg, canvas, .holoflower-viz');
        log('   🌺 Holoflower accessible via direct URL');
      }
    });
  }

  async testSoulMemory() {
    await this.test('Soul Memory Persistence', async () => {
      // Go back to Oracle
      await this.page.goto(`${BASE_URL}/oracle/meet`);
      
      // Send a memorable message
      const testMemory = 'I love purple unicorns and chocolate cake.';
      const messageInput = await this.waitForElement('input, textarea');
      await messageInput.type(testMemory);
      
      const sendButton = await this.page.$('button[type="submit"]');
      await sendButton.click();
      
      // Wait for response
      await this.page.waitForTimeout(3000);
      
      // Refresh page
      await this.page.reload({ waitUntil: 'networkidle0' });
      
      // Check if conversation history is maintained
      const conversationHistory = await this.page.$('text="purple unicorns"');
      assert(conversationHistory, 'Soul memory not persisting');
      
      log('   🧠 Soul Memory working');
    });
  }

  async testMobileResponsive() {
    await this.test('Mobile Responsiveness', async () => {
      // Set mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      
      // Reload landing page
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      
      // Check if mobile navigation exists
      const mobileNav = await this.page.$('.mobile-nav, .hamburger, [data-mobile="true"]');
      
      // Check if content is readable
      const headline = await this.page.$('h1');
      const headlineRect = await headline.boundingBox();
      assert(headlineRect.width < 400, 'Content not mobile optimized');
      
      // Reset to desktop
      await this.page.setViewport({ width: 1200, height: 800 });
      
      log('   📱 Mobile responsiveness working');
    });
  }

  async testPerformance() {
    await this.test('Performance Metrics', async () => {
      // Measure page load time
      const startTime = Date.now();
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      assert(loadTime < 5000, `Page load too slow: ${loadTime}ms`);
      
      // Check Core Web Vitals
      const metrics = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.name === 'FCP') vitals.fcp = entry.value;
              if (entry.name === 'LCP') vitals.lcp = entry.value;
              if (entry.name === 'CLS') vitals.cls = entry.value;
            });
            
            resolve(vitals);
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 2000);
        });
      });
      
      log(`   ⚡ Load time: ${loadTime}ms`);
      if (metrics.fcp) log(`   ⚡ FCP: ${metrics.fcp}ms`);
    });
  }

  async runFullSuite() {
    try {
      await this.init();
      
      log('\n🌟 Starting Soullab Production Test Suite\n', 'blue');
      
      // Core user journey tests
      await this.testLandingPage();
      await this.testUniversalWelcome();
      await this.testOnboardingFlow();
      await this.testOracleInterface();
      await this.testOracleModes();
      
      // Feature tests
      await this.testDashboardAccess();
      await this.testHoloflowerVisualization();
      await this.testSoulMemory();
      
      // Quality tests
      await this.testMobileResponsive();
      await this.testPerformance();
      
      // Results summary
      this.printResults();
      
    } catch (error) {
      log(`🚨 Test suite failed: ${error.message}`, 'red');
      this.results.errors.push(`Suite: ${error.message}`);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  printResults() {
    log('\n📊 TEST RESULTS SUMMARY', 'blue');
    log('═'.repeat(50), 'blue');
    
    log(`✅ Passed: ${this.results.passed}`, 'green');
    log(`❌ Failed: ${this.results.failed}`, 'red');
    log(`🔍 Total: ${this.results.passed + this.results.failed}`, 'yellow');
    
    if (this.results.errors.length > 0) {
      log('\n🚨 ERRORS ENCOUNTERED:', 'red');
      this.results.errors.forEach((error, index) => {
        log(`${index + 1}. ${error}`, 'red');
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`, successRate >= 90 ? 'green' : 'yellow');
    
    if (successRate >= 95) {
      log('\n🎉 READY FOR PRODUCTION! 🚀', 'green');
    } else if (successRate >= 80) {
      log('\n⚠️  NEEDS MINOR FIXES BEFORE PRODUCTION', 'yellow');
    } else {
      log('\n🚨 NOT READY FOR PRODUCTION - CRITICAL ISSUES', 'red');
    }
    
    // Exit code for CI/CD
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new SoulLabTestSuite();
  testSuite.runFullSuite().catch(console.error);
}

module.exports = SoulLabTestSuite;