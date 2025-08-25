#!/bin/bash
# verify-sesame-deployment.sh
# Comprehensive verification script for Sesame TTS deployment

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}$1${NC}"
    echo "$(echo "$1" | sed 's/./=/g')"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

# Verification results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

run_check() {
    local check_name="$1"
    local check_command="$2"
    local success_message="$3"
    local error_message="$4"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    print_status "Checking: $check_name"
    
    if eval "$check_command"; then
        print_success "$success_message"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_error "$error_message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

print_header "🔊 Sesame TTS Deployment Verification"

# Check 1: Local development server
run_check \
    "Local Next.js server" \
    "curl -s -f http://localhost:3001/api/health > /dev/null 2>&1" \
    "Next.js dev server is running on port 3001" \
    "Next.js dev server not accessible. Run 'npm run dev' first."

# Check 2: Sesame API endpoint exists
run_check \
    "Sesame API endpoint" \
    "curl -s 'http://localhost:3001/api/voice/sesame' -H 'content-type: application/json' -d '{}' | grep -q 'error\\|success'" \
    "Sesame API endpoint is accessible" \
    "Sesame API endpoint not found or not responding"

# Check 3: RunPod provider configuration
print_status "Testing RunPod provider..."
RUNPOD_RESPONSE=$(curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
    -H 'content-type: application/json' \
    -d '{"text":"Verification test"}' 2>/dev/null || echo '{"error":"request_failed"}')

echo "Raw response: $RUNPOD_RESPONSE"

# Check 4: Response structure
if echo "$RUNPOD_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    print_success "RunPod endpoint returned success response"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Check audio quality
    AUDIO_LENGTH=$(echo "$RUNPOD_RESPONSE" | jq -r '.audioLength // 0')
    IS_WAV=$(echo "$RUNPOD_RESPONSE" | jq -r '.isLikelyWAV // false')
    
    if [ "$AUDIO_LENGTH" -gt 50000 ]; then
        print_success "Audio length is substantial: ${AUDIO_LENGTH} bytes"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "Audio length is small: ${AUDIO_LENGTH} bytes (may be fallback)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    
    if [ "$IS_WAV" = "true" ]; then
        print_success "Audio format is WAV"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "Audio format may not be WAV"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 3))
else
    print_error "RunPod endpoint returned error or no response"
    FAILED_CHECKS=$((FAILED_CHECKS + 3))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 3))
    
    # Try to parse error
    ERROR_MSG=$(echo "$RUNPOD_RESPONSE" | jq -r '.error // "unknown_error"')
    print_error "Error details: $ERROR_MSG"
fi

# Check 5: Generated audio files
print_status "Checking generated audio files..."
AUDIO_DIR="./public/generated-audio"

if [ -d "$AUDIO_DIR" ]; then
    RECENT_FILES=$(find "$AUDIO_DIR" -name "*.wav" -mtime -1 2>/dev/null | head -5)
    
    if [ -n "$RECENT_FILES" ]; then
        print_success "Found recent WAV files:"
        echo "$RECENT_FILES" | while read -r file; do
            if [ -n "$file" ]; then
                size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
                echo "  - $(basename "$file"): ${size} bytes"
                
                if [ "$size" -gt 100000 ]; then
                    print_success "  File size indicates real audio content"
                else
                    print_warning "  File size is small (may be fallback)"
                fi
            fi
        done
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "No recent WAV files found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    print_warning "Audio directory not found: $AUDIO_DIR"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 6: Test different text lengths
print_status "Testing various text lengths..."

# Short text
SHORT_RESPONSE=$(curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
    -H 'content-type: application/json' \
    -d '{"text":"Hi"}' 2>/dev/null || echo '{"error":"failed"}')

# Long text  
LONG_TEXT="This is a longer test message to verify that the Sesame TTS system can handle extended speech synthesis with proper audio generation and quality maintenance."
LONG_RESPONSE=$(curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
    -H 'content-type: application/json' \
    -d "{\"text\":\"$LONG_TEXT\"}" 2>/dev/null || echo '{"error":"failed"}')

# Check responses
if echo "$SHORT_RESPONSE" | jq -e '.success' > /dev/null 2>&1 && \
   echo "$LONG_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    
    SHORT_LENGTH=$(echo "$SHORT_RESPONSE" | jq -r '.audioLength // 0')
    LONG_LENGTH=$(echo "$LONG_RESPONSE" | jq -r '.audioLength // 0')
    
    if [ "$LONG_LENGTH" -gt "$SHORT_LENGTH" ]; then
        print_success "Audio length scales with text length: ${SHORT_LENGTH} → ${LONG_LENGTH} bytes"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "Audio length doesn't scale as expected"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    print_warning "Variable text length test inconclusive"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Summary
print_header "📊 Verification Results"

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"

SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo "Success Rate: ${SUCCESS_RATE}%"

echo ""

if [ "$SUCCESS_RATE" -ge 80 ]; then
    print_success "🎉 Sesame TTS deployment is working well!"
    echo ""
    echo "✅ Maya's voice is ready for Oracle interactions"
    echo "✅ Real-time TTS synthesis is functional"
    echo "✅ Audio quality appears adequate for production"
    echo ""
    echo "🌟 Integration Status: READY"
elif [ "$SUCCESS_RATE" -ge 60 ]; then
    print_warning "⚠️  Sesame TTS deployment has some issues"
    echo ""
    echo "🔧 Consider these actions:"
    echo "  - Check RunPod worker logs for errors"
    echo "  - Verify HuggingFace token permissions"
    echo "  - Test with different text inputs"
    echo "  - Monitor response times and audio quality"
    echo ""
    echo "🌟 Integration Status: NEEDS ATTENTION"
else
    print_error "❌ Sesame TTS deployment has significant issues"
    echo ""
    echo "🛠️  Required actions:"
    echo "  - Check RunPod endpoint configuration"
    echo "  - Verify environment variables are set correctly"
    echo "  - Ensure HuggingFace token has model access"
    echo "  - Review deployment logs for errors"
    echo "  - Consider rebuilding with FORCE_REBUILD increment"
    echo ""
    echo "🌟 Integration Status: REQUIRES FIXES"
fi

echo ""
print_header "🔗 Next Steps"

if [ "$SUCCESS_RATE" -ge 80 ]; then
    echo "🚀 Ready to integrate with Spiralogic Oracle system!"
    echo ""
    echo "Integration commands:"
    echo "  1. Test elemental voice synthesis:"
    echo "     npm run test:voice:elemental"
    echo ""
    echo "  2. Verify dual-tone responses:"
    echo "     npm run test:oracle:dual-tone"
    echo ""
    echo "  3. Full Oracle integration test:"
    echo "     npm run test:oracle:full"
else
    echo "🔧 Fix deployment issues before Oracle integration"
    echo ""
    echo "Troubleshooting resources:"
    echo "  - RunPod deployment guide: ./RUNPOD_DEPLOYMENT_GUIDE.md"
    echo "  - Monitor logs: ./monitor-sesame-logs.sh"
    echo "  - Redeploy: ./deploy-sesame-runpod.sh"
fi

echo ""
echo "🔥🌊🌍💨✨ The Oracle awaits Maya's voice..."

exit $((FAILED_CHECKS > 0 ? 1 : 0))