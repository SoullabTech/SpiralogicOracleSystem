# 🧪 Sacred Pipeline Testing Guide

## Quick Start

```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:pipeline     # Voice → Oracle → Motion tests
npm run test:persistence  # Supabase integration tests
npm run test:coverage     # Full coverage report
```

## Test Architecture

### 1. Sacred Pipeline Tests (`tests/sacred-pipeline.test.ts`)
Tests the complete flow from voice input to motion output:
- **Voice → Intent**: Transcript processing through Claude
- **Oracle → Motion**: Response mapping to visual states
- **Audio Service**: Sacred frequency generation
- **Haptic Feedback**: Coherence breakthrough vibrations
- **Mobile Optimization**: Device tier detection

### 2. Persistence Tests (`tests/supabase-persistence.test.ts`)
Validates data storage and retrieval:
- **Session Management**: Voice interactions tracking
- **Coherence Timeline**: Historical coherence data
- **Sacred Library**: Document storage and search
- **Security**: Row-level security and sanitization
- **Performance**: Batch operations and indexing

## Running Tests Locally

### Prerequisites
```bash
# Set test environment variables
cp .env.example .env.test
# Edit .env.test with your test Supabase credentials
```

### Interactive Mode
```bash
# Watch mode for development
npm run test:watch

# Run with debugging
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Coverage Reports
```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

## CI/CD Pipeline

The GitHub Actions workflow (`/.github/workflows/test-pipeline.yml`) runs:

1. **Quality Checks**
   - ESLint validation
   - TypeScript type checking

2. **Test Suites**
   - Unit tests
   - Integration tests
   - E2E tests (Ubuntu + macOS)

3. **Performance**
   - Bundle size analysis
   - Build optimization checks

4. **Security**
   - npm audit
   - Snyk vulnerability scanning

5. **Deployment**
   - Preview deploys for PRs
   - Production deploy on main branch

## Test Scenarios

### Voice → Oracle Flow
```typescript
// Example: Testing coherence breakthrough
const response = await sacredPortalHandler({
  transcript: "I feel a breakthrough coming"
});

expect(response.motion.coherence).toBeGreaterThan(0.85);
expect(response.motion.state).toBe('breakthrough');
```

### Session Persistence
```typescript
// Example: Saving voice interaction
await saveVoiceInteraction({
  sessionId: 'test-123',
  transcript: 'User question',
  coherenceLevel: 0.75
});

const session = await loadSession('test-123');
expect(session.interactions).toHaveLength(1);
```

### Mobile Performance
```typescript
// Example: Low-end device detection
navigator.deviceMemory = 2; // Mock low memory
const config = MobileOptimizer.getOptimizedConfig();
expect(config.maxAnimations).toBe(1);
expect(config.reducedMotion).toBe(true);
```

## Troubleshooting

### Common Issues

1. **AudioContext Mocks Failing**
   ```bash
   # Ensure jest.setup.js is loaded
   npm run test -- --setupFilesAfterEnv ./jest.setup.js
   ```

2. **Supabase Connection Errors**
   ```bash
   # Check test credentials
   echo $SUPABASE_SERVICE_ROLE_KEY
   # Use test database, not production!
   ```

3. **Timeout Issues**
   ```javascript
   // Increase timeout for slow tests
   jest.setTimeout(60000); // 60 seconds
   ```

## Adding New Tests

### Template for New Feature Tests
```typescript
describe('New Feature', () => {
  beforeEach(() => {
    // Setup
  });
  
  it('should handle happy path', async () => {
    // Test implementation
  });
  
  it('should handle error cases', async () => {
    // Error scenarios
  });
  
  afterEach(() => {
    // Cleanup
  });
});
```

## Test Coverage Goals

- **Overall**: 70% minimum
- **Critical Paths**: 90% (voice/oracle/motion)
- **API Routes**: 85%
- **UI Components**: 60%
- **Utilities**: 80%

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Services**: Don't hit real APIs in tests
3. **Use Descriptive Names**: `should_process_voice_transcript_into_motion_state`
4. **Test Edge Cases**: Empty inputs, timeouts, malformed data
5. **Clean Up**: Always clean up test data and mocks

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)