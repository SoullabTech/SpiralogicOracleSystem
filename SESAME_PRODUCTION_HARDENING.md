# 🚀 Sesame Production Hardening Plan
## From Mock Mode to 99.9% Voice Uptime

*Sprint Goal: Remove all mock modes and achieve production-grade CSM voice*

---

## 📊 Current State vs Target State

### Current State ❌
- Mock mode fallbacks scattered throughout code
- Sesame runs locally with manual startup
- No automatic recovery from failures
- Model loading takes 30-60 seconds
- No monitoring or alerting
- ~85% actual uptime

### Target State ✅
- **Zero mock mode** - Sesame or graceful fallback only
- **Auto-recovery** - Self-healing on crashes
- **Fast startup** - <10s with preloaded models
- **Full monitoring** - Health, latency, error tracking
- **99.9% uptime** - <9 minutes downtime/month
- **Production Docker** - One command deployment

---

## 🎯 Phase 1: Remove Mock Mode (Day 1-2)

### 1.1 Audit & Remove Mock Endpoints
```bash
# Find all mock mode references
grep -r "mock" backend/src --include="*.ts" | grep -i voice
grep -r "fallback" backend/src --include="*.ts" | grep -i tts
```

**Files to Clean:**
- [ ] `/api/voice/stream-chunk/route.ts` - Remove mock audio generation
- [ ] `/utils/voiceService.ts` - Remove mock TTS function
- [ ] `/services/StreamingVoiceService.ts` - Remove mock chunks
- [ ] `/utils/voiceRouter.ts` - Remove mock routing logic

### 1.2 Implement Strict Sesame-First Policy
```typescript
// New voice pipeline hierarchy
const voicePipeline = {
  primary: 'sesame-csm',      // Always try first
  secondary: 'elevenlabs',    // Premium fallback
  tertiary: 'edge-tts',       // Free fallback
  final: 'error-with-text'    // Never silent fail
};
```

---

## 🎯 Phase 2: Production Infrastructure (Day 2-3)

### 2.1 Docker Compose Production Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  sesame-csm:
    image: sesame-csm:production
    container_name: sesame-csm-prod
    restart: always  # Auto-restart on failure
    ports:
      - "8000:8000"
    environment:
      - MODEL_NAME=suno/bark
      - PRELOAD_MODELS=true
      - USE_GPU=${USE_GPU:-false}
      - CACHE_DIR=/models
      - MAX_WORKERS=4
      - LOG_LEVEL=INFO
    volumes:
      - ./models:/models:cached
      - ./logs/sesame:/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

  backend:
    build: ./backend
    container_name: spiralogic-backend
    restart: always
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - SESAME_URL=http://sesame-csm:8000
      - SESAME_HEALTH_CHECK_INTERVAL=10000
    depends_on:
      sesame-csm:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - ./logs/backend:/logs

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - sesame-csm
```

### 2.2 Systemd Service (Alternative to Docker)
```ini
# /etc/systemd/system/sesame-csm.service
[Unit]
Description=Sesame CSM Voice Service
After=network.target

[Service]
Type=simple
User=oracle
WorkingDirectory=/opt/sesame-csm
Environment="PYTHONPATH=/opt/sesame-csm"
Environment="MODEL_CACHE=/var/cache/sesame"
ExecStartPre=/usr/bin/python3 -c "import torch; print('Models preloading...')"
ExecStart=/usr/bin/python3 /opt/sesame-csm/app.py
Restart=always
RestartSec=10
StandardOutput=append:/var/log/sesame/output.log
StandardError=append:/var/log/sesame/error.log

