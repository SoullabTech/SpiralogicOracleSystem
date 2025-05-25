// src/test/playwright/setup.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // ✅ Load before supabase import

import { seedTestOracle } from '@/lib/seedOracles';

const globalSetup = async () => {
  console.log('🌱 Seeding test oracle...');
  await seedTestOracle();
};

export default globalSetup;
