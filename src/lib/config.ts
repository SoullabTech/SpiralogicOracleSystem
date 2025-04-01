import { z } from 'zod';

const envSchema = z.object({
  VITE_CLAUDE_API_KEY: z.string().min(1, 'Claude API key is required'),
  VITE_OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    VITE_CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY,
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${parsed.error.errors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  return parsed.data;
}

export const env = validateEnv();