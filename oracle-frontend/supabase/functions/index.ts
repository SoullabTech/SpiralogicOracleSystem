// supabase/functions/index.ts
import { serve } from 'std/server';

serve((_req) =>
  new Response('🌀 Supabase Edge — Oracle backend online.', {
    headers: { 'Content-Type': 'text/plain' },
  })
);
