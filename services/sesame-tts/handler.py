import os, io, base64, time
import torch
import numpy as np
import soundfile as sf
from transformers import pipeline
from runpod import serverless

MODEL_ID = os.getenv("SESAME_MODEL", "sesame/csm-1b")
HF_TOKEN = os.getenv("HF_TOKEN", "")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
USE_FP16 = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
DTYPE = torch.float16 if USE_FP16 else torch.float32

_pipeline = None

def load_model():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    print("🔊 Booting Sesame RunPod worker...", flush=True)
    print("📦 Model:", MODEL_ID, "| Device:", DEVICE, "| FP16:", str(USE_FP16), flush=True)

    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN missing")

    print("🔄 Loading Sesame TTS model...", flush=True)
    start = time.time()
    
    # Use the text-to-speech pipeline
    _pipeline = pipeline(
        "text-to-speech",
        model=MODEL_ID,
        torch_dtype=DTYPE,
        device=0 if DEVICE == "cuda" else -1,
        use_auth_token=HF_TOKEN
    )
    
    print(f"✅ Model loaded successfully in {time.time() - start:.1f}s", flush=True)
    return _pipeline

def synthesize_wav_bytes(text: str) -> bytes:
    """Generate audio using the TTS pipeline"""
    tts = load_model()
    
    # Call the pipeline - it returns dict with 'audio' and 'sampling_rate'
    result = tts(text)
    
    # Extract audio array and sample rate
    if isinstance(result, dict):
        audio = result.get("audio", None)
        sample_rate = result.get("sampling_rate", 16000)
    else:
        # Some models return the audio directly
        audio = result
        sample_rate = 16000
    
    # Ensure audio is numpy array
    if torch.is_tensor(audio):
        audio = audio.cpu().numpy()
    
    # Handle different audio shapes
    if audio.ndim > 1:
        audio = audio.squeeze()  # Remove extra dimensions
    
    # Normalize audio to [-1, 1] range if needed
    if audio.dtype == np.int16:
        audio = audio.astype(np.float32) / 32768.0
    elif audio.max() > 1.0 or audio.min() < -1.0:
        audio = np.clip(audio / np.abs(audio).max(), -1.0, 1.0)
    
    # Convert to 16-bit PCM WAV
    buf = io.BytesIO()
    sf.write(buf, audio, sample_rate, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()

def sine_fallback(duration_sec=0.30, freq=880, sr=16000):
    """Generate a tone to indicate fallback mode"""
    import math
    t = np.arange(int(duration_sec * sr)) / sr
    audio = 0.3 * np.sin(2 * np.pi * freq * t)
    
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()

@serverless.handler()
def handler(event):
    try:
        text = ((event or {}).get("input") or {}).get("text", "Hello from Sesame")
        text = (text or "").strip()
        if not text:
            text = "Hello from Sesame"

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
            # Return audible tone so you hear the fallback
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

# Start the serverless handler
serverless.start({"handler": handler})