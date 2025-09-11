#!/usr/bin/env python3
"""
Simple Sesame Mock Service - No dependencies needed
Just returns mock responses for CI shaping and TTS
"""
import json
import base64
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class SesameHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        path = urlparse(self.path).path
        
        if path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "sesame-mock",
                "timestamp": time.time()
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        path = urlparse(self.path).path
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data)
        except:
            data = {}
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if path == '/tts':
            # Mock TTS response
            response = {
                "audio": base64.b64encode(b"mock audio data").decode(),
                "format": "mp3",
                "duration": 2.5,
                "voice": data.get("voice", "maya")
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/ci/shape':
            # Mock CI shaping response
            text = data.get("text", "")
            style = data.get("style", "neutral")
            response = {
                "shaped_text": text,
                "original_text": text,
                "style": style,
                "voice_params": {
                    "rate": 0.95,
                    "pitch": 1.0,
                    "volume": 0.75,
                    "emphasis": "balanced"
                },
                "processing_time": 0.05
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    port = 8001
    server = HTTPServer(('', port), SesameHandler)
    print(f"🌀 Sesame Mock Service running on port {port}")
    print(f"   Health: http://localhost:{port}/health")
    print(f"   TTS: http://localhost:{port}/tts")
    print(f"   CI Shape: http://localhost:{port}/ci/shape")
    server.serve_forever()