# services/sesame-tts/handler.py
import sys, os, io, base64
print("🔊 Booting Sesame RunPod worker...", flush=True)

import torch
import soundfile as sf
from runpod import serverless
from transformers import AutoTokenizer, AutoModelForTextToWaveform

# Configuration
MODEL_ID = os.getenv("SESAME_MODEL", "sesame/csm-1b")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
USE_FP16 = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
DTYPE = torch.float16 if USE_FP16 else torch.float32

print(f"📦 Model: {MODEL_ID} | Device: {DEVICE} | FP16: {USE_FP16}", flush=True)

# Lazy-load model
_tokenizer = None
_model = None

def load_model():
    global _tokenizer, _model
    if _model is None:
        print("🔄 Loading Sesame model...", flush=True)
        auth_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if not auth_token:
            raise ValueError("HF_TOKEN or HUGGINGFACE_TOKEN required")
        
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_auth_token=auth_token)
        _model = AutoModelForTextToWaveform.from_pretrained(
            MODEL_ID, 
            use_auth_token=auth_token,
            torch_dtype=DTYPE
        ).to(DEVICE)
        print("✅ Model loaded successfully", flush=True)
    return _tokenizer, _model

def handler(event):
    try:
        # Extract text from event
        text = ((event or {}).get("input") or {}).get("text", "Hello from Sesame")
        print(f"🎤 Synthesizing: {text[:50]}...", flush=True)
        
        # Load model and generate
        tokenizer, model = load_model()
        inputs = tokenizer(text, return_tensors="pt").to(DEVICE)
        
        with torch.no_grad():
            audio = model.generate(**inputs)
        
        # Convert to numpy and ensure proper shape
        audio = audio[0].detach().cpu().numpy()
        
        # Save as WAV
        buf = io.BytesIO()
        sf.write(buf, audio, 16000, format="WAV", subtype="PCM_16")
        buf.seek(0)
        
        return {
            "audio_base64": base64.b64encode(buf.read()).decode("utf-8"),
            "mime_type": "audio/wav",
            "ok": True
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}", flush=True)
        return {"ok": False, "error": str(e)}

# Start the RunPod loop
serverless.start({"handler": handler})
print("✅ Worker ready to serve Maya's voice!", flush=True)