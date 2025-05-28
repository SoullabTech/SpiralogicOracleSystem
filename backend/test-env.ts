// test-env.ts
import { config } from 'dotenv';

// Load your .env.test file (if present)
config({ path: '.env.test' });

// Define required keys and fallback
const requiredEnvVars = {
  VITE_OPENAI_API_KEY: 'test-openai-key',
  VITE_ANTHROPIC_API_KEY: 'test-anthropic-key',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-role-key',
};

for (const [key, fallback] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing env var ${key}, using fallback value.`);
    process.env[key] = fallback;
  }
}

// Optional: Log to confirm env loaded
if (process.env.NODE_ENV === 'test') {
  console.log('🧪 Test environment variables loaded.');
}
