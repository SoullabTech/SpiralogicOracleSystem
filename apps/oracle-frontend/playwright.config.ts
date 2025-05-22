// playwright.config.ts

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// — Force test mode so seedTestOracle.ts picks up service_role key —
process.env.NODE_ENV = 'test';

// — Load your .env.test into process.env —
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  workers: 1,

  // — Run your globalSetup (where you should call seedTestOracle.ts) —
  globalSetup: require.resolve('./playwright.global-setup.ts'),

  use: {
    // your app under test
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on',

    // expose all your env vars to the test processes
    env: {
      NODE_ENV: process.env.NODE_ENV!,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
  },

  webServer: {
    command: 'pnpm dev',
    port: 3002,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      NODE_ENV: process.env.NODE_ENV!,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
  },
});
