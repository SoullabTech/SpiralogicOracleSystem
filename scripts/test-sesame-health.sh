#!/bin/bash
# Quick test script to verify Sesame health check with timeout

echo "Testing Sesame health check with 5 second timeout..."

# Method 1: Using timeout command
if command -v timeout >/dev/null 2>&1; then
    echo "Using timeout command:"
    RESULT=$(timeout 5 curl -s http://localhost:8000/health 2>/dev/null || echo "TIMEOUT")
    echo "Result: ${RESULT:-No response}"
else
    echo "Using curl's built-in timeout:"
    RESULT=$(curl -s --max-time 5 http://localhost:8000/health 2>/dev/null || echo "TIMEOUT")
    echo "Result: ${RESULT:-No response}"
fi

echo ""
echo "✅ Script completed without hanging!"