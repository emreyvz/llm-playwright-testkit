import { defineConfig, devices, LaunchOptions } from '@playwright/test';
import path from 'path';
import { config as appConfig } from './base/configManager';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './features',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  use: {
    actionTimeout: 10 * 1000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    acceptDownloads: true,
    headless: process.env.HEADLESS == 'true',
    viewport: (appConfig.VIEWPORT_WIDTH && appConfig.VIEWPORT_HEIGHT)
                ? { width: appConfig.VIEWPORT_WIDTH, height: appConfig.VIEWPORT_HEIGHT }
                : undefined,
    ignoreHTTPSErrors: appConfig.BROWSER_LAUNCH_ARGS?.includes('--ignore-certificate-errors'),
    launchOptions: {
      args: appConfig.BROWSER_LAUNCH_ARGS || [],
    } as LaunchOptions,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  outputDir: 'test-results/',
});
