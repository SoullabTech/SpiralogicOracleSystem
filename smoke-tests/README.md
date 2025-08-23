# Soul Memory Bridge Smoke Tests

Comprehensive smoke tests for the three implemented tracks of the Soul Memory AIN Bridge system.

## Test Coverage

### Track A: Debug Dashboard (`/debug/bridge`)
- ✅ Dashboard loads with metrics tiles
- ✅ Latency monitoring (p50/p95)
- ✅ Signal detection rates
- ✅ Health percentage display
- ✅ Real-time event stream
- ✅ Heartbeat indicator

### Track B: Micro-Reflections
- ✅ ≤12 word constraint validation
- ✅ Appears after Oracle responses
- ✅ Holoflower glow with confidence ≥0.7
- ✅ Rate limiting (every 3 turns)
- ✅ Privacy guards (shadow score >0.8)

### Track C: Thread Weaving
- ✅ Weave option appears after 3+ exchanges
- ✅ User quote extraction
- ✅ Ends with invitational question
- ✅ Session recap modal
- ✅ Soul Memory storage

### Integration Tests
- ✅ Environment variables configured
- ✅ Oracle turn API returns turnMeta
- ✅ Thread weaving API functionality
- ✅ Privacy filtering and redaction

## Running Tests

```bash
# Install dependencies
cd smoke-tests
npm install

# Start the application in development mode
cd ../
npm run dev:all

# Run smoke tests (in separate terminal)
cd smoke-tests
npm test

# Run with verbose logging
VERBOSE_TESTS=true npm test

# Run in CI mode with coverage
npm run test:ci
```

## Test Requirements

1. **Application must be running** on `http://localhost:3001`
2. **Backend services active** (Soul Memory, AIN Bridge)
3. **Environment variables** properly configured in `.env.local`

## Environment Setup

Ensure these variables are set in your `.env.local`:

```env
# Track B: Micro-reflections
NEXT_PUBLIC_DEV_INLINE_REFLECTIONS=true

# Track C: Thread weaving  
THREAD_WEAVING_MIN_TURNS=3

# Track A: Debug dashboard
BRIDGE_METRICS_ENABLED=true

# Soul Memory Bridge
SOUL_MEMORY_ENRICH_SYNC=true
SOUL_MEMORY_ENRICH_BUDGET_MS=350
```

## Test Philosophy

These smoke tests verify that:

1. **Core functionality works** end-to-end
2. **Privacy constraints** are enforced
3. **User experience flows** operate smoothly
4. **Integration points** between tracks function correctly

Tests focus on user-visible behavior rather than internal implementation details, ensuring the bridge feels like a "subtle companion" as intended.

## Debugging Failed Tests

- Check browser console logs for JavaScript errors
- Verify all environment variables are set
- Ensure Soul Memory database is accessible
- Confirm backend services are running (`npm run dev:backend`)
- Check network requests in browser dev tools