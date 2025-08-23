#!/usr/bin/env node

// Debug environment variables loading
import dotenv from 'dotenv';

// Load from your env file
dotenv.config({ path: 'env/.env.local' });

console.log('🔍 Environment Debug:');
console.log('');

// Core API URLs
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('');

// Supabase (show first/last chars for security)
const maskKey = (key) => {
  if (!key) return 'NOT_SET';
  if (key.includes('...') || key.includes('YOUR-')) return 'PLACEHOLDER';
  return key.slice(0, 8) + '...' + key.slice(-8);
};

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', maskKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
console.log('Service Role Key:', maskKey(process.env.SUPABASE_SERVICE_ROLE_KEY));
console.log('');

// Redis & DB
console.log('Redis URL:', process.env.REDIS_URL);
console.log('DB Path:', process.env.SOUL_MEMORY_DB_PATH);
console.log('MongoDB:', process.env.MONGODB_URI || 'NOT_SET');
console.log('');

// Providers
console.log('OpenAI Key:', maskKey(process.env.OPENAI_API_KEY));
console.log('ElevenLabs Key:', maskKey(process.env.ELEVENLABS_API_KEY));
console.log('');

// Observability
console.log('Metrics Path:', process.env.METRICS_PATH);
console.log('PII Redaction:', process.env.ENABLE_PII_REDACTION);
console.log('');

// Check for common issues
const issues = [];
if (!process.env.NEXT_PUBLIC_API_BASE_URL) issues.push('NEXT_PUBLIC_API_BASE_URL missing');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) issues.push('NEXT_PUBLIC_SUPABASE_URL missing');
if (!process.env.OPENAI_API_KEY) issues.push('OPENAI_API_KEY missing');
if (process.env.OPENAI_API_KEY?.includes('...')) issues.push('OPENAI_API_KEY is placeholder');

if (issues.length > 0) {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  process.exit(1);
} else {
  console.log('✅ Environment looks good!');
}