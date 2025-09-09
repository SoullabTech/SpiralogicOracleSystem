#!/usr/bin/env node

/**
 * Deploy Sacred Beta Database Schema to Supabase
 * 
 * This script helps deploy the sacred beta users schema to your Supabase instance.
 * Run this after setting up your Supabase project and environment variables.
 */

const fs = require('fs');
const path = require('path');

function main() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250909_sacred_beta_users.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  console.log('🌙 Sacred Beta Database Schema Deployment');
  console.log('==========================================\n');

  console.log('📋 Migration file found:', migrationPath);
  console.log('\n🔧 Deployment Options:\n');

  console.log('1. 🚀 Supabase CLI (Recommended):');
  console.log('   supabase db reset');
  console.log('   # or');
  console.log('   supabase migration up\n');

  console.log('2. 📊 Supabase Dashboard:');
  console.log('   - Go to your Supabase project dashboard');
  console.log('   - Navigate to SQL Editor');
  console.log('   - Copy and paste the migration file content');
  console.log('   - Execute the SQL\n');

  console.log('3. 🔗 Direct Connection:');
  console.log('   - Use psql or any PostgreSQL client');
  console.log('   - Connect to your Supabase database');
  console.log('   - Run the migration file\n');

  console.log('📄 Migration Preview:');
  console.log('====================');
  
  try {
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    const lines = migrationContent.split('\n');
    const preview = lines.slice(0, 20).join('\n');
    console.log(preview);
    
    if (lines.length > 20) {
      console.log('...\n[Truncated - Full migration has', lines.length, 'lines]');
    }
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
  }

  console.log('\n✨ What this migration creates:');
  console.log('- 👥 users table (authentication + sacred profiles)');
  console.log('- 🧙‍♀️ oracle_agents table (personal AI guides)');
  console.log('- 🧠 memories table (conversation storage)');  
  console.log('- 💬 conversation_sessions table (dialogue grouping)');
  console.log('- 📔 journal_entries table (deeper reflections)');
  console.log('- 🔒 Row Level Security policies');
  console.log('- 🎯 Performance indexes');
  console.log('- ⚡ Auto-update triggers');

  console.log('\n🌿 Environment Variables Needed:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');

  console.log('\n🔄 After deployment, run:');
  console.log('npm install  # Install new dependencies (bcryptjs)');
  console.log('npm run dev  # Test the sacred flow');

  console.log('\n✅ Ready to proceed with your chosen deployment method!');
}

if (require.main === module) {
  main();
}