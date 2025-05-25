// frontend/playwright.global-setup.ts

// ✅ Patch fetch for Node (needed by Supabase client in non-browser env)
import fetch from 'node-fetch';
(globalThis as any).fetch = fetch;

// ✅ Load environment variables from .env.test
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// ✅ Patch import.meta.env to simulate Vite-style access
(globalThis as any).import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  },
};

// ✅ Oracle seed function
import { seedTestOracle } from './src/lib/seedOracles';

// ✅ Wait for Vite dev server to become available before seeding
async function waitForServerReady(url: string, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      // Ignore connection errors until timeout
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('❌ Frontend did not start in time.');
}

// ✅ Global setup function for Playwright
const globalSetup = async () => {
  console.log('🌱 Waiting for frontend at http://localhost:3002...');
  await waitForServerReady('http://localhost:3002');

  console.log('🌱 Seeding test oracle...');
  await seedTestOracle();
};

export default globalSetup;