[Install]
WantedBy=multi-user.target
```

---

## 🎯 Phase 3: Health & Monitoring (Day 3-4)

### 3.1 Enhanced Health Check System
```typescript
// services/SesameHealthMonitor.ts
class SesameHealthMonitor {
  private healthHistory: HealthCheck[] = [];
  private lastSuccessfulCheck: Date;
  
  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkEndpoint('/health'),
      this.checkEndpoint('/tts', 'POST', { text: 'test', voice: 'maya' }),
      this.checkModelLoaded(),
      this.checkMemoryUsage(),
      this.checkLatency()
    ]);
    
    return {
      healthy: checks.every(c => c.passed),
      uptime: this.calculateUptime(),
      latency: this.getAverageLatency(),
      modelStatus: checks[2].details,
      lastCheck: new Date()
    };
  }
  
  async autoRecover(): Promise<void> {
    if (!this.isHealthy) {
      console.log('🔧 Attempting Sesame auto-recovery...');
      
      // Try restart sequence
      await this.gracefulRestart();
      
      // Wait for model load
      await this.waitForReady(60000);
      
      // Verify recovery
      const recovered = await this.performHealthCheck();
      if (recovered.healthy) {
        this.notifyRecovery();
      } else {
        this.escalateToFallback();
      }
    }
  }
}
```

### 3.2 Monitoring Dashboard
```typescript
// api/monitoring/voice-metrics/route.ts
export async function GET() {
  const metrics = {
    sesame: {
      status: await sesameMonitor.getStatus(),
      uptime: await sesameMonitor.getUptimePercentage(),
      requests: {
        total: stats.totalRequests,
        successful: stats.successfulRequests,
        failed: stats.failedRequests,
        avgLatency: stats.avgLatencyMs
      },
      model: {
        loaded: await sesameMonitor.isModelLoaded(),
        name: 'suno/bark',
        memoryUsageMB: await sesameMonitor.getMemoryUsage()
      }
    },
    fallbacks: {
      elevenLabsUsed: stats.elevenLabsFallbacks,
      edgeTtsUsed: stats.edgeTtsFallbacks,
      textOnlyFallbacks: stats.textOnlyFallbacks
    },
    performance: {
      p50Latency: stats.p50,
      p95Latency: stats.p95,
      p99Latency: stats.p99
    }
  };
  
  return Response.json(metrics);
}
```

---

## 🎯 Phase 4: Model Optimization (Day 4-5)

### 4.1 Model Preloading Strategy
```python
# sesame_csm/model_preloader.py
class ModelPreloader:
    def __init__(self):
        self.models = {}
        self.cache_dir = "/var/cache/sesame/models"
        
    async def preload_all(self):
        """Load all models into memory at startup"""
        models_to_load = [
            'suno/bark',
            'suno/bark-small',  # Faster fallback
        ]
        
        for model_name in models_to_load:
            print(f"Preloading {model_name}...")
            self.models[model_name] = await self.load_model(model_name)
            
        # Warm up with test inference
        await self.warmup_inference()
        
    async def warmup_inference(self):
        """Run test inference to warm up CUDA kernels"""
        test_texts = [
            "System warming up",
            "Model cache initialized",
            "Ready for production"
        ]
        
        for text in test_texts:
            await self.generate_speech(text, speaker=15)
```

### 4.2 Response Caching
```typescript
// utils/SesameCacheManager.ts
class SesameCacheManager {
  private cache = new Map<string, CachedAudio>();
  private maxCacheSize = 100; // MB
  
  async getCachedOrGenerate(text: string, voice: string): Promise<AudioData> {
    const cacheKey = this.generateKey(text, voice);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate and cache
    const audio = await this.generateWithSesame(text, voice);
    this.cache.set(cacheKey, audio);
    
    // Manage cache size
    this.pruneCache();
    
    return audio;
  }
  
  // Cache common phrases
  async preloadCommonPhrases() {
    const commonPhrases = [
      "Hello, I'm Maya",
      "How can I help you today?",
      "Tell me more about that",
      "That's interesting",
      "I understand"
    ];
    
    for (const phrase of commonPhrases) {
      await this.getCachedOrGenerate(phrase, 'maya');
    }
  }
}
```

---

## 🎯 Phase 5: Production Deployment (Day 5-6)

### 5.1 Zero-Downtime Deployment Script
```bash
#!/bin/bash
# deploy-sesame-prod.sh

set -e

echo "🚀 Starting Sesame production deployment..."

# 1. Build new image
echo "📦 Building Docker image..."
docker build -t sesame-csm:production -f Dockerfile.prod .

# 2. Start new container (different port)
echo "🔄 Starting new container..."
docker run -d \
  --name sesame-csm-new \
  -p 8001:8000 \
  --restart always \
  -v ./models:/models \
  sesame-csm:production

# 3. Wait for health
echo "⏳ Waiting for new instance to be healthy..."
for i in {1..30}; do
  if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ New instance healthy!"
    break
  fi
  sleep 2
done

# 4. Switch traffic
echo "🔀 Switching traffic to new instance..."
# Update nginx or load balancer config
sed -i 's/localhost:8000/localhost:8001/g' /etc/nginx/sites-enabled/sesame

# 5. Reload nginx
nginx -s reload

# 6. Stop old container
echo "🛑 Stopping old container..."
docker stop sesame-csm-old || true
docker rm sesame-csm-old || true

