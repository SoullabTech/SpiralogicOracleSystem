#!/bin/bash

# RunPod Sesame TTS Deployment Checklist

echo "🚀 RunPod Sesame TTS Deployment Guide"
echo "===================================="
echo ""

# Check environment
echo "📋 Environment Check:"
echo ""

# Check for required env vars
check_env() {
    if [ -z "${!1}" ]; then
        echo "❌ $1: Not set"
        return 1
    else
        echo "✅ $1: Set"
        return 0
    fi
}

# Load .env.local if exists
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -E '^(HF_|RUNPOD_|SESAME_)' | xargs)
fi

ENV_OK=true
check_env "HF_TOKEN" || ENV_OK=false
check_env "RUNPOD_API_KEY" || ENV_OK=false
check_env "RUNPOD_SESAME_ENDPOINT_ID" || ENV_OK=false

echo ""

if [ "$ENV_OK" = false ]; then
    echo "⚠️  Missing environment variables. Add to .env.local:"
    echo ""
    echo "HF_TOKEN=hf_..."
    echo "RUNPOD_API_KEY=rpa_..."
    echo "RUNPOD_SESAME_ENDPOINT_ID=your-endpoint-id"
    echo ""
fi

# Show deployment steps
echo "📝 Deployment Steps:"
echo ""
echo "1. Push changes to git:"
echo "   git add services/sesame-tts/handler.py services/sesame-tts/Dockerfile.runpod"
echo "   git commit -m 'feat: real Sesame model loading with fallback tone'"
echo "   git push origin $(git branch --show-current)"
echo ""

echo "2. Update RunPod endpoint:"
echo "   - Go to: https://runpod.io/console/serverless"
echo "   - Click your endpoint: ${RUNPOD_SESAME_ENDPOINT_ID:-[YOUR-ENDPOINT]}"
echo "   - Settings tab → Update:"
echo "     • Branch: $(git branch --show-current)"
echo "     • Dockerfile Path: services/sesame-tts/Dockerfile.runpod"
echo "     • GPU Types: L4, RTX 4090, A5000 (any available)"
echo "     • Active Workers: 1"
echo ""

echo "3. Add environment variables in RunPod:"
echo "   • HF_TOKEN = ${HF_TOKEN:+[YOUR-HF-TOKEN]}"
echo "   • SESAME_FP16 = 1"
echo "   • SESAME_MODEL = sesame/csm-1b"
echo ""

echo "4. Save and watch rebuild:"
echo "   • Click 'Save' to trigger rebuild"
echo "   • Go to Workers tab → Click '...' → View Logs"
echo "   • Wait for: '✅ Model loaded in X.Ys'"
echo ""

echo "5. Test with debug script:"
echo "   ./test-sesame-debug.sh"
echo ""

echo "📊 Expected worker logs:"
echo "   🔊 Booting Sesame RunPod worker..."
echo "   📦 Model: sesame/csm-1b | Device: cuda | FP16: True"
echo "   🔄 Loading Sesame model..."
echo "   ✅ Model loaded in X.Ys"
echo "   🎤 Synthesizing: [your text]..."
echo ""

echo "🎯 Success indicators:"
echo "   • Audio files > 100KB (not 9KB stub)"
echo "   • Worker logs show model loaded"
echo "   • Audio plays actual speech"
echo ""

echo "❓ Troubleshooting:"
echo "   • 401 error → Check HF_TOKEN is valid"
echo "   • CUDA not available → Check GPU is assigned"
echo "   • Model error → Check logs for specific error"
echo "   • Still 9KB → Worker using old image, force rebuild"
echo ""