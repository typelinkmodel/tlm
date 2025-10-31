import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for coverage testing.
 *
 * This config runs tests against a production build to ensure proper source maps
 * are available for coverage reporting. The production build generates complete
 * source maps that monocart-coverage-reports can use to map bundled code back
 * to original TypeScript/JSX source files.
 *
 * Usage:
 *   pnpm run test:coverage
 *
 * This will:
 * 1. Build the production version with source maps
 * 2. Start the production server
 * 3. Run Playwright tests with coverage collection
 * 4. Stop the server
 *
 * Then run:
 *   pnpm run coverage
 *
 * To convert the V8 coverage to lcov format with proper source mapping.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Run against production build for proper source maps
  webServer: {
    command: "pnpm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // Production server is ready when it starts listening
    // Next.js production server typically starts faster than dev
  },
});
