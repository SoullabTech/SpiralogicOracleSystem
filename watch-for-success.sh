#!/bin/bash

# Quick log filter to spot success/failure in RunPod logs
# Usage: Copy-paste the logs into terminal and pipe to this script
# Or save logs to file: cat logs.txt | ./watch-for-success.sh

echo "🔍 Filtering for key events..."
echo "=============================="

# Look for key log patterns
grep -E "(Booting Sesame|Model:|Loading Sesame|Model loaded successfully|Model failed|Error:|Generated .* bytes)" | \
while IFS= read -r line; do
    if [[ "$line" == *"Booting Sesame RunPod worker"* ]]; then
        echo "🔊 Worker starting..."
    elif [[ "$line" == *"Model:"* ]]; then
        echo "📦 $line"
    elif [[ "$line" == *"Loading Sesame TTS model"* ]]; then
        echo "🔄 Loading model..."
    elif [[ "$line" == *"Model loaded successfully"* ]]; then
        echo "✅ SUCCESS! $line"
        echo "🎯 Ready to test audio!"
    elif [[ "$line" == *"Generated"* && "$line" == *"bytes"* ]]; then
        echo "🎵 $line"
    elif [[ "$line" == *"Model failed"* || "$line" == *"Error:"* ]]; then
        echo "❌ ISSUE: $line"
        echo "📋 Share this error for the fix!"
    fi
done

echo ""
echo "💡 Once you see '✅ SUCCESS!' run:"
echo "   ./test-after-redeploy.sh"