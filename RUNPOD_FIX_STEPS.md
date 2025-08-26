# RunPod CSM-1B Fix Steps

## Changes Made

1. **Updated `requirements-runpod.txt`** with exact pins:
   - `torch==2.1.2+cu121` (with CUDA 12.1 support)
   - `transformers==4.40.2` (has CSM support, avoids newer breaking changes)
   - `accelerate==0.24.1` (compatible with torch 2.1.2, avoids device_mesh)
   - `safetensors>=0.4.3`
   - `numpy<2` (prevents binary mismatch)
   - `huggingface_hub>=0.24.0`

2. **Updated `Dockerfile.runpod`**:
   - Removed duplicate torch installation
   - Uses requirements-runpod.txt exclusively (no later upgrades)
   - Added environment variables: `HF_HUB_ENABLE_HF_TRANSFER=1`, `PYTHONUNBUFFERED=1`

3. **Added version logging** to handler.py for debugging

## Deployment Steps

1. **Commit and push to main**:
   ```bash
   git add requirements-runpod.txt Dockerfile.runpod
   git commit -m "fix: update RunPod dependencies for CSM-1B compatibility"
   git push origin main
   ```

2. **In RunPod Console**:
   - Go to endpoint `tez1e1bhwqfmn3`
   - **Manage → Rebuild** (uncheck "Use cache")
   - Wait for build to complete

3. **After build completes**:
   - **Workers tab** → Recycle any "Outdated" workers
   - **Requests tab** → Cancel any stuck jobs
   - Verify **Scale Strategy**: Active=1, Max=3, Idle=600s

4. **Test with warmup**:
   ```bash
   ./warmup-runpod.sh
   ```

5. **Verify in Vercel**:
   - Test `/api/voice/sesame` endpoint
   - Should return >100KB WAV file instead of 9KB beep

## Expected Timeline

- Build: 5-10 minutes
- First warmup: 1-2 minutes (model loading)
- Subsequent requests: <5 seconds

## Troubleshooting

If still seeing errors after rebuild:
1. Check worker logs for new error messages
2. Verify HF_TOKEN and HUGGINGFACE_HUB_TOKEN are set in Releases
3. Ensure build used the updated Dockerfile (check build logs)