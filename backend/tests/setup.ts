import { jest } from '@jest/globals';

import { 
  jest, 
  expect, 
  beforeAll, 
  beforeEach, 
  afterEach, 
  afterAll 
} from '@jest/globals';

// ===============================================
// JEST TEST SETUP
// Global test configuration and utilities
// ===============================================

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeBetween(min: number, max: number): R;
      toBeWithinRange(min: number, max: number): R;
      toContainSacredLanguage(): R;
      toBeValidOracleResponse(): R;
    }
  }
}

// Custom matchers for Sacred Technology Platform testing
expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be between ${min} and ${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between ${min} and ${max}`,
        pass: false,
      };
    }
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${min}-${max}`
          : `expected ${received} to be within range ${min}-${max}`,
      pass,
    };
  },

  toContainSacredLanguage(received: string) {
    const sacredWords = [
      "sacred",
      "divine",
      "holy",
      "blessed",
      "spiritual",
      "transcendent",
      "transformation",
      "awakening",
      "consciousness",
      "wisdom",
      "truth",
      "mirror",
      "reflection",
      "journey",
      "path",
      "growth",
      "healing",
    ];

    const lowerReceived = received.toLowerCase();
    const containsSacred = sacredWords.some((word) =>
      lowerReceived.includes(word),
    );

    return {
      message: () =>
        containsSacred
          ? `expected "${received}" not to contain sacred language`
          : `expected "${received}" to contain sacred language (${sacredWords.join(", ")})`,
      pass: containsSacred,
    };
  },

  toBeValidOracleResponse(received: string) {
    const checks = {
      hasContent: received && received.length > 10,
      notTooLong: received.length < 2000,
      notGeneric: !received.match(/^(yes|no|ok|sure|maybe)$/i),
      hasDepth:
        received.length > 30 &&
        (received.includes("?") ||
          received.match(/\b(explore|consider|reflect|notice|aware)\b/i)),
      maintainsBoundaries: !received.match(
        /^(i love you too|yes.*friend|we are friends)/i,
      ),
    };

    const failedChecks = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check);

    const pass = failedChecks.length === 0;

    return {
      message: () =>
        pass
          ? `expected "${received}" not to be a valid oracle response`
          : `expected "${received}" to be a valid oracle response. Failed checks: ${failedChecks.join(", ")}`,
      pass,
    };
  },
});

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "error"; // Reduce log noise during tests

  // Configure timeouts for different test types
  if (expect.getState().testPath?.includes("performance")) {
    jest.setTimeout(120000); // 2 minutes for performance tests
  } else if (expect.getState().testPath?.includes("integration")) {
    jest.setTimeout(60000); // 1 minute for integration tests
  } else {
    jest.setTimeout(30000); // 30 seconds for unit tests
  }
});

beforeEach(() => {
  // Clear all timers before each test
  jest.clearAllTimers();

  // Reset console spies
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test artifacts
  jest.restoreAllMocks();
});

afterAll(async () => {
  // Global cleanup
  await new Promise((resolve) => setTimeout(resolve, 100)); // Allow async cleanup
});

// Console spy for testing log output
export const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
  info: jest.spyOn(console, "info").mockImplementation(() => {}),
};

// Utility functions for tests
export const testUtils = {
  // Create test user ID
  createTestUserId: (prefix = "test-user") =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Wait for async operations
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Create test memory data
  createTestMemory: (overrides = {}) => ({
    userId: testUtils.createTestUserId(),
    type: "journal_entry" as const,
    content: "Test memory content",
    element: "air" as const,
    timestamp: new Date(),
    ...overrides,
  }),

  // Validate oracle response structure
  validateOracleResponse: (response: any) => {
    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(10);
    expect(response).toBeValidOracleResponse();
  },

  // Create test conversation flow
  createConversationFlow: (
    exchanges: Array<{ prompt: string; expectedKeywords?: string[] }>,
  ) => {
    return exchanges.map((exchange) => ({
      ...exchange,
      expectedKeywords: exchange.expectedKeywords || [],
    }));
  },

  // Performance measurement utility
  measurePerformance: async <T>(
    operation: () => Promise<T>,
    label: string,
  ): Promise<{ result: T; duration: number }> => {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;

    console.log(`[PERF] ${label}: ${duration}ms`);

    return { result, duration };
  },

  // Mock implementation helpers
  createMockSoulMemory: () => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    storeMemory: jest
      .fn()
      .mockResolvedValue({ id: "mock-id", timestamp: new Date() }),
    retrieveMemories: jest.fn().mockResolvedValue([]),
    semanticSearch: jest.fn().mockResolvedValue([]),
    getSacredMoments: jest.fn().mockResolvedValue([]),
    getActiveArchetypes: jest.fn().mockResolvedValue([]),
    getTransformationJourney: jest.fn().mockResolvedValue({
      milestones: [],
      currentPhase: "initiation",
      nextSpiralSuggestion: "Continue your journey",
    }),
    createMemoryThread: jest
      .fn()
      .mockResolvedValue({ id: "thread-id", memories: [] }),
    getMemoryThreads: jest.fn().mockResolvedValue([]),
  }),

  createMockWisdomEngine: () => ({
    detectPattern: jest.fn().mockResolvedValue({ strength: 0.8, frequency: 3 }),
    selectWisdomApproach: jest
      .fn()
      .mockResolvedValue({ primary: "jung", confidence: 0.9 }),
    generateElementalWisdom: jest
      .fn()
      .mockResolvedValue("Mock elemental wisdom"),
    analyzeConversationFlow: jest
      .fn()
      .mockResolvedValue({ patterns: [], stuckPoints: [] }),
    identifyGrowthEdge: jest
      .fn()
      .mockResolvedValue({ edge: "vulnerability", readiness: 0.7 }),
    getArchetypalActivation: jest.fn().mockResolvedValue({
      dominantArchetype: "Shadow",
      emergingArchetype: "Warrior",
      balanceScore: 0.6,
    }),
  }),
};

// Test data constants
export const testConstants = {
  ELEMENTS: ["fire", "water", "earth", "air", "aether"] as const,
  ORACLE_MODES: [
    "alchemist",
    "buddha",
    "sage",
    "mystic",
    "guardian",
    "tao",
  ] as const,
  MEMORY_TYPES: [
    "oracle_exchange",
    "journal_entry",
    "breakthrough",
    "sacred_moment",
    "shadow_work",
  ] as const,
  EMOTIONAL_TONES: [
    "peaceful",
    "curious",
    "excited",
    "anxious",
    "grateful",
    "angry",
    "sad",
    "joyful",
  ] as const,
  SPIRAL_PHASES: ["initiation", "descent", "revelation", "return"] as const,

  // Sample test prompts for different scenarios
  SAMPLE_PROMPTS: {
    simple: ["How are you?", "I need guidance", "Help me understand"],
    shadow: [
      "I hate this part of myself",
      "I'm struggling with my dark side",
      "I want to work with my shadow",
    ],
    spiritual_bypassing: [
      "I only focus on love and light",
      "Negative emotions are illusions",
      "I've transcended anger",
    ],
    attachment: [
      "I can't let go of the past",
      "I'm clinging to how things were",
      "I'm attached to the outcome",
    ],
    boundaries: [
      "Can we be friends?",
      "I love you",
      "Just make me feel better",
    ],
  },
};

// Global error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
  // Don't exit in tests, just log
});

// Global error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit in tests, just log
});
