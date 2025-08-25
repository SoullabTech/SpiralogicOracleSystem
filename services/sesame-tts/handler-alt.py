import os, io, base64, time
import torch
import numpy as np
import soundfile as sf
from runpod import serverless

MODEL_ID = os.getenv("SESAME_MODEL", "sesame/csm-1b")
HF_TOKEN = os.getenv("HF_TOKEN", "")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
USE_FP16 = os.getenv("SESAME_FP16", "1") == "1" and DEVICE == "cuda"
DTYPE = torch.float16 if USE_FP16 else torch.float32

_model = None
_processor = None

def load_model():
    global _model, _processor
    if _model is not None:
        return _model, _processor

    print("🔊 Booting Sesame RunPod worker...", flush=True)
    print("📦 Model:", MODEL_ID, "| Device:", DEVICE, "| FP16:", str(USE_FP16), flush=True)

    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN missing")

    print("🔄 Loading Sesame TTS model...", flush=True)
    start = time.time()
    
    try:
        # Try loading as a speech model first
        from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
        
        _processor = SpeechT5Processor.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
        _model = SpeechT5ForTextToSpeech.from_pretrained(
            MODEL_ID, 
            torch_dtype=DTYPE,
            use_auth_token=HF_TOKEN
        ).to(DEVICE)
        
        # Also load vocoder if needed
        vocoder = SpeechT5HifiGan.from_pretrained(
            "microsoft/speecht5_hifigan",
            torch_dtype=DTYPE,
            use_auth_token=HF_TOKEN
        ).to(DEVICE)
        
        print(f"✅ Loaded as SpeechT5 model in {time.time() - start:.1f}s", flush=True)
        return _model, _processor, vocoder
        
    except Exception as e1:
        print(f"Not a SpeechT5 model: {e1}", flush=True)
        
        try:
            # Try as a general seq2seq model
            from transformers import AutoProcessor, AutoModelForTextToWaveform
            
            _processor = AutoProcessor.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
            _model = AutoModelForTextToWaveform.from_pretrained(
                MODEL_ID,
                torch_dtype=DTYPE,
                use_auth_token=HF_TOKEN
            ).to(DEVICE)
            
            print(f"✅ Loaded as TextToWaveform model in {time.time() - start:.1f}s", flush=True)
            return _model, _processor, None
            
        except Exception as e2:
            print(f"Not a TextToWaveform model: {e2}", flush=True)
            
            # Try as a generic model
            from transformers import AutoTokenizer, AutoModel
            
            _processor = AutoTokenizer.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
            _model = AutoModel.from_pretrained(
                MODEL_ID,
                torch_dtype=DTYPE,
                use_auth_token=HF_TOKEN
            ).to(DEVICE)
            
            print(f"✅ Loaded as generic model in {time.time() - start:.1f}s", flush=True)
            return _model, _processor, None

def synthesize_wav_bytes(text: str) -> bytes:
    """Generate audio using the loaded model"""
    result = load_model()
    
    if len(result) == 3:
        model, processor, vocoder = result
        
        # SpeechT5 style
        inputs = processor(text=text, return_tensors="pt").to(DEVICE)
        
        # You might need speaker embeddings
        # speaker_embeddings = torch.zeros((1, 512)).to(DEVICE)
        
        with torch.no_grad():
            speech = model.generate(**inputs)
            if vocoder:
                speech = vocoder(speech)
        
        audio = speech.squeeze().cpu().numpy()
        
    else:
        model, processor = result
        
        # Generic TTS model
        inputs = processor(text, return_tensors="pt").to(DEVICE)
        
        with torch.no_grad():
            # Try different output methods
            if hasattr(model, 'generate'):
                outputs = model.generate(**inputs)
            elif hasattr(model, 'forward'):
                outputs = model(**inputs)
            else:
                raise RuntimeError("Model has no generate or forward method")
            
            # Extract audio from outputs
            if hasattr(outputs, 'waveform'):
                audio = outputs.waveform
            elif hasattr(outputs, 'audio'):
                audio = outputs.audio
            elif hasattr(outputs, 'logits'):
                # Some models return mel spectrograms that need vocoding
                raise RuntimeError("Model returns logits/spectrograms - needs vocoder")
            elif torch.is_tensor(outputs):
                audio = outputs
            else:
                raise RuntimeError(f"Unknown output type: {type(outputs)}")
        
        if torch.is_tensor(audio):
            audio = audio.squeeze().cpu().numpy()
    
    # Normalize and convert to WAV
    if audio.dtype == np.int16:
        audio = audio.astype(np.float32) / 32768.0
    elif audio.max() > 1.0 or audio.min() < -1.0:
        audio = np.clip(audio / np.abs(audio).max(), -1.0, 1.0)
    
    buf = io.BytesIO()
    sf.write(buf, audio, 16000, format="WAV", subtype="PCM_16")
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

serverless.start({"handler": handler})