import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Specs that mutate state shared by the single QA customer account (cart, wishlist,
 * address, orders, wallet) or the COD test product. They run in one single-worker
 * project so they never overlap. The remaining user specs only read data and stay parallel.
 */
const sharedStateSpecs = [
  /tests\/e2e\/.*\.spec\.ts/,
  /tests\/user\/(cart|wishlist|checkout|address|product-details|shop)\.spec\.ts/,
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Max time one test can run. Generous enough for remote (Render) if BASE_URL points there. */
  timeout: 60_000,
  /* Default timeout for expect() web-first assertions. */
  expect: { timeout: 10_000 },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL comes from .env (BASE_URL). Switch local vs Render by editing .env only. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Generous enough for a remote host, comfortable for local. */
    navigationTimeout: 30_000,
    actionTimeout: 15_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup projects — each logs in a role once and saves its storageState.
    {
      name: 'setup-user',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'setup-admin',
      testMatch: /admin\.setup\.ts/,
    },

    // Main user suite: authenticated as a normal user. Excludes admin specs.
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      testIgnore: [/tests\/admin\//, /tests\/api\//, ...sharedStateSpecs],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup-user'],
    },

    // Admin suite: authenticated as admin, only runs specs under tests/admin/.
    {
      name: 'admin',
      testMatch: /tests\/admin\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },

    // API suite: no page, only HTTP via APIRequestContext. The built-in `request`
    // fixture inherits the user storageState, so it carries the user's session cookie.
    // Admin calls open their own context from admin.json (see api/request-context.ts).
    // workers: 1 because cart/wishlist specs mutate the single QA account.
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup-user', 'setup-admin'],
      workers: 1,
    },

    // Shared-state lane: customer specs that mutate the one QA account, plus cross-role
    // lifecycle specs that open an admin context from admin.json inside the same test.
    // workers: 1 limits THIS project to one test at a time.
    {
      name: 'shared-state',
      testMatch: sharedStateSpecs,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup-user', 'setup-admin', 'api'],
      workers: 1,
    },

    // Cross-browser coverage: only @smoke tests, logged-out. Keeps runs fast.
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@smoke/,
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@smoke/,
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
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
