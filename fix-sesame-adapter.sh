#!/bin/bash

# Quick fix script if RunPod returns audio at top level instead of in output

echo "🔧 Sesame Adapter Field Mapping Fix"
echo ""

# Check current adapter
echo "Current pickBase64Audio function checks these fields:"
echo "- output.audio_base64"
echo "- output.audio_b64"
echo "- output.audio.base64"
echo "- output.wavBase64"
echo "- output.wav_base64"
echo "- output.data.audio_base64"
echo ""

echo "If your RunPod worker returns fields at the top level (not in output),"
echo "you need to update the handler to nest them properly."
echo ""

echo "Handler should return:"
echo '{"ok": true, "audio_base64": "...", "mime_type": "audio/wav"}'
echo ""
echo "RunPod will wrap this as:"
echo '{"status": "COMPLETED", "output": {"ok": true, "audio_base64": "...", "mime_type": "audio/wav"}}'
echo ""

# Show current handler return
echo "Current handler.py return statement:"
grep -A 5 "return {" services/sesame-tts/handler.py 2>/dev/null || echo "(handler.py not found in expected location)"