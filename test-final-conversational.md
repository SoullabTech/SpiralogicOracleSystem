# Final Conversational Oracle Test Commands

## ✅ Prerequisites Complete
- ✅ Environment variables updated in `.env.local`
- ✅ `MAYA_FORCE_NAME=Kelly` for testing
- ✅ `MAYA_GREETING_TONE=casual-wise` 
- ✅ `USE_CLAUDE=true` and `DEMO_PIPELINE_DISABLED=true`
- ✅ Debug metadata added for troubleshooting

## 🧪 Test Commands (Safe Curl Syntax)

### 1. First Turn - Should Greet "Kelly" + Conversational Depth

```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I am not sure what is next for me."},"conversationId":"c-test-1"}' \
  | jq -r '.response.text'
```

**Expected**:
- Starts with casual-wise greeting: "Hey Kelly, let's take this one layer at a time..."
- 4-12 sentences total
- Modern, conversational tone (not clinical)
- Ends with 1-2 natural questions

### 2. Follow-up Turn - No Greeting, Still Conversational

```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"It feels like I am split between two directions."},"conversationId":"c-test-1"}' \
  | jq -r '.response.text'
```

**Expected**:
- NO greeting (same conversation)
- Acknowledges "split between two directions"
- Maintains conversational depth
- 1-2 questions for engagement

### 3. Debug Metadata Check

```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"quick stack check"},"debug":true,"conversationId":"c-debug"}' \
  | jq '.metadata.pipeline'
```

**Expected Debug Output**:
```json
{
  "demoDisabled": true,
  "claudePrimary": true,
  "greetingEnabled": true,
  "greetingApplied": true,
  "greetingText": "Hey Kelly, let's take this one layer at a time.",
  "validationMode": "relaxed",
  "sentenceLimits": {
    "min": 4,
    "max": 12
  },
  "validation": {
    "valid": true,
    "corrections": [],
    "metadata": {
      "sentenceCount": 8,
      "questionCount": 1,
      "warmthLevel": 0.7
    }
  }
}
```

### 4. New Conversation - Should Greet Again

```bash
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"I need guidance on a big decision."},"conversationId":"c-test-2"}' \
  | jq -r '.response.text'
```

**Expected**:
- New greeting (different conversation ID)
- Decision-focused content
- Casual-wise tone maintained

## 🎯 Success Indicators

✅ **Greeting Applied**: First turn starts with "Hey Kelly..." or similar casual-wise greeting
✅ **Name Override**: Uses "Kelly" from `MAYA_FORCE_NAME` instead of "friend"
✅ **Conversational Length**: 4-12 sentences (not terse 2-liner)
✅ **Modern Tone**: Sounds like wise friend, not clinical coach
✅ **Question Flow**: 1-2 natural questions per response
✅ **No Repetition**: Follow-up turns don't repeat greeting
✅ **Debug Tracking**: Pipeline metadata shows all systems active

## 🚨 Troubleshooting

**If you see issues:**

### No Greeting Applied
```bash
# Check environment loaded
echo $MAYA_GREETING_ENABLED
echo $MAYA_FORCE_NAME

# Restart stack to load new env
docker compose -f docker-compose.development.yml down
docker compose -f docker-compose.development.yml up --build
```

### Still Too Short/Clinical
```bash
# Increase max sentences temporarily
export TURN_MAX_SENTENCES=14
# Or adjust Claude temperature in air.ts (0.6-0.8 range)
```

### Pipeline Not Active
```bash
# Check debug output for missing providers
curl -s -X POST "http://localhost:3000/api/oracle/turn" \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"debug check"},"debug":true,"conversationId":"debug"}' \
  | jq '.metadata.providers'

# Should show: ["sesame","psi","claude","sacred","maya"]
```

## 🎉 When Working Correctly

You should immediately notice the transformation from "demo bot" to "conversational guide":

**Before**: "Consider diving into... How can I support you on your journey today?"

**After**: "Hey Kelly, let's take this one layer at a time. I hear that uncertainty in your voice—it's like standing in a hallway of doors without knowing which one to open. That 'not knowing' can feel unsettling, but it's also sacred space where possibilities live before they become concrete. What does your body tell you when you sit with this uncertainty? How does 'not knowing' actually feel when you give it permission to just be?"

🚀 **Ready for beta testing once basic scenarios work!**