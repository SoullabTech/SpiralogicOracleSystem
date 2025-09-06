#!/usr/bin/env node
/**
 * Apply Supabase migration for voice session tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jkbetmadzcpoinjogkli.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmV0bWFkemNwb2luam9na2xpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjU2MjI0NSwiZXhwIjoyMDU4MTM4MjQ1fQ.QNvP9jEiSSfs_2-aFmtDt1xEMY_vwpU_ZT-CYRlgS98';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrationSQL = `
-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  session_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Voice Events Table 
CREATE TABLE IF NOT EXISTS public.voice_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  transcript text,
  event_type text CHECK (event_type IN ('start', 'stop', 'silence', 'error', 'transcript', 'audio_generated')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Memory Events Table
CREATE TABLE IF NOT EXISTS public.memory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  memory_text text,
  memory_type text CHECK (memory_type IN ('insight', 'pattern', 'symbol', 'reflection', 'breakthrough')),
  memory_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_voice_events_user_id ON public.voice_events(user_id);  
CREATE INDEX IF NOT EXISTS idx_voice_events_session_id ON public.voice_events(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_events_event_type ON public.voice_events(event_type);
CREATE INDEX IF NOT EXISTS idx_voice_events_created_at ON public.voice_events(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_events_user_id ON public.memory_events(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_session_id ON public.memory_events(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_memory_type ON public.memory_events(memory_type);
CREATE INDEX IF NOT EXISTS idx_memory_events_created_at ON public.memory_events(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_events ENABLE ROW LEVEL SECURITY;
`.trim();

const policiesSQL = `
-- Security Policies
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own voice events"
  ON public.voice_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own memory events" 
  ON public.memory_events FOR ALL USING (auth.uid() = user_id);
`.trim();

const triggerSQL = `
-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`.trim();

async function applyMigration() {
  console.log('🚀 Applying voice session tables migration...');
  
  try {
    // Apply main migration
    console.log('📋 Creating tables and indexes...');
    const { error: migrationError } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (migrationError) {
      throw migrationError;
    }
    
    console.log('✅ Tables and indexes created successfully');
    
    // Apply policies
    console.log('🔐 Creating security policies...');
    const { error: policiesError } = await supabase.rpc('exec', { sql: policiesSQL });
    
    if (policiesError) {
      console.warn('⚠️  Policies may already exist:', policiesError.message);
    } else {
      console.log('✅ Security policies created successfully');
    }
    
    // Apply triggers
    console.log('🔄 Creating triggers...');
    const { error: triggerError } = await supabase.rpc('exec', { sql: triggerSQL });
    
    if (triggerError) {
      console.warn('⚠️  Trigger may already exist:', triggerError.message);
    } else {
      console.log('✅ Triggers created successfully');
    }
    
    // Verify tables exist
    console.log('🔍 Verifying tables were created...');
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_sessions', 'voice_events', 'memory_events']);
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log('🎯 Migration completed successfully!');
    console.log('📊 Created tables:', tables?.map(t => t.table_name).join(', '));
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

if (require.main === module) {
  applyMigration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { applyMigration };