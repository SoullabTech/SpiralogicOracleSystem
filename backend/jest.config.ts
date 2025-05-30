import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Transform configuration
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        target: 'ES2022'
      }
    }]
  },
  
  // ES modules support
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'memory/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  
  // Coverage thresholds for production readiness
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    // Critical components need higher coverage
    'src/core/agents/PersonalOracleAgent.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'memory/SoulMemorySystem.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Test timeout configuration
  testTimeout: 30000, // 30 seconds for integration tests
  
  // Verbose output for debugging
  verbose: true,
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Test suites configuration
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['**/tests/**/*.test.ts'],
      testPathIgnorePatterns: [
        'integration.test.ts',
        'performance.test.ts'
      ]
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['**/tests/integration.test.ts'],
      testTimeout: 60000 // Longer timeout for integration
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['**/tests/performance.test.ts'],
      testTimeout: 120000, // Even longer for performance tests
      maxWorkers: 1 // Run performance tests sequentially
    }
  ],
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteName: 'Sacred Technology Platform Tests'
    }]
  ]
};

export default config;