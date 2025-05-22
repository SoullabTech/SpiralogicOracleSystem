// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/playwright',
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3002',
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'pnpm dev',
        port: 3002,
        reuseExistingServer: !process.env.CI,
    },
    globalSetup: './src/test/playwright/setup.ts', // ✅ Fix path here
});
