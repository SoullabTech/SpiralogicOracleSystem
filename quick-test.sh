#!/bin/bash
set -e

echo "Testing TypeScript compilation..."
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"

# Try typecheck first
echo "Running typecheck..."
npx tsc --noEmit || echo "Typecheck failed"

# Try build
echo "Running build..."
npm run build 2>&1 || echo "Build failed"

echo "Test complete"