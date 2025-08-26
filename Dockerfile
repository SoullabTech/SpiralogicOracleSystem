# ---------- cache bust ----------
ARG CACHE_BREAKER=2025-08-26h
ENV CACHE_BREAKER=${CACHE_BREAKER}

# Match worker logs (CUDA 12.1) to avoid surprises
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1 \
    HF_HUB_ENABLE_HF_TRANSFER=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-dev git ffmpeg curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -------- install exact GPU stack first (no deps can override this) --------
RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install --index-url https://download.pytorch.org/whl/cu121 \
    torch==2.4.0+cu121 torchvision==0.19.0+cu121 torchaudio==2.4.0+cu121
RUN python3 -m pip install --no-deps transformers==4.52.1 accelerate==0.33.0

# quick proof
RUN python3 - <<'PY'
import torch, transformers, accelerate
print("VERSIONS:", torch.__version__, transformers.__version__, accelerate.__version__)
import importlib; importlib.import_module("torch.distributed")
print("torch.distributed OK")
PY

# -------- rest of deps (must NOT include torch/transformers/accelerate) --------
COPY requirements-runpod.txt /app/requirements-runpod.txt
RUN python3 -m pip install -r /app/requirements-runpod.txt

# app code
COPY handler.py /app/handler.py
COPY sesame_csm_openai/app /app/app
COPY sesame_csm_openai/static /app/static

# tiny entry
CMD ["python3", "/app/handler.py"]