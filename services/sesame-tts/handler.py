# Minimal RunPod worker: returns 300ms of silence (WAV)
import base64
import io
import wave
from runpod import serverless

def _silence_wav_bytes(ms=300, rate=16000):
    n_samples = int(rate * ms / 1000)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)      # 16-bit PCM
        wf.setframerate(rate)
        wf.writeframes(b"\x00\x00" * n_samples)
    return buf.getvalue()

@serverless.handler()
def handler(event):
    # event: {"input": {"text": "..."}}  (text is ignored in stub)
    audio = _silence_wav_bytes()
    return {
        "audio_base64": base64.b64encode(audio).decode("utf-8"),
        "mime_type": "audio/wav"
    }

# start the RunPod loop
serverless.start({"handler": handler})