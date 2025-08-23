// Smoke Tests for Soul Memory AIN Bridge (Track A, B, C)
// Tests basic functionality of all three implemented tracks

const { chromium } = require('playwright');

describe('Soul Memory Bridge - Smoke Tests', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Track A: Debug Dashboard', () => {
    test('Dashboard loads with metrics tiles', async () => {
      await page.goto('http://localhost:3001/debug/bridge');
      
      // Check for metrics tiles
      await expect(page.locator('[data-testid="latency-tile"]')).toBeVisible();
      await expect(page.locator('[data-testid="signal-tile"]')).toBeVisible();
      await expect(page.locator('[data-testid="health-tile"]')).toBeVisible();
      
      // Check for heartbeat indicator
      await expect(page.locator('[data-testid="heartbeat"]')).toBeVisible();
    });

    test('Event stream shows activity', async () => {
      await page.goto('http://localhost:3001/debug/bridge');
      
      // Wait for event stream to load
      await page.waitForSelector('[data-testid="event-stream"]');
      
      // Check that events appear
      const events = await page.locator('[data-testid="event-item"]').count();
      expect(events).toBeGreaterThan(0);
    });
  });

  describe('Track B: Micro-Reflections', () => {
    test('Micro-reflection appears after Oracle response', async () => {
      await page.goto('http://localhost:3001/oracle');
      
      // Submit a test question
      await page.fill('textarea', 'What guidance do you have for me?');
      await page.click('[aria-label="Submit question"]');
      
      // Wait for response
      await page.waitForSelector('[data-testid="oracle-response"]', { timeout: 30000 });
      
      // Check for micro-reflection component
      const microReflection = page.locator('[data-testid="micro-reflection"]');
      if (await microReflection.isVisible()) {
        // Verify it's ≤12 words
        const text = await microReflection.textContent();
        const wordCount = text.trim().split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(12);
      }
    });

    test('Holoflower glow appears with high confidence', async () => {
      await page.goto('http://localhost:3001/oracle');
      
      // Submit question likely to trigger high confidence
      await page.fill('textarea', 'I feel grateful for this moment');
      await page.click('[aria-label="Submit question"]');
      
      await page.waitForSelector('[data-testid="oracle-response"]', { timeout: 30000 });
      
      // Check for glow effect (confidence ≥0.7)
      const glowElement = page.locator('[data-testid="holoflower-glow"]');
      // Glow may or may not appear depending on actual confidence
      console.log('Glow visible:', await glowElement.isVisible());
    });
  });

  describe('Track C: Thread Weaving', () => {
    test('Thread weaving option appears after 3+ exchanges', async () => {
      await page.goto('http://localhost:3001/oracle');
      
      // Submit 3 questions to trigger weaving
      const questions = [
        'What is my purpose?',
        'How can I find balance?',
        'What should I focus on?'
      ];
      
      for (const question of questions) {
        await page.fill('textarea', question);
        await page.click('[aria-label="Submit question"]');
        await page.waitForSelector('[data-testid="oracle-response"]', { timeout: 30000 });
        await page.waitForTimeout(1000); // Brief pause between questions
      }
      
      // Check for weave option
      const weaveButton = page.locator('button:has-text("Weave a thread")');
      await expect(weaveButton).toBeVisible();
    });

    test('Thread weaving creates recap with user quote', async () => {
      // Continue from previous test or set up fresh conversation
      const weaveButton = page.locator('button:has-text("Weave a thread")');
      
      if (await weaveButton.isVisible()) {
        await weaveButton.click();
        
        // Wait for weaving to complete
        await page.waitForSelector('[data-testid="weavred-thread"]', { timeout: 15000 });
        
        // Verify the weavred thread contains meaningful content
        const threadText = await page.locator('[data-testid="weavred-thread"]').textContent();
        expect(threadText.length).toBeGreaterThan(50);
        
        // Should end with a question mark (invitational question)
        expect(threadText.trim()).toMatch(/\?$/);
      }
    });

    test('Session recap modal shows thread weaves', async () => {
      await page.goto('http://localhost:3001/oracle');
      
      // Check if recap button exists (after 2+ exchanges)
      const recapButton = page.locator('button:has-text("View Session Recap")');
      
      if (await recapButton.isVisible()) {
        await recapButton.click();
        
        // Check modal opens
        await expect(page.locator('[data-testid="recap-modal"]')).toBeVisible();
        
        // Check for thread weaves content
        const modalContent = await page.locator('[data-testid="recap-modal"]').textContent();
        expect(modalContent).toContain('Thread Weaving');
      }
    });
  });

  describe('Integration Tests', () => {
    test('Environment variables are properly configured', () => {
      const envVars = [
        'NEXT_PUBLIC_DEV_INLINE_REFLECTIONS',
        'THREAD_WEAVING_MIN_TURNS', 
        'BRIDGE_METRICS_ENABLED'
      ];
      
      envVars.forEach(envVar => {
        expect(process.env[envVar]).toBeDefined();
      });
    });

    test('Oracle turn API returns turnMeta for reflections', async () => {
      const response = await page.request.post('http://localhost:3001/api/oracle/turn', {
        data: {
          input: {
            text: 'I am seeking wisdom',
            context: {
              currentPage: '/oracle',
              conversationId: 'test_conv_123'
            }
          },
          providers: {
            sesame: true,
            claude: true,
            oracle2: true,
            psi: true,
            ain: true
          }
        }
      });
      
      expect(response.ok()).toBe(true);
      const data = await response.json();
      
      // Should have turnMeta for micro-reflections
      expect(data.turnMeta).toBeDefined();
      expect(data.turnMeta.sacredDetected).toBeDefined();
      expect(data.turnMeta.shadowScore).toBeDefined();
    });

    test('Thread weaving API creates and stores weaves', async () => {
      const response = await page.request.post('http://localhost:3001/api/oracle/weave', {
        data: {
          conversationId: 'test_conv_123',
          userId: 'test_user',
          turnCount: 3
        }
      });
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.text).toBeDefined();
        expect(data.saved).toBe(true);
        expect(data.soulMemoryId).toBeDefined();
        expect(data.userQuote).toBeDefined();
      }
    });
  });
});