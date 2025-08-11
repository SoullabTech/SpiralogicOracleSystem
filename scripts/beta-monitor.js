#!/usr/bin/env node

// Beta monitoring stub - replace with real checks later
// Simple heartbeat check for master launch controller

const timestamp = new Date().toISOString();
console.log(`[beta-monitor] ${timestamp} heartbeat ok`);

// Basic health check
const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      console.log(`[beta-monitor] ${timestamp} health endpoint responding`);
      return true;
    }
  } catch (error) {
    console.log(`[beta-monitor] ${timestamp} health endpoint failed: ${error.message}`);
    return false;
  }
  return false;
};

// Run check if Node.js has fetch (v18+) or if in production
if (typeof fetch !== 'undefined') {
  healthCheck().then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  // Fallback for older Node.js versions
  console.log(`[beta-monitor] ${timestamp} basic heartbeat complete`);
  process.exit(0);
}