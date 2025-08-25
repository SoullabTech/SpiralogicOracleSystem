import os, io, base64, time
import torch
import soundfile as sf

# IMPORTANT: use the exact classes your Sesame model exposes.
# If your repo uses different names, swap these imports accordingly.
from transformers import AutoTokenizer, AutoModelForTextToWaveform  # <-- keep if valid for your model

from runpod import serverless

MODEL_ID      = os.getenv("SESAME_MODEL", "sesame/csm-1b")
HF_TOKEN      = os.getenv("HF_TOKEN", "")
DEVICE        = "cuda" if torch.cuda.is_available() else "cpu"
USE_FP16      = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
DTYPE         = torch.float16 if USE_FP16 else torch.float32

_tokenizer = None
_model     = None

def load_model():
    global _tokenizer, _model
    if _model is not None:
        return _tokenizer, _model

    print("🔊 Booting Sesame RunPod worker...", flush=True)
    print("📦 Model:", MODEL_ID, "| Device:", DEVICE, "| FP16:", str(USE_FP16), flush=True)

    # Hugging Face auth
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN missing")

    torch.set_grad_enabled(False)

    # ↓↓↓ Replace with the correct Sesame load calls if they differ
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
    _model = AutoModelForTextToWaveform.from_pretrained(
        MODEL_ID,
        torch_dtype=DTYPE,
        use_auth_token=HF_TOKEN
    ).to(DEVICE)

    _model.eval()

    print("✅ Model loaded successfully", flush=True)
    return _tokenizer, _model

def synthesize_wav_bytes(text: str) -> bytes:
    tokenizer, model = load_model()

    # ↓↓↓ Replace with your model's real inference call
    # Example: tokens = tokenizer(text, return_tensors="pt").to(DEVICE)
    tokens = tokenizer(text, return_tensors="pt").to(DEVICE)

    # Example forward pass. Replace with model.generate()/forward() as required.
    # Expect a raw waveform tensor at 16 kHz mono.
    with torch.inference_mode():
        # Hypothetical API: model(**tokens).waveform  -> (1, samples)
        out = model(**tokens)
        waveform = out.waveform  # torch.Tensor [1, N] on DEVICE
        if waveform.dim() == 2:
            waveform = waveform[0]
        waveform = waveform.detach().to("cpu").float().clamp(-1, 1).numpy()

    # Encode to WAV (16-bit PCM, 16 kHz)
    buf = io.BytesIO()
    sf.write(buf, waveform, 16000, format="WAV", subtype="PCM_16")
    return buf.getvalue()

def sine_fallback(duration_sec=0.30, freq=880, sr=16000):
    import math, array
    length = int(duration_sec * sr)
    # 16-bit PCM mono
    data = array.array('h', (
        int(0.1 * 32767 * math.sin(2 * math.pi * freq * t / sr))
        for t in range(length)
    ))
    buf = io.BytesIO()
    sf.write(buf, data, sr, format="WAV", subtype="PCM_16")
    return buf.getvalue()

@serverless.handler()
def handler(event):
    try:
        text = ((event or {}).get("input") or {}).get("text", "Hello from Sesame")
        text = (text or "").strip()
        if not text:
            text = "Hello from Sesame"

        print("🎤 Synthesizing:", text[:80] + ("..." if len(text) > 80 else ""), flush=True)

        try:
            wav_bytes = synthesize_wav_bytes(text)
            b64 = base64.b64encode(wav_bytes).decode("utf-8")
            return {
                "ok": True,
                "mime_type": "audio/wav",
                "audio_base64": b64,
                "length": len(wav_bytes)
            }
        except Exception as model_err:
            # Return audible tone so you *hear* something even if model fails
            print("⚠️ Model failed, returning fallback tone:", str(model_err), flush=True)
            fb = sine_fallback()
            b64 = base64.b64encode(fb).decode("utf-8")
            return {
                "ok": False,
                "mime_type": "audio/wav",
                "audio_base64": b64,
                "length": len(fb),
                "error": str(model_err)
            }

    except Exception as e:
        msg = str(e)
        print("❌ Error:", msg, flush=True)
        return {"ok": False, "error": msg}

# Keep the loop alive
serverless.start({"handler": handler})