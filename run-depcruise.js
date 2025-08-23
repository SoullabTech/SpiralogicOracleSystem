#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running dependency-cruiser...');
  const result = execSync('npx depcruise --config .dependency-cruiser.cjs --output-type err backend/src', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(result);
} catch (error) {
  console.error('Error output:', error.stdout);
  console.error('Error stderr:', error.stderr);
  process.exit(1);
}