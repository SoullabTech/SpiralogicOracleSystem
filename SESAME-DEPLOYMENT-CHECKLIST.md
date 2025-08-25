# Sesame TTS RunPod Deployment Checklist

## 🚀 Quick Deploy

### 1. Push Changes
```bash
git add services/sesame-tts/handler.py services/sesame-tts/Dockerfile.runpod
git commit -m "feat: production-ready Sesame TTS with proper inference"
git push origin ian-fix/builds
```

### 2. RunPod Endpoint Settings

**EXACT SETTINGS:**
- **Branch**: `ian-fix/builds` (or your current branch)
- **Dockerfile Path**: `services/sesame-tts/Dockerfile.runpod`
- **Build Context**: `/`
- **Active Workers**: `1`
- **GPU**: L4 or RTX 4090 (24GB+ if OOM)
- **Execution Timeout**: `180-300`

**ENVIRONMENT VARIABLES** (use Secret for HF_TOKEN):
- `HF_TOKEN` = your_huggingface_token
- `SESAME_MODEL` = `sesame/csm-1b`
- `SESAME_FP16` = `1`
- `TORCH_DTYPE` = `float16`

### 3. Save & Monitor

After saving:
1. Go to **Releases** tab → watch build progress
2. Go to **Workers** tab → click (...) → **View Logs**
3. Look for these exact lines:
   ```
   🔊 Booting Sesame RunPod worker...
   📦 Model: sesame/csm-1b | Device: cuda | FP16: True
   ✅ Model loaded successfully
   ```

### 4. Test

```bash
./test-sesame-final.sh
```

## ✅ Success Indicators

- Audio files > 100KB (not 9KB)
- Worker logs show "Model loaded successfully"
- You hear Maya's voice, not a tone

## ❌ If Still Getting Stub

The handler returns a stub when the model inference fails. Check worker logs for the exact error after "⚠️ Model failed, returning fallback tone:"

### Common Fixes:

1. **Import Error** (e.g., `No module named 'transformers'`)
   - Add missing package to Dockerfile.runpod
   - Save to rebuild

2. **Model API Error** (e.g., `'ModelOutput' has no attribute 'waveform'`)
   - Update handler.py lines 57-62 with correct API
   - The model might use different field names

3. **Auth Error** (401/403)
   - Verify HF_TOKEN is set correctly
   - Accept model terms on HuggingFace

4. **CUDA OOM**
   - Set `SESAME_FP16=0` (float32)
   - Or use bigger GPU

## 📝 Key Code Locations

**handler.py** - Three spots to customize for your model:
1. Line 7: Import statements
2. Line 35-40: Model loading
3. Line 57-62: Inference call

**Dockerfile.runpod** - Line 20-26: Add any missing dependencies

## 🎯 TL;DR

1. Push code
2. Update endpoint (exact settings above)
3. Save → Watch logs → "Model loaded successfully"
4. Run `./test-sesame-final.sh`
5. File > 100KB = Success! 🎉