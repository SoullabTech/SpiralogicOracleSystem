# Test info

- Name: Oracle Chat visual snapshot
- Location: /Users/andreanezat/Projects/Spiralogic/oracle-frontend/tests/playwright/oracle-visual.spec.ts:12:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="oracle-input"]') to be visible

    at /Users/andreanezat/Projects/Spiralogic/oracle-frontend/tests/playwright/oracle-visual.spec.ts:17:14
```

# Test source

```ts
   1 | // tests/playwright/oracle-visual.spec.ts
   2 |
   3 | import { seedTestOracle } from '@/lib/seedOracles';
   4 | import { expect, test } from '@playwright/test';
   5 |
   6 | // ✅ Seed Oracle before visual snapshot test
   7 | test.beforeAll(async () => {
   8 |   console.log('🌱 Seeding test oracle...');
   9 |   await seedTestOracle();
  10 | });
  11 |
  12 | test('Oracle Chat visual snapshot', async ({ page }) => {
  13 |   // 🚀 Navigate to test oracle page
  14 |   await page.goto('http://localhost:3002/oracle/test-oracle');
  15 |
  16 |   // ⏳ Wait for oracle input to appear
> 17 |   await page.waitForSelector('[data-testid="oracle-input"]', { timeout: 10000 });
     |              ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  18 |
  19 |   // ✅ Confirm oracle name heading appears
  20 |   await expect(page.getByRole('heading', { name: /test-oracle/i })).toBeVisible();
  21 |
  22 |   // ✅ Confirm placeholder input appears
  23 |   await expect(page.getByPlaceholder('Ask your Oracle')).toBeVisible();
  24 |
  25 |   // 📸 Take a visual snapshot
  26 |   await page.screenshot({ path: 'tests/screenshots/oracle-chat.png', fullPage: true });
  27 | });
  28 |
```