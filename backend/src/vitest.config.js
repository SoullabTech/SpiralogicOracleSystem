"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// vitest.config.ts
const config_1 = require("vitest/config");
const path_1 = __importDefault(require("path"));
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node', // ✅ Ensures compatibility with SDKs like OpenAI
        setupFiles: ['./test-env.ts'], // ✅ Loads .env.test before tests
        include: ['src/**/*.{test,spec}.{ts,tsx}'], // 🎯 Focus on TS test files
        exclude: [
            'node_modules',
            'dist',
            '.idea',
            '.git',
            '.cache',
            '**/__mocks__/**',
            '**/__fixtures__/**', // Optional: ignore test fixture data
        ],
        reporters: process.env.CI ? ['default', 'junit'] : ['default'], // 🧪 CI-friendly
        coverage: {
            all: true,
            include: ['src/**/*.ts'],
            exclude: ['**/*.test.ts', '**/__tests__/**', '**/__mocks__/**'],
            reporter: ['text', 'html', 'json'],
            reportsDirectory: './coverage',
        },
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, 'src'),
            '@services': path_1.default.resolve(__dirname, 'src/services'),
            '@utils': path_1.default.resolve(__dirname, 'src/utils'),
            '@lib': path_1.default.resolve(__dirname, 'src/lib'),
            '@types': path_1.default.resolve(__dirname, 'src/types'),
        },
    },
});
