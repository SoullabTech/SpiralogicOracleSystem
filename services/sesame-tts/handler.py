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
    HF_TOKEN = os.getenv("HF_TOKEN", "")
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    USE_FP16 = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
    DTYPE = torch.float16 if USE_FP16 else torch.float32

    _model = None
    _tokenizer = None

    print("🔊 Booting Sesame RunPod worker...", flush=True)
    print("📦 Model:", MODEL_ID, "| Device:", DEVICE, "| FP16:", str(USE_FP16), flush=True)
    print("BOOT[2] device setup OK", flush=True)
except Exception as e:
    fatal(e, "device_setup")

def load_model():
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer

    try:
        print("BOOT[3] loading model...", flush=True)
        
        if not HF_TOKEN:
            raise RuntimeError("HF_TOKEN missing")

        print("🔄 Loading Sesame TTS model...", flush=True)
        start = time.time()
        
        from transformers import AutoTokenizer, AutoModel
        
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
        _model = AutoModel.from_pretrained(
            MODEL_ID,
            torch_dtype=DTYPE,
            use_auth_token=HF_TOKEN
        ).to(DEVICE)
        
        _model.eval()
        print(f"✅ Model loaded successfully in {time.time() - start:.1f}s", flush=True)
        print("BOOT[3] model loaded.", flush=True)
        return _model, _tokenizer
        
    except Exception as e:
        fatal(e, "model_load")

def synthesize_wav_bytes(text: str) -> bytes:
    """Generate audio - will fall back to tone if model fails"""
    model, tokenizer = load_model()
    
    # Basic tokenization
    inputs = tokenizer(text, return_tensors="pt").to(DEVICE)
    
    with torch.no_grad():
        # Try to get audio output from the model
        outputs = model(**inputs)
        
        # This is where we'd need to know the exact Sesame model output format
        # For now, let's see what the model actually returns
        print(f"🔍 Model output type: {type(outputs)}", flush=True)
        if hasattr(outputs, '__dict__'):
            print(f"🔍 Output attributes: {list(outputs.__dict__.keys())}", flush=True)
        
        # Try common audio output patterns
        audio = None
        if hasattr(outputs, 'waveform'):
            audio = outputs.waveform
        elif hasattr(outputs, 'audio'):
            audio = outputs.audio
        elif hasattr(outputs, 'last_hidden_state'):
            # Some models need additional processing
            raise RuntimeError("Model returns hidden states - needs vocoder/post-processing")
        else:
            raise RuntimeError(f"Unknown model output format: {type(outputs)}")
    
    # Process audio tensor to WAV bytes
    if torch.is_tensor(audio):
        audio = audio.squeeze().cpu().numpy()
    
    # Ensure proper audio format
    if audio.dtype != np.float32:
        audio = audio.astype(np.float32)
    
    # Normalize if needed
    if np.abs(audio).max() > 1.0:
        audio = audio / np.abs(audio).max()
    
    # Convert to WAV
    buf = io.BytesIO()
    sf.write(buf, audio, 16000, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()

def sine_fallback(duration_sec=0.5, freq=880, sr=16000):
    """Generate fallback tone"""
    t = np.arange(int(duration_sec * sr)) / sr
    audio = 0.3 * np.sin(2 * np.pi * freq * t).astype(np.float32)
    
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()

def handler(event):
    try:
        text = ((event or {}).get("input") or {}).get("text", "Hello from Sesame")
        text = (text or "").strip() or "Hello from Sesame"

        print(f"🎤 Synthesizing: {text[:80]}{'...' if len(text) > 80 else ''}", flush=True)

        try:
            wav_bytes = synthesize_wav_bytes(text)
            print(f"✅ Generated {len(wav_bytes)} bytes of audio", flush=True)
            
            return {
                "ok": True,
                "mime_type": "audio/wav",
                "audio_base64": base64.b64encode(wav_bytes).decode("utf-8"),
                "length": len(wav_bytes)
            }
        except Exception as model_err:
            print(f"⚠️ Model failed, returning fallback tone: {str(model_err)}", flush=True)
            fb = sine_fallback()
            
            return {
                "ok": False,
                "mime_type": "audio/wav",
                "audio_base64": base64.b64encode(fb).decode("utf-8"),
                "length": len(fb),
                "error": str(model_err)
            }

    except Exception as e:
        print(f"❌ Error: {str(e)}", flush=True)
        return {"ok": False, "error": str(e)}

if __name__ == "__main__":
    print("Starting Serverless Worker", flush=True)
    serverless.start({"handler": handler})