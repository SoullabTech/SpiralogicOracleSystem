# Quick Conversational Oracle Test

## Test Commands

Once your dev server is running (`npm run dev`), test these scenarios:

### 1. First Turn with Greeting
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am feeling pulled in two directions."},"conversationId":"c-test-1"}' | jq -r '.response.text'
```

**Expected**: Should start with "Hi [name]..." or similar greeting, 4-12 sentences, ends with 1-2 questions.

### 2. Follow-up Turn (No Greeting)
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"It is just a lot right now."},"conversationId":"c-test-1"}' | jq -r '.response.text'
```

**Expected**: No greeting, acknowledges "a lot," conversational depth, 1-2 questions for vague input.

### 3. New Conversation (Should Greet Again)
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I need guidance on a big decision."},"conversationId":"c-test-2"}' | jq -r '.response.text'
```

**Expected**: New greeting, decision-focused response, conversational tone.

### 4. Threshold Detection
```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I feel like I am standing at a major threshold."},"conversationId":"c-test-3"}' | jq -r '.response.text'
```

**Expected**: Threshold-aware greeting like "Hi [name], feels like you're standing at a new edge..."

## What to Look For

✅ **Greetings**: First turn starts with "Hi [name]..." (rotates across sessions)
✅ **Length**: 4-12 sentences (not terse 2-liners)
✅ **Questions**: 1-2 per response (2 allowed for vague input)
✅ **Tone**: Modern, warm, intelligent (not clinical or overly mystical)
✅ **Flow**: Acknowledge → Reflect → Bridge → Invite

## Troubleshooting

- **No greeting**: Check `MAYA_GREETING_ENABLED=true` in .env.local
- **Too short**: Increase `TURN_MAX_SENTENCES` to 14
- **Too stiff**: Adjust temperature (0.6-0.8) in Claude provider
- **Server errors**: Check that all new imports resolve correctly

## Success Indicators

When working correctly, you should feel the immediate shift from "demo bot" to "living conversationalist" - responses that sound like a wise, modern guide who knows you and cares about your journey.

🚀 **Ready for beta testing once basic scenarios work!**