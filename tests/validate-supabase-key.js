#!/usr/bin/env node

/**
 * Validate Supabase API Key Format
 * Helps debug JWT token issues
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔑 SUPABASE KEY VALIDATOR\n');
console.log('Paste your Supabase anon key from the dashboard:');

rl.question('Key: ', (key) => {
  console.log('\n------- ANALYSIS -------\n');
  
  // Check basic format
  const parts = key.split('.');
  
  if (parts.length !== 3) {
    console.log('❌ Invalid JWT format. Should have 3 parts separated by dots.');
    console.log(`   Found ${parts.length} parts`);
  } else {
    console.log('✅ Valid JWT structure (3 parts)');
    
    // Decode header
    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      console.log('\n📋 Header:', JSON.stringify(header, null, 2));
    } catch (e) {
      console.log('❌ Cannot decode header');
    }
    
    // Decode payload
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('\n📦 Payload:', JSON.stringify(payload, null, 2));
      
      // Check expiration
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        if (expDate < now) {
          console.log(`\n❌ KEY EXPIRED on ${expDate.toISOString()}`);
        } else {
          console.log(`\n✅ Valid until ${expDate.toISOString()}`);
        }
      }
      
      // Check role
      if (payload.role === 'anon') {
        console.log('✅ Role: anon (correct for public access)');
      } else if (payload.role === 'service_role') {
        console.log('⚠️  Role: service_role (use only server-side!)');
      }
      
      // Check project ref
      if (payload.ref) {
        console.log(`✅ Project: ${payload.ref}`);
      }
    } catch (e) {
      console.log('❌ Cannot decode payload');
    }
    
    // Check signature
    console.log(`\n🔏 Signature: ${parts[2].substring(0, 20)}... (${parts[2].length} chars)`);
    if (parts[2].length < 40) {
      console.log('⚠️  Signature seems short. Make sure you copied the complete key.');
    }
  }
  
  console.log('\n------- USAGE -------\n');
  console.log('Add to .env.local:');
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}`);
  
  rl.close();
});