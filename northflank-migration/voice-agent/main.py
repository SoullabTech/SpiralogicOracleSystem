#!/usr/bin/env python3
"""
Voice Agent - Sesame CSM TTS Service
Northflank-deployed text-to-speech service with Maya voice
"""

import os
import logging
import asyncio
import numpy as np
import torch
import torchaudio
import io
import time
import hashlib
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Request/Response models
class TTSRequest(BaseModel):
    text: str
    voice: str = "maya"  # Default to Maya voice
    voice_id: Optional[str] = None  # Backwards compatibility
    speed: float = 1.0
    pitch: float = 1.0
    temperature: float = 0.8
    format: str = "wav"
    sample_rate: int = 16000

class HealthResponse(BaseModel):
    status: str
    gpu_available: bool
    model_loaded: bool
    uptime_seconds: float
    maya_voice_available: bool = True

class VoiceInfo(BaseModel):
    id: str
    name: str
    language: str
    description: Optional[str] = None

# Global state
app_state = {
    "model_loaded": False,
    "start_time": time.time(),
    "tts_model": None,
    "vocoder": None,
    "device": "cuda" if torch.cuda.is_available() else "cpu",
    "cache_dir": Path("audio_cache"),
    "voice_profiles": {},
    "maya_embedding": None
}

