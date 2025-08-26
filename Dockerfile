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

# Install ONLY PyTorch to test
RUN python3 -m pip install torch==2.4.0+cu121 --index-url https://download.pytorch.org/whl/cu121

# Create test script
RUN echo 'import torch' > /test.py && \
    echo 'print("=== VIBE CHECK ===")' >> /test.py && \
    echo 'print(f"PyTorch version: {torch.__version__}")' >> /test.py && \
    echo 'print(f"CUDA available: {torch.cuda.is_available()}")' >> /test.py && \
    echo 'if torch.cuda.is_available():' >> /test.py && \
    echo '    print(f"GPU: {torch.cuda.get_device_name(0)}")' >> /test.py && \
    echo 'print("=== VIBE CHECK PASSED ===")' >> /test.py && \
    echo 'while True:' >> /test.py && \
    echo '    import time' >> /test.py && \
    echo '    time.sleep(60)' >> /test.py

# Test during build
RUN python /test.py &

CMD ["python", "/test.py"]