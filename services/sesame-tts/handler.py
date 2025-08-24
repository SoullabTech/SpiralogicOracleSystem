import sys, time
print("🔊 Booting Sesame RunPod worker stub...", flush=True)

from runpod import serverless

def handler(event):
    # minimal stub: return 300ms of silence (WAV)
    import io, wave
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
        w.writeframes(b'\x00\x00' * int(0.3 * 16000))
    buf.seek(0)
    return {"mime_type": "audio/wav", "audio_base64": __import__("base64").b64encode(buf.read()).decode()}

# keep the worker alive
serverless.start({"handler": handler})
print("✅ serverless.start() called; worker loop running.", flush=True)