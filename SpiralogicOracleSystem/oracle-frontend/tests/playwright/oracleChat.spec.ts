// tests/playwright/oracleChat.spec.ts

import { seedTestOracle } from '@/lib/seedOracles';
import { expect, test } from '@playwright/test';

// ✅ Ensure Oracle is seeded before tests
test.beforeAll(async () => {
  console.log('🌱 Seeding test oracle...');
  await seedTestOracle();
});

test('oracle chat loads', async ({ page }) => {
  // 🚀 Navigate to Oracle page
  await page.goto('http://localhost:3002/oracle/test-oracle');

  // ⏳ Wait for the Oracle input to appear
  await page.waitForSelector('[data-testid="oracle-input"]', { timeout: 10000 });

  // ✅ Check if heading with oracle name appears
  await expect(page.getByRole('heading', { name: /test-oracle/i })).toBeVisible();

  // ✅ Check if placeholder input is visible
  await expect(page.getByPlaceholder('Ask your Oracle')).toBeVisible();
});
