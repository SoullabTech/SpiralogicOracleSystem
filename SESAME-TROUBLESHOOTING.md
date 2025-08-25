# Sesame TTS RunPod Troubleshooting Guide

## Quick Status Check

```bash
./verify-sesame-deployment.sh
```

This will tell you if you're getting real audio or the stub.

## Common Issues & Fixes

### 1. Still Getting 9KB Stub Audio

**Symptoms:**
- Audio files are ~9-12KB
- Hear a 1-second 880Hz tone
- Worker logs show "Model error, falling back"

**Fix:**
Check RunPod worker logs for the specific error after "🔄 Loading Sesame model..."

### 2. 401 Unauthorized Error

**Worker logs show:**
```
401 Client Error: Unauthorized for url: https://huggingface.co/...
```

**Fix:**
1. Verify HF_TOKEN is set in RunPod endpoint (as Secret)
2. Check token has read access: https://huggingface.co/settings/tokens
3. Accept model terms: https://huggingface.co/sesame/csm-1b

### 3. Model Not Found (404)

**Worker logs show:**
```
404 Client Error: Not Found
```

**Fix:**
1. Check SESAME_MODEL matches exactly: `sesame/csm-1b`
2. Verify model exists and you have access

### 4. CUDA Out of Memory

**Worker logs show:**
```
torch.cuda.OutOfMemoryError
```

**Fix:**
1. Set `SESAME_FP16=0` in RunPod env
2. Or upgrade to larger GPU (24GB+)
3. Save to rebuild

### 5. Module Not Found

**Worker logs show:**
```
ModuleNotFoundError: No module named 'transformers'
```

**Fix:**
1. Check Dockerfile.runpod has all deps:
   ```dockerfile
   RUN pip3 install transformers==4.42.4 accelerate sentencepiece safetensors soundfile numpy
   ```
2. Force rebuild by adding a comment and saving

### 6. Wrong Pipeline Output

**Worker logs show:**
```
Model returned no 'audio' field
```

**Fix:**
The model might use different output format. Check handler.py synthesize():
```python
# Adjust based on actual model output:
audio = out.get("audio", None)  # or out.get("wav", None)
sr = out.get("sampling_rate", 22050)  # or out.get("sample_rate", 22050)
```

## Verification Commands

### Direct RunPod test:
```bash
./test-runpod-direct.sh
```

### Full chain test:
```bash
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod' \
  -H 'content-type: application/json' \
  -d '{"text":"Maya speaking through Sesame"}' \
  --output maya-test.wav && afplay maya-test.wav
```

### Debug mode:
```bash
curl -s 'http://localhost:3001/api/voice/sesame?provider=sesame-runpod&debug=1' \
  -H 'content-type: application/json' \
  -d '{"text":"Debug"}' | jq .
```

## Success Indicators

✅ **Real audio:**
- File size > 50KB for a few words
- Worker logs: "✅ Model loaded in X.Ys"
- Audio plays actual speech

❌ **Still on stub:**
- File size ~9-12KB
- Worker logs: "Model error, falling back"
- Audio is just a tone

## Force Rebuild

If changes aren't taking effect:
1. Add a comment to Dockerfile.runpod
2. Save in RunPod console
3. Watch Workers → Logs for new build