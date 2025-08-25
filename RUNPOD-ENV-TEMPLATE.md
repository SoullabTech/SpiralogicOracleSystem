# RunPod Environment Variables for Sesame TTS

Copy these exactly into RunPod Serverless → Manage → Environment Variables:

```bash
# Hugging Face Authentication (REQUIRED)
HUGGINGFACE_HUB_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Model Configuration
SESAME_MODEL=sesame/csm-1b
SESAME_FP16=1

# Python Configuration
PYTHONUNBUFFERED=1

# Optional: Clear legacy token if it exists
HF_TOKEN=
```

## Important Notes:

1. **HUGGINGFACE_HUB_TOKEN**: Must have "Read access to contents of all public gated repos" enabled
2. **SESAME_FP16**: Enables half-precision for faster inference
3. **PYTHONUNBUFFERED**: Ensures real-time log output
4. **HF_TOKEN**: Leave empty to ensure only the modern token is used

## Verification Checklist:

After setting these and deploying:

- [ ] Logs show: `HF token present: True`
- [ ] Logs show: `Downloading (...)config.json: 100%`
- [ ] Logs show: `Model loaded successfully`
- [ ] Test endpoint returns audio with `audioLength > 50000`