const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: '**/transfer-api-final.spec.js',
  fullyParallel: false, // Run tests sequentially to avoid port conflicts
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // CRITICAL: Must be 1 to avoid port conflicts with shared server
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