# 7. Rename containers
docker rename sesame-csm sesame-csm-old || true
docker rename sesame-csm-new sesame-csm

# 8. Update port mapping
docker run -d \
  --name sesame-csm \
  -p 8000:8000 \
  --restart always \
  -v ./models:/models \
  sesame-csm:production

echo "✅ Deployment complete!"
```

### 5.2 Production Environment Variables
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info

# Sesame Configuration
SESAME_URL=http://sesame-csm:8000
SESAME_TIMEOUT=10000
SESAME_MAX_RETRIES=3
SESAME_RETRY_DELAY=1000

# Model Configuration
SESAME_MODEL=suno/bark
SESAME_SPEAKER_ID=15
SESAME_TEMPERATURE=0.7
SESAME_MAX_LENGTH=200

# Performance
SESAME_CACHE_ENABLED=true
SESAME_CACHE_TTL=3600
SESAME_PRELOAD_MODELS=true
SESAME_WARMUP_ON_START=true

# Monitoring
SESAME_METRICS_ENABLED=true
SESAME_HEALTH_CHECK_INTERVAL=10000
DATADOG_API_KEY=${DATADOG_API_KEY}
```

---

## 🎯 Phase 6: Testing & Validation (Day 6-7)

### 6.1 Load Testing
```javascript
// tests/sesame-load-test.js
import autocannon from 'autocannon';

const instance = autocannon({
  url: 'http://localhost:8000/tts',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Load testing Maya voice generation',
    voice: 'maya'
  }),
  connections: 10,
  pipelining: 1,
  duration: 60,
  overallRate: 10 // 10 requests per second
}, (err, result) => {
  console.log('Load Test Results:');
  console.log('Requests/sec:', result.requests.average);
  console.log('Latency p50:', result.latency.p50);
  console.log('Latency p95:', result.latency.p95);
  console.log('Latency p99:', result.latency.p99);
  console.log('Errors:', result.errors);
});
```

### 6.2 Uptime Verification
```typescript
// monitoring/uptime-tracker.ts
class UptimeTracker {
  private checks: UptimeCheck[] = [];
  
  async startTracking() {
    setInterval(async () => {
      const check = await this.performCheck();
      this.checks.push(check);
      
      // Calculate rolling uptime
      const last24h = this.checks.filter(c => 
        c.timestamp > Date.now() - 86400000
      );
      
      const uptime = (last24h.filter(c => c.success).length / last24h.length) * 100;
      
      console.log(`📊 24h Uptime: ${uptime.toFixed(2)}%`);
      
      if (uptime < 99.9) {
        this.alertTeam(`⚠️ Uptime below target: ${uptime.toFixed(2)}%`);
      }
    }, 60000); // Check every minute
  }
}
```

---

## 📋 Success Metrics

### Week 1 Targets
- [ ] Mock mode completely removed
- [ ] Docker compose production ready
- [ ] Health monitoring active
- [ ] Auto-recovery implemented
- [ ] 95% uptime achieved

### Week 2 Targets
- [ ] Model preloading <10s
- [ ] Response caching active
- [ ] Load testing passed (10 req/s)
- [ ] Zero-downtime deployment tested
- [ ] 99.9% uptime achieved

### Production Checklist
- [ ] All mock endpoints removed
- [ ] Sesame running in Docker with auto-restart
- [ ] Health checks every 30s
- [ ] Monitoring dashboard live
- [ ] Alerts configured
- [ ] Fallback chain tested
- [ ] Load testing passed
- [ ] Documentation updated
- [ ] Team trained on deployment

---

## 🚨 Rollback Plan

If issues arise in production:

1. **Immediate**: Switch to ElevenLabs fallback
2. **5 minutes**: Attempt Sesame restart
3. **10 minutes**: Deploy previous stable version
4. **15 minutes**: Full rollback to pre-hardening state

```bash
# Emergency rollback
./scripts/emergency-rollback.sh
```

---

## 🎯 Next Steps After Hardening

Once Sesame is rock-solid (99.9% uptime):

1. **Voice Personality Tuning** - Refine Maya's voice characteristics
2. **Multi-Speaker Support** - Different voices for elements
3. **Emotion Detection** - Adjust voice based on user emotion
4. **Voice Cloning** - User's own voice for self-reflection
5. **Real-time Voice Modulation** - Dynamic voice changes mid-stream

---

**Let's make Maya's voice unbreakable! 🚀**