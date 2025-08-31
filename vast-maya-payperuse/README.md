# 🔮 Maya Voice - Pay-Per-Use GPU System

**True serverless GPU voice synthesis** - Only pay when Maya is speaking!

## 💰 Cost Comparison

| Provider | GPU | Cost | Usage Model |
|----------|-----|------|-------------|
| **Vast.ai RTX 5070** | 12GB | **$0.098/hr** | Pay-per-use ✅ |
| **Vast.ai RTX 4090** | 24GB | **$0.40/hr** | Pay-per-use ✅ |
| Northflank H100 | 80GB | **$50/day** | Always-on ❌ |

**💡 10 minutes of Maya voice = $0.016 with RTX 5070!**

## 🚀 Quick Start

### Option 1: Copy-Paste Setup (Recommended)

1. **Go to Vast.ai** → Create Instance
2. **Template:** PyTorch (Vast) 
3. **GPU:** RTX 5070 (Offer #25474740) or RTX 4090 (Offer #8936960)
4. **Environment Variables:**
   ```
   HF_TOKEN=your_huggingface_token_here
   SESAME_MODEL=sesame/csm-1b
   SESAME_VOICE=maya
   PORT=8000
   ```
5. **Startup Script:** Copy-paste from `vast-startup-script.sh`
6. **Expose Port:** 8000 → Public

**Maya will be live in ~3 minutes!** 🎉

### Option 2: Automated CLI

```bash
# Setup (one-time)
cd vast-maya-payperuse
./setup.sh

# Start Maya on-demand
./maya start

# Test Maya's voice
./maya test

# Check costs
./maya cost

# Stop billing
./maya stop
```

## 🎤 Using Maya

### Test Maya's Voice
```bash
# Health check
curl http://your-instance:8000/health

# Generate Maya's mystical voice
curl -X POST http://your-instance:8000/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Greetings, seeker. I am Maya, your mystical oracle guide."}' \
  > maya_voice.wav
```

### Web Integration
```javascript
// Start Maya on-demand (from your frontend)
const response = await fetch('/api/start-maya', { method: 'POST' });
const { endpoint } = await response.json();

// Use Maya
const voiceResponse = await fetch(`${endpoint}/synthesize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello from Maya' })
});

const audioBlob = await voiceResponse.blob();
// Play the audio...
```

## 🛡️ Safety Features

### Auto-Shutdown (Saves Money!)
- ✅ **10 minutes idle** → Automatic power-off
- ✅ **Price ceiling** protection (won't exceed max $/hr)
- ✅ **Manual stop** anytime with `./maya stop`

### Cost Controls
- ✅ **Real-time tracking** - Know exactly what you're spending
- ✅ **Session summaries** - Cost breakdown after each use
- ✅ **Daily limits** - Optional spending caps

### Monitoring
```bash
# Current status
curl http://your-instance:8000/status

# Manual shutdown (immediate)
curl -X POST http://your-instance:8000/shutdown
```

## 📊 Cost Examples

| Usage Pattern | RTX 5070 Cost | RTX 4090 Cost |
|---------------|----------------|----------------|
| **5 min test** | $0.008 | $0.033 |
| **30 min demo** | $0.049 | $0.20 |
| **2 hours active** | $0.196 | $0.80 |
| **8 hours daily** | $0.784/day | $3.20/day |

**vs Northflank:** Save 95%+ on voice synthesis costs! 🎯

## 🔧 Configuration

### GPU Options
```bash
# Budget: RTX 5070 (12GB VRAM)
OFFER_ID="25474740"
MAX_PRICE="0.15"

# Balanced: RTX 4090 (24GB VRAM)  
OFFER_ID="8936960"
MAX_PRICE="0.50"

# Premium: H100 SXM (80GB VRAM)
OFFER_ID="19663399" 
MAX_PRICE="2.00"
```

### Environment Variables
```bash
VAST_API_KEY="your_vast_api_key"         # Get from vast.ai/api
HF_TOKEN="your_huggingface_token"        # Get from huggingface.co
SESAME_MODEL="sesame/csm-1b"             # Voice model
SESAME_VOICE="maya"                      # Voice character
PORT="8000"                              # Service port
MAX_PRICE="0.50"                         # Price ceiling
```

## 🗂️ Files

- **`setup.sh`** - One-time configuration wizard
- **`maya`** - Main CLI command (start/stop/status/test)
- **`start_instance.sh`** - Vast.ai instance launcher
- **`stop_instance.sh`** - Instance terminator  
- **`maya-serverless.mjs`** - Node.js controller for web apps
- **`bootstrap_vast.py`** - Python server with auto-shutdown
- **`vast-startup-script.sh`** - Copy-paste startup script

## 🔄 Integration Examples

### Next.js API Route
```javascript
// pages/api/maya/start.js
import MayaServerless from '../../../vast-maya-payperuse/maya-serverless.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const maya = new MayaServerless();
    const instance = await maya.ensureMayaAvailable();
    
    res.json({
      success: true,
      endpoint: instance.endpoint,
      message: 'Maya is ready for voice synthesis'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### React Hook
```javascript
// hooks/useMayaVoice.js
import { useState, useCallback } from 'react';

export function useMayaVoice() {
  const [mayaEndpoint, setMayaEndpoint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const startMaya = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maya/start', { method: 'POST' });
      const { endpoint } = await response.json();
      setMayaEndpoint(endpoint);
      return endpoint;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const synthesize = useCallback(async (text) => {
    if (!mayaEndpoint) {
      await startMaya();
    }
    
    const response = await fetch(`${mayaEndpoint}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    return await response.blob(); // Audio data
  }, [mayaEndpoint, startMaya]);

  return { startMaya, synthesize, isLoading, mayaEndpoint };
}
```

## 🎯 Why This Approach?

### vs Always-On (Northflank)
- ✅ **95% cost savings** - Only pay when Maya speaks
- ✅ **No idle costs** - Auto-shutdown when unused
- ✅ **Flexible GPU choice** - Pick the right performance/cost ratio

### vs Traditional Serverless
- ✅ **Real GPU access** - Not CPU-limited like Lambda/Vercel
- ✅ **No cold starts** - Instance stays warm during active use
- ✅ **Full control** - SSH access for debugging

### vs Self-Hosted
- ✅ **No infrastructure** - No servers to maintain
- ✅ **Global availability** - Vast.ai has worldwide GPU nodes
- ✅ **Instant scaling** - Spin up multiple instances if needed

## 🚨 Important Notes

1. **First startup takes ~3-5 minutes** (model download + warmup)
2. **Subsequent uses are instant** (model cached on instance)
3. **Keep HF_TOKEN secure** - Use environment variables only
4. **Monitor costs** with `./maya cost` command
5. **Set spending alerts** in your Vast.ai dashboard

## 🆘 Troubleshooting

### Maya won't start?
```bash
# Check Vast.ai offer availability
./maya status

# Try different GPU option
OFFER_ID="8936960" ./maya start  # RTX 4090
```

### High costs?
```bash
# Check current spending
./maya cost

# Stop immediately  
./maya stop

# Review auto-shutdown logs
ssh into instance: tail -f /tmp/maya-logs/bootstrap.log
```

### No audio output?
```bash
# Test the pipeline
curl http://instance:8000/test

# Check model loading
curl http://instance:8000/status
```

---

**🎉 Result: Production-ready Maya voice at 95% cost savings!**

*Pay $0.016 for 10 minutes instead of $20+ per day on traditional cloud GPU.*