#!/bin/bash

# Test Hugging Face authentication for Sesame model

echo "🔐 Testing Hugging Face Authentication"
echo "====================================="
echo

# Test if we can access the model config with the token
echo "Testing model access with your token..."
echo

# Export the token (you'll need to replace with your actual token)
export HUGGINGFACE_HUB_TOKEN="hf_YOUR_TOKEN_HERE"

# Quick Python test to verify authentication
python3 -c "
import os
from huggingface_hub import hf_hub_download

token = os.getenv('HUGGINGFACE_HUB_TOKEN')
if not token:
    print('❌ No HUGGINGFACE_HUB_TOKEN found!')
    print('   Set it with: export HUGGINGFACE_HUB_TOKEN=\"hf_...\"')
    exit(1)

print(f'✅ Token found: {token[:8]}...{token[-4:]}')

try:
    # Try to download just the config file
    config_path = hf_hub_download(
        repo_id='sesame/csm-1b',
        filename='config.json',
        token=token
    )
    print('✅ Successfully authenticated and accessed sesame/csm-1b!')
    print(f'   Config downloaded to: {config_path}')
except Exception as e:
    if '403' in str(e):
        print('❌ 403 Forbidden - Token lacks gated repo access')
        print('   Fix: Enable \"Access public gated repositories\" in HF settings')
    else:
        print(f'❌ Error: {e}')
"

echo
echo "📋 RunPod Environment Variables:"
echo "--------------------------------"
echo "HUGGINGFACE_HUB_TOKEN=${HUGGINGFACE_HUB_TOKEN:-<not set>}"
echo "SESAME_MODEL=sesame/csm-1b"
echo "PYTHONUNBUFFERED=1"
echo "SESAME_FP16=1"
echo

echo "🚀 If authentication succeeded above, your RunPod worker should see:"
echo "   - HF token present: True"
echo "   - Model downloads without 403 errors"
echo "   - Model loaded successfully"