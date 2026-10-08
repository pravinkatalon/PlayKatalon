import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
    viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
    launchOptions: {
      args: process.env.CI ? [] : ['--start-maximized'],
    },
  },
  projects: [
    {
      name: 'OrangeHRM Tests',
      testMatch: '**/orangehrm.spec.ts',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        // Test Cloud maps this to Chrome 151 via its capabilities
      },
    },
  ],
});