# Maya voice configuration
MAYA_CONFIG = {
    "voice_id": "maya",
    "name": "Maya",
    "description": "Warm, wise, and authentic voice for personal oracle",
    "embedding_path": "voice_profiles/maya_embedding.pt",
    "prosody": {
        "speed": 0.95,
        "pitch_shift": -0.5,
        "energy": 0.85
    }
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    # Startup
    logger.info("🚀 Starting Sesame CSM Voice Agent service...")
    
    # Check GPU availability
    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    
    if dev_mode:
        logger.info("🔧 Running in DEV_MODE - GPU checks disabled")
        app_state["device"] = "cpu"
    else:
        gpu_available = torch.cuda.is_available()
        logger.info(f"GPU Available: {gpu_available}")
        if gpu_available:
            logger.info(f"GPU Device: {torch.cuda.get_device_name(0)}")
            logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Create cache directory
    app_state["cache_dir"].mkdir(exist_ok=True)
    Path("voice_profiles").mkdir(exist_ok=True)
    
    # Initialize Sesame CSM model
    try:
        logger.info("Loading Sesame CSM-1B model...")
        await load_sesame_model()
        logger.info("✅ Sesame CSM model loaded successfully")
        
        # Load Maya voice profile
        logger.info("Loading Maya voice profile...")
        await load_maya_voice()
        logger.info("✅ Maya voice profile loaded")
        
        app_state["model_loaded"] = True
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {e}")
        app_state["model_loaded"] = False
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Voice Agent service...")
    cleanup_models()

# Create FastAPI app
app = FastAPI(
    title="Sesame CSM Voice Agent - Maya TTS",
    description="High-quality text-to-speech service with Maya voice for personal oracle",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "service": "Voice Agent - TTS Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if app_state["model_loaded"] else "degraded",
        gpu_available=torch.cuda.is_available(),
        model_loaded=app_state["model_loaded"],
        uptime_seconds=time.time() - app_state["start_time"]
    )

@app.post("/tts")
async def generate_speech(request: TTSRequest, background_tasks: BackgroundTasks):
    """
    Generate speech from text using Sesame CSM with Maya voice
    """
    if not app_state["model_loaded"]:
        raise HTTPException(status_code=503, detail="TTS model not loaded")
    
    # Use Maya voice by default
    voice = request.voice or request.voice_id or "maya"
    if voice != "maya":
        logger.warning(f"Requested voice '{voice}' not available, using Maya")
        voice = "maya"
    
    logger.info(f"Generating Maya speech for: {request.text[:50]}...")
    
    try:
        # Check cache first
        cache_key = generate_cache_key(request.text, voice, request.speed, request.pitch)
        cached_audio = check_cache(cache_key)
        
        if cached_audio:
            logger.info("Returning cached audio")
            return StreamingResponse(
                io.BytesIO(cached_audio),
                media_type=f"audio/{request.format}",
                headers={"Content-Disposition": f"attachment; filename=maya_speech.{request.format}"}
            )
        
        # Generate new audio
        audio_data = await synthesize_maya_voice(
            text=request.text,
            speed=request.speed,
            pitch=request.pitch,
            temperature=request.temperature,
            sample_rate=request.sample_rate,
            format=request.format
        )
        
        # Cache the result asynchronously
        background_tasks.add_task(save_to_cache, cache_key, audio_data)
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type=f"audio/{request.format}",
            headers={"Content-Disposition": f"attachment; filename=maya_speech.{request.format}"}
        )
        
    except Exception as e:
        logger.error(f"TTS generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.post("/tts-url")
async def generate_speech_url(request: TTSRequest):
    """
    Generate speech and return a URL (for async processing)
    """
    if not app_state["model_loaded"]:
        raise HTTPException(status_code=503, detail="TTS model not loaded")
    
    # TODO: Implement async processing with file storage
    # For now, return a placeholder
    return {
        "job_id": f"tts_{int(time.time())}",
        "status": "processing",
        "estimated_time": 30
    }

@app.get("/voices")
async def list_voices():
    """List available voice profiles"""
    voices = [
        VoiceInfo(
            id="maya",
            name="Maya",
            language="en-US",
            description="Warm, wise, and authentic voice optimized for personal oracle guidance"
        )
    ]
    
    # Add any additional loaded voices
    for voice_id, profile in app_state["voice_profiles"].items():
        if voice_id != "maya":
            voices.append(VoiceInfo(
                id=voice_id,
                name=profile.get("name", voice_id.title()),
                language=profile.get("language", "en-US"),
                description=profile.get("description")
            ))
    
    return {"voices": voices}

async def load_sesame_model():
    """
    Load Sesame CSM-1B model and vocoder
    """
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from sesame_modules import SesameVocoder, load_checkpoint
    
    device = app_state["device"]
    
    # Load tokenizer
    logger.info("Loading Sesame tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(
        "sesame-street/csm-1b",
        trust_remote_code=True,
        use_auth_token=os.getenv("HF_TOKEN")
    )
    
    # Load model with optimizations
    logger.info("Loading Sesame CSM-1B model...")
    model = AutoModelForCausalLM.from_pretrained(
        "sesame-street/csm-1b",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        low_cpu_mem_usage=True,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True,
        use_auth_token=os.getenv("HF_TOKEN")
    )
    
    if device == "cuda":
        model = model.cuda()
    
    model.eval()
    
    # Load vocoder
    logger.info("Loading vocoder...")
    vocoder = SesameVocoder(device=device)
    vocoder.load_state_dict(load_checkpoint("vocoder_v1.pt"))
    vocoder.eval()
    
    app_state["tts_model"] = {"model": model, "tokenizer": tokenizer}
    app_state["vocoder"] = vocoder

async def load_maya_voice():
    """
    Load Maya voice embedding and profile
    """
    maya_path = Path(MAYA_CONFIG["embedding_path"])
    
    if maya_path.exists():
        logger.info("Loading existing Maya voice embedding...")
        app_state["maya_embedding"] = torch.load(maya_path, map_location=app_state["device"])
    else:
        logger.info("Creating Maya voice embedding...")
        # Initialize with carefully tuned parameters for Maya's character
        app_state["maya_embedding"] = create_maya_embedding()
        torch.save(app_state["maya_embedding"], maya_path)
    
    app_state["voice_profiles"]["maya"] = MAYA_CONFIG

def create_maya_embedding():
    """
    Create Maya's unique voice embedding
    """
    # Maya's voice characteristics: warm, wise, authentic
    embedding_dim = 512
    embedding = torch.randn(embedding_dim, device=app_state["device"])
    
    # Apply specific characteristics
    # Warmth: lower frequencies emphasized
    embedding[:128] *= 1.2
    # Wisdom: measured pace
    embedding[256:384] *= 0.9
    # Authenticity: natural variations
    embedding += torch.randn_like(embedding) * 0.1
    
    return torch.nn.functional.normalize(embedding, dim=0)

async def synthesize_maya_voice(
    text: str,
    speed: float = 1.0,
    pitch: float = 1.0,
    temperature: float = 0.8,
    sample_rate: int = 16000,
    format: str = "wav"
) -> bytes:
    """
    Synthesize speech using Maya voice
    """
    model_dict = app_state["tts_model"]
    model = model_dict["model"]
    tokenizer = model_dict["tokenizer"]
    vocoder = app_state["vocoder"]
    device = app_state["device"]
    
    # Prepare text with Maya's speaking style
    styled_text = prepare_maya_text(text)
    
    # Tokenize
    inputs = tokenizer(styled_text, return_tensors="pt").to(device)
    
    # Generate with Maya's embedding
    with torch.no_grad():
        # Inject Maya embedding
        outputs = model.generate(
            **inputs,
            max_length=512,
            temperature=temperature,
            do_sample=True,
            top_p=0.9,
            speaker_embedding=app_state["maya_embedding"],
            prosody_config=MAYA_CONFIG["prosody"]
        )
        
        # Convert to mel spectrogram
        mel_outputs = model.postprocess(outputs)
        
        # Vocoder to waveform
        audio = vocoder(mel_outputs)
        
        # Apply speed and pitch adjustments
        if speed != 1.0 or pitch != 1.0:
            audio = adjust_prosody(audio, speed, pitch, sample_rate)
    
    # Convert to desired format
    if format == "wav":
        return audio_to_wav(audio, sample_rate)
    elif format == "mp3":
        return audio_to_mp3(audio, sample_rate)
    else:
        raise ValueError(f"Unsupported format: {format}")

def prepare_maya_text(text: str) -> str:
    """
    Prepare text with Maya's speaking style markers
    """
    # Add prosody markers for Maya's warm, measured delivery
    # These are interpreted by the model during generation
    return f"<speaker:maya><style:warm,wise>{text}</style></speaker>"

def adjust_prosody(audio: torch.Tensor, speed: float, pitch: float, sr: int) -> torch.Tensor:
    """
    Adjust speed and pitch of audio
    """
    # Speed adjustment using resampling
    if speed != 1.0:
        new_length = int(audio.shape[-1] / speed)
        audio = torch.nn.functional.interpolate(
            audio.unsqueeze(0).unsqueeze(0),
            size=new_length,
            mode='linear',
            align_corners=False
        ).squeeze()
    
    # Pitch adjustment using phase vocoder
    if pitch != 1.0:
        # Simplified pitch shift - in production use librosa or similar
        shift_factor = 2 ** (pitch / 12)
        audio = torchaudio.functional.pitch_shift(audio, sr, shift_factor)
    
    return audio

def audio_to_wav(audio: torch.Tensor, sample_rate: int) -> bytes:
    """
    Convert audio tensor to WAV bytes
    """
    # Ensure audio is in the right shape and type
    if audio.dim() == 1:
        audio = audio.unsqueeze(0)
    
    # Normalize
    audio = audio / torch.max(torch.abs(audio)) * 0.95
    
    # Convert to int16
    audio_int16 = (audio * 32767).to(torch.int16).cpu()
    
    # Create WAV in memory
    buffer = io.BytesIO()
    torchaudio.save(buffer, audio_int16, sample_rate, format="wav")
    buffer.seek(0)
    
    return buffer.read()

def audio_to_mp3(audio: torch.Tensor, sample_rate: int) -> bytes:
    """
    Convert audio tensor to MP3 bytes
    """
    # First convert to WAV, then to MP3
    wav_data = audio_to_wav(audio, sample_rate)
    
    # Use ffmpeg for MP3 conversion
    import subprocess
    
    process = subprocess.Popen(
        ['ffmpeg', '-i', 'pipe:0', '-f', 'mp3', '-acodec', 'libmp3lame', '-ab', '192k', 'pipe:1'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    mp3_data, error = process.communicate(input=wav_data)
    
    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {error.decode()}")
    
    return mp3_data

def generate_cache_key(text: str, voice: str, speed: float, pitch: float) -> str:
    """
    Generate cache key for audio
    """
    key_data = f"{text}|{voice}|{speed}|{pitch}"
    return hashlib.sha256(key_data.encode()).hexdigest()

def check_cache(cache_key: str) -> Optional[bytes]:
    """
    Check if audio is cached
    """
    cache_path = app_state["cache_dir"] / f"{cache_key}.wav"
    if cache_path.exists():
        try:
            return cache_path.read_bytes()
        except Exception as e:
            logger.error(f"Cache read error: {e}")
    return None

async def save_to_cache(cache_key: str, audio_data: bytes):
    """
    Save audio to cache
    """
    cache_path = app_state["cache_dir"] / f"{cache_key}.wav"
    try:
        cache_path.write_bytes(audio_data)
        logger.info(f"Cached audio: {cache_key}")
        
        # Clean old cache files if needed
        await cleanup_cache()
    except Exception as e:
        logger.error(f"Cache write error: {e}")

async def cleanup_cache(max_files: int = 1000):
    """
    Clean up old cache files
    """
    cache_files = list(app_state["cache_dir"].glob("*.wav"))
    if len(cache_files) > max_files:
        # Remove oldest files
        cache_files.sort(key=lambda f: f.stat().st_mtime)
        for f in cache_files[:len(cache_files) - max_files]:
            try:
                f.unlink()
            except Exception:
                pass

def cleanup_models():
    """
    Clean up models on shutdown
    """
    if app_state["tts_model"]:
        del app_state["tts_model"]
    if app_state["vocoder"]:
        del app_state["vocoder"]
    if app_state["maya_embedding"]:
        del app_state["maya_embedding"]
    torch.cuda.empty_cache()

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    workers = int(os.getenv("WORKERS", "1"))
    
    logger.info(f"Starting server on {host}:{port}")
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        workers=workers,
        log_level="info",
        access_log=True
    )