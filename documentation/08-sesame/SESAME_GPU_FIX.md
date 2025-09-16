# 🌀 Claude Code Prompt Series: Sesame GPU/CPU Startup Fix

A reproducible developer ritual for ensuring Sesame CI containers run smoothly on macOS (Docker Desktop, CPU by default, GPU optional).

---

## 🎯 Mission

Make sure the `sesame-csm-pr...` container starts reliably on your machine:
- ✅ Always runs on CPU by default (safe, portable)
- ⚡ Auto-detects GPU if available (optional boost)
- 🚨 Prevents Docker errors like `(HTTP code 500) could not select device driver "" with capabilities: [[gpu]]`

---

## 📜 Prompt Series

### Prompt 1 – Context Setup

```
You are configuring Docker for the Spiralogic Oracle System.
- Default: Sesame CI runs on CPU (safe fallback).
- Optional: Use GPU only if available and configured.
- Never crash due to missing GPU drivers.

Do you understand? Summarize CPU-first vs GPU-optional approach.
```

---

### Prompt 2 – Docker Run CPU Mode

```
Write the exact command to start Sesame container on CPU only:

docker run -d \
  --name sesame-ci \
  -p 8000:8000 \
  --env SESAME_MODE=ci \
  --env LOG_LEVEL=debug \
  --restart unless-stopped \
  sesame-csm:latest

Ensure no GPU flags are present.
```

---

### Prompt 3 – Docker Run GPU Mode (Optional)

```
Write the GPU-enabled command (if CUDA drivers installed):

docker run -d \
  --name sesame-ci-gpu \
  -p 8000:8000 \
  --gpus all \
  --env SESAME_MODE=ci \
  --env LOG_LEVEL=debug \
  --restart unless-stopped \
  sesame-csm:latest

Ensure it gracefully falls back to CPU if --gpus all fails.
```

---

### Prompt 4 – Docker Compose Upgrade

```
Write a docker-compose.yml with profiles:

version: "3.8"

services:
  sesame-ci:
    image: sesame-csm:latest
    ports:
      - "8000:8000"
    environment:
      - SESAME_MODE=ci
      - LOG_LEVEL=debug
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    profiles:
      - gpu

Default profile = CPU, GPU profile only if explicitly enabled.
```

---

### Prompt 5 – Health Check

```
Add /health check in docker-compose.yml:

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5
```

---

### Prompt 6 – .env Safety

```
Ensure .env only contains:

SESAME_URL=http://localhost:8000
SESAME_CI_ENABLED=true

Remove SESAME_TOKEN unless required.
```

---

### Prompt 7 – Debug Mode Logs

```
Add dev-only logging:
- When container starts, log [SESAME] Running in CPU-only mode or [SESAME] Running with GPU acceleration.
- Claude should patch ConversationalPipeline.ts to check and log.
```

---

### Prompt 8 – QA Checklist

```
1. Start container in CPU mode → Confirm curl http://localhost:8000/health works.
2. Start container in GPU mode (if available) → Confirm no error.
3. Try both with Docker Desktop → Confirm no (HTTP code 500) error.
4. Run curl -X POST http://localhost:8000/ci/shape ... → Confirm shaping works.
5. Switch modes via docker-compose --profile gpu up vs docker-compose up.
```

---

## 🚀 Usage

1. Copy each prompt into Claude Code sequentially.
2. Claude will generate CPU/GPU run commands, Docker Compose configs, and patches.
3. Test after each step.
4. Always keep CPU mode as default for reliability.

---

## 📚 Related Documentation

- [SESAME_CI_QUICK_REFERENCE.md](./SESAME_CI_QUICK_REFERENCE.md) - CI/CD commands and endpoints
- [SESAME_CI_UPGRADE_RITUAL.md](./SESAME_CI_UPGRADE_RITUAL.md) - System upgrade procedures
- [BETA_QA_RITUAL.md](./BETA_QA_RITUAL.md) - Quality assurance testing

---

*Last Updated: 2025-01-05*