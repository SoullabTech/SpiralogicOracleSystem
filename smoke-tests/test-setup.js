// Test setup for Soul Memory Bridge smoke tests
const { expect } = require('@playwright/test');

// Extend Jest's expect with Playwright's matchers
expect.extend({
  async toBeVisible(page, selector) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      return { pass: true };
    } catch (error) {
      return { 
        pass: false, 
        message: () => `Expected ${selector} to be visible, but it wasn't` 
      };
    }
  }
});

// Global test configuration
global.testConfig = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  retries: 2
};

// Console logging for test debugging
global.console = {
  ...console,
  log: (message) => {
    if (process.env.NODE_ENV !== 'test' || process.env.VERBOSE_TESTS) {
      console.log(`[TEST] ${message}`);
    }
  }
};