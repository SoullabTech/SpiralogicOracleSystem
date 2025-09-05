# Sesame CSM-1B Setup Guide

## Overview
Sesame CSM-1B is a text-to-speech (TTS) model that can convert text to natural-sounding speech.

## Current Configuration

### Environment Variables (.env.local)
```bash
SESAME_ENABLED=true
SESAME_API_KEY=hf_YOUR_API_KEY_HERE  # Get from https://huggingface.co/settings/tokens
SESAME_URL=https://api-inference.huggingface.co/models/sesame/csm-1b
```

## Getting Started

### 1. Get a Hugging Face API Key
1. Go to https://huggingface.co/settings/tokens
2. Sign in or create an account
3. Click "New token"
4. Name it (e.g., "SpiralogicOracle")
5. Select "read" permission
6. Copy the token (starts with `hf_`)
7. Update `SESAME_API_KEY` in `.env.local`

### 2. Test Your Setup
```bash
# Check if your API key is valid
./scripts/check-hf-api.sh

# Test the TTS functionality
./scripts/test-sesame-tts.sh

# Test the original Sesame endpoint
./scripts/test-sesame.sh
```

## Available Scripts

- **check-hf-api.sh** - Validates your Hugging Face API key
- **test-sesame-tts.sh** - Tests the Sesame CSM-1B TTS model
- **test-sesame.sh** - Tests any configured Sesame model
- **test-popular-models.sh** - Finds working models on Hugging Face

## Model Options

### For Text-to-Speech (Current)
```bash
SESAME_URL=https://api-inference.huggingface.co/models/sesame/csm-1b
```

### For Text Generation (Alternative)
```bash
# Option 1: GPT-2
SESAME_URL=https://api-inference.huggingface.co/models/gpt2

# Option 2: Microsoft DialoGPT
SESAME_URL=https://api-inference.huggingface.co/models/microsoft/DialoGPT-small
```

## Troubleshooting

### Invalid API Key
- Make sure your token starts with `hf_`
- Ensure it has "read" permissions
- Check for extra spaces or quotes

### Model Loading (503 errors)
- First requests can take 20-30 seconds
- Wait a minute and try again

### Model Not Found (404)
- Verify the model name is correct
- Some models require special access

## Integration with Spiralogic

The Sesame integration is controlled by:
- `USE_SESAME=true` in `.env.local`
- Backend checks for `SESAME_ENABLED` and valid credentials
- If enabled, can provide TTS capabilities for Maya's voice