# services/sesame-tts/handler.py
import base64, io, struct
from runpod import serverless

def _tiny_wav_silence(duration_ms=200):
    sr = 16000
    n = int(sr * duration_ms / 1000)
    # 16-bit PCM mono silence
    with io.BytesIO() as b:
        # RIFF header
        b.write(b"RIFF")
        b.write(struct.pack("<I", 36 + n * 2))
        b.write(b"WAVEfmt ")
        b.write(struct.pack("<IHHIIHH", 16, 1, 1, sr, sr * 2, 2, 16))
        b.write(b"data")
        b.write(struct.pack("<I", n * 2))
        b.write(b"\x00\x00" * n)
        return b.getvalue()

@serverless.handler()
def handler(event):
    text = ((event or {}).get("input") or {}).get("text", "hello")
    wav = _tiny_wav_silence(300)  # 300 ms silence just to validate pipeline
    return {
        "ok": True,
        "echo": text,
        "mime_type": "audio/wav",
        "audio_base64": base64.b64encode(wav).decode("utf-8"),
    }