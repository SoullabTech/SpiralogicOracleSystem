# Starter Prompts A/B Test Setup

## What This Tests

**Question**: Should we show starter prompts to help users begin their first conversation?

**Metrics**:
- Time to first message
- First session length
- Return rate (next day)
- Users reporting feeling "stuck"
- Actual usage of prompts (for prompt group)

## How It Works

### 1. Automatic Assignment
When a user completes onboarding, they're automatically assigned:
- **Even-numbered users**: No prompts (clean interface)
- **Odd-numbered users**: Show prompts after Connection Preferences

### 2. Integration Points

Add to your `OracleConversation` or chat component:

```typescript
import { promptTestTracker } from '@/lib/beta/PromptTestTracking';

// After onboarding completes
const variant = promptTestTracker.assignVariant(userId);
const showPrompts = variant === 'with_prompts';

// When chat screen loads
promptTestTracker.startWaitingForMessage(userId);

// When first message sent
promptTestTracker.recordFirstMessage(
  userId,
  message.length,
  usedPrompt // true if user clicked a prompt, false if typed manually
);

// When session ends
promptTestTracker.endSession(userId, sessionDurationMinutes);

// On return visit
const timeSince = Date.now() - lastSessionTime;
promptTestTracker.trackReturn(userId, timeSince);
```

### 3. Prompt Component (Optional)

```typescript
{showPrompts && !hasFirstMessage && (
  <div className="text-center space-y-2 mt-4">
    <p className="text-sm text-white/40">Not sure where to start?</p>
    <div className="flex flex-col gap-2">
      <button
        onClick={() => sendMessage("Tell me what's really on your mind today")}
        className="text-sm text-amber-400/60 hover:text-amber-400"
      >
        "Tell me what's really on your mind today"
      </button>
      <button
        onClick={() => sendMessage("I had this dream...")}
        className="text-sm text-amber-400/60 hover:text-amber-400"
      >
        "I had this dream..."
      </button>
      <button
        onClick={() => sendMessage("Can I just talk through something?")}
        className="text-sm text-amber-400/60 hover:text-amber-400"
      >
        "Can I just talk through something?"
      </button>
    </div>
  </div>
)}
```

## View Results

**Live Dashboard**: Visit `/beta/prompt-test-results`

**Raw Data**: `GET /api/beta/prompt-test`

The dashboard auto-refreshes every 30 seconds and gives you:
- Side-by-side comparison
- Automatic insights
- Recommendation on what to do

## Decision Criteria

**Add Prompts If**:
- Return rate improves by >10%
- Users actually use them (>30% usage)
- Fewer people report feeling stuck

**Skip Prompts If**:
- Low usage (<20%)
- Return rate drops
- No meaningful difference (visual clutter for no gain)

## Sample Size

With 24 testers:
- **Wait for 6+ users per group** before looking at data
- **Wait for 10+ users per group** before making final decision
- Focus on qualitative feedback if numbers are unclear

## Timeline

**Week 1** (first 12 users): Collect data, don't look yet
**Week 2** (next 12 users): Review dashboard, look for patterns
**Week 3**: Make decision based on data + direct feedback

## Notes

- This is qualitative at 24 people - trust your gut if the data is close
- Direct user feedback > statistical significance at this scale
- The tracker is privacy-preserving (no message content stored)
- Export data anytime from the dashboard for deeper analysis