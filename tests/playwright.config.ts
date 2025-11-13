import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for VOID E2E Smoke Tests
 * Purpose: Lightweight smoke testing to validate demo readiness
 * Run: npm run test:e2e
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for smoke tests
  forbidOnly: !!process.env.CI, // Fail on CI if test.only() left in
  retries: process.env.CI ? 2 : 0, // Retry on CI
  workers: 1, // Single worker for smoke tests
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for dev server to start
  },
});
