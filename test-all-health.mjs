#!/usr/bin/env node

// Test all health endpoints across environments
import fetch from 'node-fetch';

const environments = [
  {
    name: 'Local Dev',
    baseUrl: 'http://localhost:3000',
    color: '\x1b[34m' // blue
  },
  {
    name: 'Vercel Preview', 
    baseUrl: 'https://spiralogic-oracle-system-git-main-hash.vercel.app',
    color: '\x1b[33m' // yellow
  },
  {
    name: 'Vercel Production',
    baseUrl: 'https://spiralogic-oracle-system.vercel.app', 
    color: '\x1b[32m' // green
  }
];

const endpoints = [
  '/api/health',
  '/api/health/events', 
  '/api/health/providers',
  '/metrics'
];

async function testEndpoint(baseUrl, endpoint) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      timeout: 10000
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const isText = contentType?.includes('text/plain');
    
    let body = '';
    if (isJson) {
      const json = await response.json();
      body = JSON.stringify(json, null, 2);
    } else if (isText && endpoint === '/metrics') {
      const text = await response.text();
      body = text.split('\n').slice(0, 5).join('\n') + '\n...';
    } else {
      body = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      body: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
      contentType
    };
  } catch (error) {
    return {
      status: 'ERROR',
      statusText: error.message,
      body: '',
      contentType: ''
    };
  }
}

async function runTests() {
  console.log('🩺 Health Check Matrix\n');
  
  for (const env of environments) {
    console.log(`${env.color}${env.name}\x1b[0m (${env.baseUrl})`);
    console.log('─'.repeat(60));
    
    for (const endpoint of endpoints) {
      process.stdout.write(`  ${endpoint.padEnd(25)} `);
      
      const result = await testEndpoint(env.baseUrl, endpoint);
      
      if (result.status === 200) {
        console.log('\x1b[32m✓ 200 OK\x1b[0m');
      } else if (result.status === 503) {
        console.log('\x1b[33m⚠ 503 Degraded\x1b[0m');
      } else if (result.status === 'ERROR') {
        console.log(`\x1b[31m✗ ${result.statusText}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✗ ${result.status} ${result.statusText}\x1b[0m`);
      }
      
      if (result.body && result.status !== 200) {
        console.log(`    ${result.body.replace(/\n/g, '\n    ')}`);
      }
    }
    console.log('');
  }
}

runTests().catch(console.error);