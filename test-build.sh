#!/bin/bash

echo "🧪 Testing Next.js build without OpenAI API key..."
echo ""

# Temporarily unset OpenAI API key to test build
unset OPENAI_API_KEY

# Change to project directory
cd "$(dirname "$0")"

# Run the build
echo "Running: npm run build"
npm run build

# Capture exit code
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Build succeeded without OpenAI API key!"
  echo "The lazy loading fix is working correctly."
else
  echo ""
  echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
  echo "There may be additional places where OpenAI is being instantiated."
fi

exit $BUILD_EXIT_CODE