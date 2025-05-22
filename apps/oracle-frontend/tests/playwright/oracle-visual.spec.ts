// tests/playwright/oracle-visual.spec.ts

import { seedTestOracle } from '@/lib/seedOracles';
import { expect, test } from '@playwright/test';

// ✅ Seed Oracle before visual snapshot test
test.beforeAll(async () => {
  console.log('🌱 Seeding test oracle...');
  await seedTestOracle();
});

test('Oracle Chat visual snapshot', async ({ page }) => {
  // 🚀 Navigate to test oracle page
  await page.goto('http://localhost:3002/oracle/test-oracle');

  // ⏳ Wait for oracle input to appear
  await page.waitForSelector('[data-testid="oracle-input"]', { timeout: 10000 });

  // ✅ Confirm oracle name heading appears
  await expect(page.getByRole('heading', { name: /test-oracle/i })).toBeVisible();

  // ✅ Confirm placeholder input appears
  await expect(page.getByPlaceholder('Ask your Oracle')).toBeVisible();

  // 📸 Take a visual snapshot
  await page.screenshot({ path: 'tests/screenshots/oracle-chat.png', fullPage: true });
});
