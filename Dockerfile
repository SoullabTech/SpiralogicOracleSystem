# Minimal smoke-test Dockerfile for RunPod (verify correct GPU stack only)

# Match your worker logs (CUDA 12.1 runtime)
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-dev git ffmpeg curl ca-certificates && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

# Exact GPU stack (DO NOT let anything else re-install these)
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install --index-url https://download.pytorch.org/whl/cu121 \
      torch==2.4.0+cu121 torchvision==0.19.0+cu121 torchaudio==2.4.0+cu121 && \
    python3 -m pip install --no-deps \
      transformers==4.52.1 accelerate==0.33.0 "numpy<2" runpod

# Prove versions at build time (will also appear in build logs)
RUN python3 - <<'PY'
import torch, transformers, accelerate
print("BUILD VERSIONS:", "torch", torch.__version__, "| transformers", transformers.__version__, "| accelerate", accelerate.__version__)
import torch.distributed as _; print("torch.distributed OK")
PY

# Simple runtime: print versions to worker logs and keep container alive
RUN printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -e' \
  'python3 - <<PY' \
  'import torch, transformers, accelerate' \
  'print("BOOT VERSIONS:", "torch", torch.__version__, "| transformers", transformers.__version__, "| accelerate", accelerate.__version__)' \
  'import torch.distributed as _; print("torch.distributed OK")' \
  'PY' \
  'exec tail -f /dev/null' > /start.sh && chmod +x /start.sh

CMD ["/bin/bash", "/start.sh"]