#!/usr/bin/env python3
"""
RunPod serverless handler for Sesame TTS
"""
import runpod
import requests
import base64
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Log versions for debugging
try:
    import torch
    import transformers
    import accelerate
    import numpy
    logger.info(f"VERSIONS: torch={torch.__version__}, transformers={transformers.__version__}, accelerate={accelerate.__version__}, numpy={numpy.__version__}")
except Exception as e:
    logger.warning(f"Could not log versions: {e}")

# The internal FastAPI service URL
INTERNAL_API_URL = "http://localhost:8000"
WARMUP_RETRIES = 30  # Number of retries for warmup
WARMUP_DELAY = 2     # Seconds between retries

def wait_for_service():
    """Wait for the internal FastAPI service to be ready"""
    logger.info("Waiting for internal FastAPI service to be ready...")
    
    for i in range(WARMUP_RETRIES):
        try:
            response = requests.get(f"{INTERNAL_API_URL}/health", timeout=5)
            if response.status_code == 200:
                logger.info(f"Service is ready after {i+1} attempts")
                return True
        except requests.exceptions.RequestException as e:
            logger.info(f"Attempt {i+1}/{WARMUP_RETRIES}: Service not ready yet - {str(e)}")
            time.sleep(WARMUP_DELAY)
    
    logger.error("Service failed to start after maximum retries")
    return False

def handler(job):
    """
    RunPod handler function
    Expected input format:
    {
        "input": {
            "text": "Text to synthesize",
            "voice": "maya",  # optional, defaults to "maya"
            "format": "wav",  # optional, defaults to "wav"
            "sample_rate": 16000  # optional, defaults to 16000
        }
    }
    """
    try:
        # Extract input
        job_input = job.get("input", {})
        text = job_input.get("text", "")
        voice = job_input.get("voice", "maya")
        audio_format = job_input.get("format", "wav")
        sample_rate = job_input.get("sample_rate", 16000)
        
        if not text:
            return {"error": "No text provided for synthesis"}
        
        logger.info(f"Processing TTS request: text='{text[:50]}...', voice={voice}")
        
        # Wait for service to be ready on cold start
        if not wait_for_service():
            return {"error": "Internal service failed to start"}
        
        # Prepare request to internal API
        payload = {
            "text": text,
            "voice": voice,
            "format": audio_format,
            "sample_rate": sample_rate,
            "stream": False  # RunPod doesn't support streaming
        }
        
        # Make request to internal FastAPI service
        try:
            response = requests.post(
                f"{INTERNAL_API_URL}/v1/tts",
                json=payload,
                timeout=120  # 2 minute timeout for synthesis
            )
            
            if response.status_code == 200:
                # Get audio data
                audio_data = response.content
                
                # Convert to base64 for RunPod response
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                logger.info(f"Successfully synthesized audio: {len(audio_data)} bytes")
                
                return {
                    "audio_base64": audio_base64,
                    "format": audio_format,
                    "sample_rate": sample_rate,
                    "size_bytes": len(audio_data)
                }
            else:
                error_msg = f"TTS API error: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text}"
                
                logger.error(error_msg)
                return {"error": error_msg}
                
        except requests.exceptions.Timeout:
            logger.error("TTS request timed out")
            return {"error": "TTS synthesis timed out after 120 seconds"}
        except requests.exceptions.RequestException as e:
            logger.error(f"Request to internal API failed: {str(e)}")
            return {"error": f"Internal API request failed: {str(e)}"}
            
    except Exception as e:
        logger.error(f"Handler error: {str(e)}", exc_info=True)
        return {"error": f"Handler error: {str(e)}"}

# RunPod serverless entrypoint
if __name__ == "__main__":
    # Start the internal FastAPI service in the background
    import subprocess
    import sys
    
    logger.info("Starting internal FastAPI service...")
    
    # Start the FastAPI app
    fastapi_process = subprocess.Popen(
        [sys.executable, "-m", "app.main"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Give it time to start
    time.sleep(5)
    
    # Check if process is still running
    if fastapi_process.poll() is not None:
        # Process ended, get output
        stdout, stderr = fastapi_process.communicate()
        logger.error(f"FastAPI failed to start:\nSTDOUT: {stdout.decode()}\nSTDERR: {stderr.decode()}")
        sys.exit(1)
    
    logger.info("Starting RunPod serverless handler...")
    runpod.serverless.start({"handler": handler})