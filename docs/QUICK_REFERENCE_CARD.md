# 🎯 Claude + ElevenLabs Quick Reference Card

## Claude Code Tags
```
[architect] → System design mode
[coder]     → Pure implementation
[reviewer]  → Code analysis
[debugger]  → Error diagnosis

[typescript] [python] [go] → Language
[minimal] [explain] → Verbosity
[tests] [security] [optimize] → Focus
```

## ElevenLabs Voice Tags
```
[whispers] [laughs] [sighs] → Emotion
[pause] [clears throat] → Timing
CAPS → Emphasis
... → Natural pause
```

## Voice Selection
```
Maya/Water/Aether → Aunt Annie (warm)
Fire/Air/Earth → Emily (clear)
Default → Emily
```

## API Flow
```bash
# Send prompt with role + personality
POST /api/oracle/chat
{
  "text": "[coder][python] OAuth flow",
  "personality": "maya"
}

# Listen for voice
GET /api/events?userId=xxx
→ { "type": "voice.ready", "url": "..." }
```

## Environment Keys
```
ELEVENLABS_API_KEY=sk_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
AUDIO_BUCKET=voice-bucket
```

## Cost Optimization
- Cache: 30min (80% savings)
- Limit: 1500 chars/request
- Quota: 50k chars/day/user

---
*Print double-sided, laminate for desk reference*