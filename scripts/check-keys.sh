#!/usr/bin/env bash
# 🔑 Maya Ops Utility - Verify API Keys
# Usage: ./scripts/check-keys.sh [--show-partial] [--allow-missing KEY1,KEY2]

set -e

SHOW_PARTIAL=false
ALLOW_MISSING=""
ENVIRONMENT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --show-partial)
            SHOW_PARTIAL=true
            shift
            ;;
        --allow-missing)
            ALLOW_MISSING="$2"
            shift 2
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--show-partial] [--allow-missing KEY1,KEY2] [--env staging|production]"
            exit 1
            ;;
    esac
done

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
const allowMissing = '$ALLOW_MISSING'.split(',').filter(k => k.trim());
const environment = '$ENVIRONMENT' || process.env.NODE_ENV || 'development';

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
console.log('Environment: ' + environment);

// Show which files are being loaded
const fs = require('fs');
const envSources = [];
if (fs.existsSync('.env')) envSources.push('.env');
if (fs.existsSync('.env.local')) envSources.push('.env.local');
if (fs.existsSync('backend/.env')) envSources.push('backend/.env');
if (fs.existsSync('.env.development')) envSources.push('.env.development');
if (fs.existsSync('.env.production')) envSources.push('.env.production');

if (envSources.length > 0) {
    console.log('Config Sources: ' + envSources.join(', '));
} else {
    console.log('Config Sources: ⚠️ No .env files found');
}

if (allowMissing.length > 0) {
    console.log('Allow Missing: ' + allowMissing.join(', '));
}
console.log('OpenAI:     ', formatKey(process.env.OPENAI_API_KEY, 'OpenAI'));
console.log('Anthropic:  ', formatKey(process.env.ANTHROPIC_API_KEY, 'Anthropic'));
console.log('ElevenLabs: ', formatKey(process.env.ELEVENLABS_API_KEY, 'ElevenLabs'));
console.log('');

// Check for missing keys
const missing = [];
if (!process.env.OPENAI_API_KEY && !allowMissing.includes('OPENAI_API_KEY')) missing.push('OPENAI_API_KEY');
if (!process.env.ANTHROPIC_API_KEY && !allowMissing.includes('ANTHROPIC_API_KEY')) missing.push('ANTHROPIC_API_KEY');  
if (!process.env.ELEVENLABS_API_KEY && !allowMissing.includes('ELEVENLABS_API_KEY')) missing.push('ELEVENLABS_API_KEY');

// Show allowed missing keys that are actually missing
const allowedMissing = [];
if (!process.env.OPENAI_API_KEY && allowMissing.includes('OPENAI_API_KEY')) allowedMissing.push('OPENAI_API_KEY');
if (!process.env.ANTHROPIC_API_KEY && allowMissing.includes('ANTHROPIC_API_KEY')) allowedMissing.push('ANTHROPIC_API_KEY');
if (!process.env.ELEVENLABS_API_KEY && allowMissing.includes('ELEVENLABS_API_KEY')) allowedMissing.push('ELEVENLABS_API_KEY');

if (allowedMissing.length > 0) {
    console.log('🟡 Missing keys (allowed):', allowedMissing.join(', '));
    console.log('');
}

if (missing.length > 0) {
    console.log('❌ Missing required API keys:', missing.join(', '));
    console.log('');
    console.log('💡 To fix:');
    console.log('   1. Copy .env.development.template to .env.local');
    console.log('   2. Add your API keys to .env.local');
    console.log('   3. Run this script again');
    console.log('');
    console.log('💡 Or for staging/testing, use:');
    console.log('   ./scripts/check-keys.sh --allow-missing ' + missing.join(','));
    console.log('');
    process.exit(1);
} else {
    const totalKeys = 3;
    const presentKeys = totalKeys - allowedMissing.length;
    if (allowedMissing.length > 0) {
        console.log('✅ ' + presentKeys + '/' + totalKeys + ' required keys present (' + allowedMissing.length + ' allowed missing)');
    } else {
        console.log('✅ All API keys present and ready!');
    }
    console.log('');
    
    // Optional: Test basic connectivity
    console.log('🔗 Testing API connectivity...');
    console.log('   Run: ./scripts/quick-test.sh');
}
"