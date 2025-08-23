#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('Starting build process...');

const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  cwd: '/Volumes/T7 Shield/Projects/SpiralogicOracleSystem'
});

build.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});

build.on('error', (err) => {
  console.error('Failed to start build process:', err);
  process.exit(1);
});