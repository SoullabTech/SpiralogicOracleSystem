# Ultra-minimal RunPod Dockerfile - Just verify PyTorch works
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1

# Install Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Install PyTorch first
RUN python3 -m pip install torch==2.4.0+cu121 --index-url https://download.pytorch.org/whl/cu121

# Test PyTorch installation
RUN python3 -c "import torch; print(f'PyTorch {torch.__version__}, CUDA: {torch.cuda.is_available()}')"

# Copy and install requirements
COPY requirements-runpod.txt .
RUN pip3 install -r requirements-runpod.txt

# Copy application code
WORKDIR /app
COPY handler.py .

# Create directories that your handler might need
RUN mkdir -p models audio_cache logs

# Final test before starting
RUN echo 'print("=== FINAL VIBE CHECK ===")' > vibe_check.py && \
    echo 'import torch' >> vibe_check.py && \
    echo 'print(f"PyTorch: {torch.__version__}")' >> vibe_check.py && \
    echo 'print(f"CUDA: {torch.cuda.is_available()}")' >> vibe_check.py && \
    echo 'print("=== READY FOR HANDLER ===")' >> vibe_check.py

# Create ultra-simple test that just keeps running and logs
RUN echo 'import time' > simple_test.py && \
    echo 'import sys' >> simple_test.py && \
    echo 'print("=== CONTAINER STARTED ===", flush=True)' >> simple_test.py && \
    echo 'print("Container is running and will keep printing...", flush=True)' >> simple_test.py && \
    echo 'counter = 0' >> simple_test.py && \
    echo 'while True:' >> simple_test.py && \
    echo '    counter += 1' >> simple_test.py && \
    echo '    print(f"Still alive... {counter}", flush=True)' >> simple_test.py && \
    echo '    time.sleep(10)' >> simple_test.py

# Run the simple test to verify container starts
CMD ["python", "simple_test.py"]