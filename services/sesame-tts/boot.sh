#!/usr/bin/env bash
set -euo pipefail
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
echo "BOOT: starting in $(pwd)"
echo "BOOT: listing /app"; ls -la /app || true
echo "BOOT: python version -> $(python3 -V)"

# Stage A: prove Python runs at all
python3 - <<'PY'
import sys, os
print("SMOKE[A]: python ok", sys.version, flush=True)
PY

# Stage B: import torch ONLY (if this segfaults, you'll see no prints after here)
python3 - <<'PY'
import sys
print("SMOKE[B]: importing torch...", flush=True)
import torch
print("SMOKE[B]: torch ok", torch.__version__, flush=True)
PY

# Stage C: transformers/accelerate
python3 - <<'PY'
print("SMOKE[C]: importing hf stack...", flush=True)
import transformers, accelerate
print("SMOKE[C]: hf ok", transformers.__version__, accelerate.__version__, flush=True)
PY

# Stage D: runpod
python3 - <<'PY'
print("SMOKE[D]: importing runpod...", flush=True)
import runpod
from runpod import serverless
print("SMOKE[D]: runpod ok", runpod.__version__, flush=True)
PY

# Stage E: finally run your handler
echo "BOOT: launching handler.py"
python3 /app/handler.py || { rc=$?; echo "FATAL[handler]: exit $rc"; sleep 1800; }