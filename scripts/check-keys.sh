#!/usr/bin/env bash
# 🔑 Maya Ops Utility - Verify API Keys
# Usage: ./scripts/check-keys.sh [--show-partial]

set -e

SHOW_PARTIAL=false
if [[ "$1" == "--show-partial" ]]; then
    SHOW_PARTIAL=true
fi

echo "🔍 Checking API key presence..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]] && [[ ! -f "backend/package.json" ]]; then
    echo "❌ Run this from the project root directory"
    exit 1
fi

# Load environment and check keys
node -e "
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const showPartial = '$SHOW_PARTIAL' === 'true';

function formatKey(key, service) {
    if (!key) return '❌ Missing';
    
    if (!showPartial) return '✅ Present';
    
    // Show first 8 and last 4 characters with masking
    const start = key.slice(0, 8);
    const end = key.slice(-4);
    const hiddenCount = key.length - 12;
    const masked = start + '***[' + hiddenCount + ' chars]***' + end;
    return '✅ ' + masked;
}

console.log('');
console.log('--- API Key Status ---');
console.log('OpenAI:     ', formatKey(process.env.OPENAI_API_KEY, 'OpenAI'));
console.log('Anthropic:  ', formatKey(process.env.ANTHROPIC_API_KEY, 'Anthropic'));
console.log('ElevenLabs: ', formatKey(process.env.ELEVENLABS_API_KEY, 'ElevenLabs'));
console.log('');

// Additional checks
const missing = [];
if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
if (!process.env.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
if (!process.env.ELEVENLABS_API_KEY) missing.push('ELEVENLABS_API_KEY');

if (missing.length > 0) {
    console.log('❌ Missing API keys:', missing.join(', '));
    console.log('');
    console.log('💡 To fix:');
    console.log('   1. Copy .env.development.template to .env.local');
    console.log('   2. Add your API keys to .env.local');
    console.log('   3. Run this script again');
    console.log('');
    process.exit(1);
} else {
    console.log('✅ All API keys present and ready!');
    console.log('');
    
    // Optional: Test basic connectivity
    console.log('🔗 Testing API connectivity...');
    console.log('   Run: ./scripts/quick-test.sh');
}
"