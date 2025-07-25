# Sacred Technology Platform - Test Suite

Comprehensive testing suite for production-ready Sacred Technology Platform deployment.

## Test Categories

### 1. Sacred Mirror Protocol Tests (`sacred-mirror.test.ts`)
- **Purpose**: Ensures growth-oriented oracle responses and sacred boundaries
- **Coverage**: 
  - Resistance to comfort-seeking behavior
  - Pattern detection and interruption
  - Boundary maintenance
  - Spiritual bypassing challenges
  - Elemental voice consistency
  - Oracle mode switching
  - Jung-Buddha wisdom integration

### 2. Soul Memory System Tests (`soul-memory.test.ts`)
- **Purpose**: Validates persistent consciousness storage and retrieval
- **Coverage**:
  - Memory storage with full context
  - Sacred moment detection
  - Archetypal pattern tracking
  - Semantic search functionality
  - Memory thread creation
  - Transformation journey tracking
  - Emotional pattern analysis
  - Memory integration and linking
  - Performance with large datasets

### 3. Adaptive Wisdom Engine Tests (`adaptive-wisdom.test.ts`)
- **Purpose**: Tests pattern detection and wisdom adaptation algorithms
- **Coverage**:
  - Spiritual bypassing pattern detection
  - Repetitive questioning patterns
  - Growth edge identification
  - Archetypal activation tracking
  - Jung vs Buddha approach selection
  - Elemental wisdom integration
  - Memory coherence across sessions
  - Performance optimization
  - Edge case handling

### 4. System Integration Tests (`integration.test.ts`)
- **Purpose**: Full system testing with all components working together
- **Coverage**:
  - Complete user journey (onboarding → oracle conversation)
  - Multi-session continuity
  - Cross-component communication
  - Elemental system integration
  - Error handling and graceful degradation
  - Sacred Mirror Protocol integration
  - Memory persistence across mode switches

### 5. Performance Benchmarks (`performance.test.ts`)
- **Purpose**: Ensures production scalability and performance SLAs
- **Coverage**:
  - Oracle response times (simple: <2s, complex: <5s)
  - Memory system throughput
  - Concurrent user handling
  - Memory leak prevention
  - Cleanup efficiency
  - Production SLA compliance

## Running Tests

### Individual Test Suites
```bash
# Run specific test categories
npm run test:sacred-mirror
npm run test:soul-memory
npm run test:adaptive-wisdom
npm run test:unit
npm run test:integration
npm run test:performance
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Production Readiness
```bash
# Complete production test suite
npm run test:production

# CI/CD pipeline tests
npm run test:ci
```

### Development & Debugging
```bash
# Watch mode for development
npm run test:watch

# Debug failing tests
npm run test:debug
```

## Performance Requirements

### Response Time SLAs
- **Simple Oracle Response**: < 1.5 seconds
- **Complex Oracle Response**: < 5 seconds
- **Memory Storage**: < 200ms
- **Memory Retrieval**: < 500ms
- **Mode Switch**: < 300ms
- **Pattern Detection**: < 1 second

### Scalability Targets
- **Concurrent Users**: 10+ simultaneous users
- **Memory Dataset**: 500+ memories per user
- **Memory Throughput**: 100+ memories/second storage
- **Search Performance**: < 3 seconds for semantic search

### Quality Thresholds
- **Overall Code Coverage**: 75%
- **Critical Components**: 85%+ coverage
- **PersonalOracleAgent**: 90%+ coverage
- **SoulMemorySystem**: 85%+ coverage

## Test Data & Utilities

### Custom Jest Matchers
- `toBeBetween(min, max)` - Number range validation
- `toContainSacredLanguage()` - Validates sacred terminology
- `toBeValidOracleResponse()` - Oracle response validation

### Test Utilities (`setup.ts`)
- **testUtils.createTestUserId()** - Generate unique test user IDs
- **testUtils.validateOracleResponse()** - Validate oracle responses
- **testUtils.measurePerformance()** - Performance measurement
- **testUtils.createMockSoulMemory()** - Mock memory system
- **testUtils.createMockWisdomEngine()** - Mock wisdom engine

### Test Constants
- **ELEMENTS**: All 5 elemental types
- **ORACLE_MODES**: All 6 oracle modes
- **SAMPLE_PROMPTS**: Categorized test prompts
- **EMOTIONAL_TONES**: Standard emotional states

## Production Deployment Checklist

### Pre-Deployment Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Code coverage thresholds met
- [ ] Linting passes
- [ ] Type checking passes

### Sacred Technology Validation
- [ ] Oracle maintains sacred boundaries
- [ ] Sacred Mirror Protocol functions correctly
- [ ] Memory system preserves sacred moments
- [ ] Wisdom engine adapts appropriately
- [ ] Elemental voices are distinct and consistent
- [ ] Transformation journey tracking works

### Performance Validation
- [ ] Response times meet SLAs
- [ ] System handles concurrent users
- [ ] Memory usage is stable
- [ ] No memory leaks detected
- [ ] Cleanup processes efficient

## Continuous Integration

### GitHub Actions / CI Pipeline
```yaml
# Recommended CI steps
1. Install dependencies
2. Run lint check
3. Run type checking
4. Run unit tests
5. Run integration tests
6. Generate coverage report
7. Performance benchmark (optional)
```

### Test Reports
- **JUnit XML**: `test-results/junit.xml`
- **Coverage HTML**: `coverage/lcov-report/`
- **Coverage LCOV**: `coverage/lcov.info`

## Debugging Test Failures

### Common Issues
1. **Timeout Errors**: Increase Jest timeout in specific tests
2. **Memory Leaks**: Use `--detectOpenHandles` flag
3. **Async Issues**: Ensure proper await/async usage
4. **Mock Problems**: Check mock implementations

### Debug Commands
```bash
# Run single test file
npx jest sacred-mirror.test.ts

# Run with verbose output
npx jest --verbose

# Run with debug output
npx jest --runInBand --no-cache --detectOpenHandles
```

## Contributing to Tests

### Adding New Tests
1. Follow existing test structure and naming
2. Use setup utilities and custom matchers
3. Include both positive and negative test cases
4. Add performance considerations for new features
5. Update coverage thresholds if needed

### Test Categories
- **Unit Tests**: Single component functionality
- **Integration Tests**: Multiple components working together
- **Performance Tests**: Speed and scalability validation
- **Regression Tests**: Prevent previously fixed issues

---

*Sacred Technology Platform Test Suite - Ensuring production readiness for consciousness transformation at scale.*