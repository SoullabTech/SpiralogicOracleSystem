#!/usr/bin/env bash
set -euo pipefail
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
echo "BOOT: starting in $(pwd)"; ls -la /app || true
echo "BOOT: python -> $(python3 -V)"

python3 - <<'PY'
import sys; print("SMOKE[A]: python ok", sys.version, flush=True)
PY

python3 - <<'PY'
print("SMOKE[B]: importing torch...", flush=True)
import torch; print("SMOKE[B]: torch ok", torch.__version__, flush=True)
PY

python3 - <<'PY'
print("SMOKE[C]: importing transformers/accelerate...", flush=True)
import transformers, accelerate
print("SMOKE[C]: ok", transformers.__version__, accelerate.__version__, flush=True)
PY

python3 - <<'PY'
print("SMOKE[D]: importing runpod...", flush=True)
import runpod; from runpod import serverless
print("SMOKE[D]: ok", getattr(runpod,'__version__', 'unknown'), flush=True)
PY

echo "BOOT: launching handler.py"
python3 /app/handler.py || { rc=$?; echo "FATAL[handler]: exit $rc"; sleep 1800; }