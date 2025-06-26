import { defineConfig, devices, LaunchOptions } from '@playwright/test';
import path from 'path';
import { config as appConfig } from './src/base/configManager'; // Import our ConfigManager instance

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './features', // Point to the directory where feature files are located
  /* Maximum time one test can run for. */
  timeout: 60 * 1000, // 60 seconds
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000, // 10 seconds
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 10 * 1000, // 10 seconds
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take a screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video */
    video: 'retain-on-failure',

    headless: process.env.HEADLESS ? process.env.HEADLESS === 'true' : !appConfig.BROWSER_LAUNCH_ARGS?.includes('--no-headless'), // Default to true, respect --no-headless arg
    viewport: (appConfig.VIEWPORT_WIDTH && appConfig.VIEWPORT_HEIGHT)
                ? { width: appConfig.VIEWPORT_WIDTH, height: appConfig.VIEWPORT_HEIGHT }
                : undefined, // Use Playwright default if not set
    ignoreHTTPSErrors: appConfig.BROWSER_LAUNCH_ARGS?.includes('--ignore-certificate-errors'), // Example of using a launch arg

    launchOptions: {
      args: appConfig.BROWSER_LAUNCH_ARGS || [],
      // slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0, // Example for slowMo
    } as LaunchOptions, // Cast to LaunchOptions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Example of overriding viewport per project if needed, falls back to global use.viewport
        // viewport: { width: 1920, height: 1080 },
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

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});
