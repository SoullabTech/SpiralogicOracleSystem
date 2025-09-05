#!/bin/bash

# Start a mock Sesame server for testing the Sesame-primary voice system
# This simulates the CSM API without requiring the full model setup

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Mock Sesame Server${NC}"
echo "=============================="
echo "This simulates Sesame CSM API for testing"
echo ""

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is in use, killing existing process...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Create a simple mock server using Python
python3 -c "
import http.server
import socketserver
import json
import base64
import time
from urllib.parse import urlparse, parse_qs

class MockSesameHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'model_loaded': True,
                'device': 'cpu',
                'gpu_available': False,
                'message': 'Mock Sesame CSM Server Ready'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'message': 'Mock Sesame CSM Server',
                'version': '1.0.0',
                'endpoints': ['/health', '/generate']
            }
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        if self.path == '/generate':
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(post_data.decode('utf-8'))
                text = request_data.get('text', 'Hello')
                
                print(f'[Mock Sesame] Generating audio for: \"{text[:50]}...\"')
                
                # Simulate processing time
                time.sleep(2)
                
                # Create minimal WAV header (22 bytes) + silence
                # This creates a valid 1-second silent WAV file
                sample_rate = 24000
                duration = 1.0
                samples = int(sample_rate * duration)
                
                # WAV header
                wav_header = bytearray()
                wav_header.extend(b'RIFF')  # Chunk ID
                wav_header.extend((36 + samples * 2).to_bytes(4, 'little'))  # Chunk size
                wav_header.extend(b'WAVE')  # Format
                wav_header.extend(b'fmt ')  # Subchunk1 ID
                wav_header.extend((16).to_bytes(4, 'little'))  # Subchunk1 size
                wav_header.extend((1).to_bytes(2, 'little'))   # Audio format (PCM)
                wav_header.extend((1).to_bytes(2, 'little'))   # Num channels
                wav_header.extend(sample_rate.to_bytes(4, 'little'))  # Sample rate
                wav_header.extend((sample_rate * 2).to_bytes(4, 'little'))  # Byte rate
                wav_header.extend((2).to_bytes(2, 'little'))   # Block align
                wav_header.extend((16).to_bytes(2, 'little'))  # Bits per sample
                wav_header.extend(b'data')  # Subchunk2 ID
                wav_header.extend((samples * 2).to_bytes(4, 'little'))  # Subchunk2 size
                
                # Add silence (zeros)
                audio_data = wav_header + bytes(samples * 2)
                
                # Encode as base64
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'audio_data': audio_base64,
                    'sample_rate': sample_rate,
                    'duration_ms': duration * 1000,
                    'format': 'wav',
                    'model': 'mock-sesame-csm',
                    'processing_time_ms': 2000,
                    'text_processed': text[:100]
                }
                
                self.wfile.write(json.dumps(response).encode())
                print(f'[Mock Sesame] ✓ Generated {len(audio_base64)} bytes of audio data')
                
            except Exception as e:
                print(f'[Mock Sesame] Error: {e}')
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    'success': False,
                    'error': str(e)
                }
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f'[Mock Sesame] {format % args}')

PORT = 8000
Handler = MockSesameHandler

print(f'🚀 Mock Sesame server starting on port {PORT}...')
print('📡 Endpoints:')
print('   - Health: GET http://localhost:8000/health')
print('   - Generate: POST http://localhost:8000/generate')
print()
print('Press Ctrl+C to stop')
print()

try:
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print()
    print('🛑 Mock Sesame server stopped')
"