#!/usr/bin/env python3
"""
Sesame Cloud Service - Lightweight TTS for Production
Optimized for cloud deployment (Render/Railway/Fly.io)
"""
import os
import base64
import io
import logging
import time
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from gtts import gTTS
import tempfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Sesame TTS Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"
    format: str = "mp3"
    speed: float = 0.95
    
class CIShapeRequest(BaseModel):
    text: str
    style: str = "neutral"
    archetype: str = "guide"
    meta: Dict[str, Any] = {}
    voiceParams: Optional[Dict[str, Any]] = None
    emotionalContext: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    return {"service": "Sesame TTS", "status": "online", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "sesame-tts",
        "timestamp": time.time(),
        "capabilities": ["tts", "ci-shape"]
    }

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Generate speech from text using Google TTS"""
    try:
        logger.info(f"TTS request for: {request.text[:50]}...")
        
        # Use gTTS for simple, reliable TTS
        tts = gTTS(text=request.text, lang='en', slow=False)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_file:
            tts.save(tmp_file.name)
            tmp_file.seek(0)
            
            # Read and encode audio
            with open(tmp_file.name, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.unlink(tmp_file.name)
        
        # Return audio as base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio": audio_base64,
            "format": "mp3",
            "duration": len(request.text) * 0.06,  # Rough estimate
            "voice": request.voice
        }
        
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ci/shape")
async def shape_intelligence(request: CIShapeRequest):
    """Shape conversational response with elemental intelligence"""
    try:
        text = request.text
        style = request.style
        
        # Apply elemental shaping
        elemental_adjustments = {
            "fire": {"energy": 0.9, "pace": 1.1, "emphasis": "passionate"},
            "water": {"energy": 0.6, "pace": 0.9, "emphasis": "flowing"},
            "earth": {"energy": 0.7, "pace": 0.85, "emphasis": "grounded"},
            "air": {"energy": 0.8, "pace": 1.05, "emphasis": "clear"},
            "aether": {"energy": 0.75, "pace": 0.95, "emphasis": "mystical"}
        }
        
        adjustments = elemental_adjustments.get(style, {
            "energy": 0.75, "pace": 0.95, "emphasis": "balanced"
        })
        
        # Shape the text (in production, this would do more sophisticated processing)
        shaped_text = text
        
        # Add subtle markers for voice modulation
        if style == "fire":
            shaped_text = f"*with conviction* {shaped_text}"
        elif style == "water":
            shaped_text = f"*gently* {shaped_text}"
        elif style == "earth":
            shaped_text = f"*steadily* {shaped_text}"
        elif style == "air":
            shaped_text = f"*clearly* {shaped_text}"
        elif style == "aether":
            shaped_text = f"*mysteriously* {shaped_text}"
        
        return {
            "shaped_text": shaped_text,
            "original_text": text,
            "style": style,
            "voice_params": {
                "rate": adjustments.get("pace", 0.95),
                "pitch": 1.0,
                "volume": adjustments.get("energy", 0.75),
                "emphasis": adjustments.get("emphasis", "balanced")
            },
            "processing_time": 0.05
        }
        
    except Exception as e:
        logger.error(f"CI Shape error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/speak")
async def voice_speak(request: TTSRequest):
    """Compatibility endpoint for voice synthesis"""
    return await text_to_speech(request)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)