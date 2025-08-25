# --- BOOTSTRAP (crash-proof worker) ---
import os, sys, time, traceback
import hashlib, pathlib

_fp = hashlib.md5(pathlib.Path(__file__).read_bytes()).hexdigest()[:12]
print(f"BOOT: handler.py md5 {_fp}", flush=True)
print("BOOT[0] starting python", sys.version, flush=True)

def fatal(e, stage):
    print(f"FATAL[{stage}]: {type(e).__name__}: {e}", flush=True)
    traceback.print_exc()
    # keep worker alive so logs are visible
    print("HALT: entering debug sleep loop; worker stays alive for logs.", flush=True)
    while True:
        time.sleep(30)

try:
    print("BOOT[1] importing deps...", flush=True)
    import io, base64
    import numpy as np
    import torch
    import soundfile as sf
    from runpod import serverless
    from transformers import __version__ as hf_version
    print("BOOT[1] OK torch", torch.__version__, "| hf", hf_version, flush=True)
except Exception as e:
    fatal(e, "import")

try:
    print("BOOT[2] prep device...", flush=True)
    MODEL_ID = os.getenv("SESAME_MODEL", "sesame/csm-1b")
    # Modern HF auth: prefer HUGGINGFACE_HUB_TOKEN, fallback to HF_TOKEN
    HF_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN") or os.getenv("HF_TOKEN") or ""
    print(f"HF token present: {bool(HF_TOKEN)}", flush=True)
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    USE_FP16 = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
    DTYPE = torch.float16 if USE_FP16 else torch.float32

    _model = None
    _processor = None

    print("🔊 Booting Sesame RunPod worker...", flush=True)
    print("📦 Model:", MODEL_ID, "| Device:", DEVICE, "| FP16:", str(USE_FP16), flush=True)
    print("BOOT[2] device setup OK", flush=True)
except Exception as e:
    fatal(e, "device_setup")

def load_model():
    global _model, _processor
    if _model is not None:
        return _model, _processor
    
    print("🚀 Loading Sesame TTS model...", flush=True)
    
    try:
        if not HF_TOKEN:
            raise RuntimeError("HF_TOKEN missing")
        
        start = time.time()
        
        # Use the correct imports for Sesame CSM
        from transformers import CsmForConditionalGeneration, AutoProcessor
        
        _processor = AutoProcessor.from_pretrained(MODEL_ID, token=HF_TOKEN)
        _model = CsmForConditionalGeneration.from_pretrained(
            MODEL_ID,
            token=HF_TOKEN,
            device_map="auto" if DEVICE == "cuda" else None,
            torch_dtype=DTYPE
        )
        
        if DEVICE == "cuda" and not hasattr(_model, 'device_map'):
            _model = _model.to(DEVICE)
        
        _model.eval()
        print(f"✅ Model loaded successfully in {time.time() - start:.1f}s", flush=True)
        print("BOOT[3] model loaded.", flush=True)
        return _model, _processor
        
    except Exception as e:
        fatal(e, "model_load")

def synthesize_wav_bytes(text: str) -> bytes:
    model, processor = load_model()
    
    # CSM expects "[0]" prefix for voice ID
    text_with_voice = f"[0]{text}"
    
    # Process text
    inputs = processor(
        text_with_voice,
        add_special_tokens=True,
        return_tensors="pt"
    )
    
    # Move to device
    if hasattr(model, 'device'):
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
    else:
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
    
    # Generate audio
    with torch.no_grad():
        outputs = model.generate(**inputs, output_audio=True)
    
    # Extract audio array
    audio_array = outputs["audios"][0]  # shape: (samples,)
    
    # Convert to WAV bytes
    buffer = io.BytesIO()
    # Sesame CSM outputs at 24kHz
    sf.write(buffer, audio_array, samplerate=24000, subtype='PCM_16', format='WAV')
    buffer.seek(0)
    return buffer.read()

def handler(job):
    """RunPod handler function"""
    job_input = job.get("input", {})
    text = job_input.get("text", "").strip()
    
    if not text:
        return {"ok": False, "error": "No text provided"}
    
    print(f"🎤 Synthesizing: {text[:50]}...", flush=True)
    
    try:
        audio_bytes = synthesize_wav_bytes(text)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        print(f"✅ Generated {len(audio_bytes)} bytes of audio", flush=True)
        
        return {
            "ok": True,
            "audio_base64": audio_b64,
            "sample_rate": 24000,
            "format": "wav"
        }
    
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"❌ Generation failed: {error_msg}", flush=True)
        traceback.print_exc()
        return {"ok": False, "error": error_msg}

# Start the serverless worker
serverless.start({"handler": handler})