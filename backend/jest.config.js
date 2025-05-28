import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Ensure that you are using jsdom for the tests
    setupFiles: ['./test-env.ts'], // Make sure the setup file path is correct
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Define the test file types
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'], // Exclude unnecessary files
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Resolving `@/` to `src/`
      '@services': path.resolve(__dirname, './src/services'), // Resolving `@services/` to `src/services/`
      '@utils': path.resolve(__dirname, './src/utils'), // Resolving `@utils/` to `src/utils/`
      '@lib': path.resolve(__dirname, './src/lib'), // Resolving `@lib/` to `src/lib/`
    },
  },
});
