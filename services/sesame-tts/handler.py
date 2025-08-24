import io, base64, wave, os
from runpod import serverless

def _silent_wav_bytes(duration_ms=300, sr=16000):
    frames = int(sr * (duration_ms / 1000))
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)  # 16-bit PCM
        w.setframerate(sr)
        w.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()

@serverless.handler()
def handler(event):
    # TODO: replace with real Sesame synth once the pipeline is green
    audio = _silent_wav_bytes()
    return {
        "audio_base64": base64.b64encode(audio).decode("utf-8"),
        "mime_type": "audio/wav",
        "ok": True
    }

# Start the RunPod loop (this was the missing line)
serverless.start({"handler": handler})