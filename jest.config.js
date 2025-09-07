// Jest Configuration for Sacred Pipeline Testing
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
});

const customJestConfig = {
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Path aliases matching tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/data/(.*)$': '<rootDir>/data/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
    
    // Mock CSS and static assets
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'preserve',
      },
    }],
  },
  
  // Global test timeout
  testTimeout: 30000,
  
  // Verbose output for CI
  verbose: process.env.CI === 'true',
};

module.exports = createJestConfig(customJestConfig);