import { test as base } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const coverageDir = path.join(__dirname, "..", ".nyc_output");

type CoverageFixtures = {
  autoTestFixture: string;
};

export const test = base.extend<CoverageFixtures>({
  autoTestFixture: [
    async ({ page }, use) => {
      // Start collecting coverage before each test
      await page.coverage.startJSCoverage({
        resetOnNavigation: false,
      });

      await use("");

      // Stop collecting coverage after each test
      const coverage = await page.coverage.stopJSCoverage();

      // Ensure coverage directory exists
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      // Filter coverage to only include application code
      const filteredCoverage = coverage.filter((entry) => {
        const url = entry.url;
        return (
          url.includes("localhost:3000") &&
          !url.includes("node_modules") &&
          !url.includes("/_next/static/chunks/webpack") &&
          !url.includes("/_next/static/chunks/polyfills") &&
          !url.includes("hot-reloader")
        );
      });

      // Save coverage data
      if (filteredCoverage.length > 0) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const coverageFile = path.join(
          coverageDir,
          `coverage-${timestamp}-${random}.json`,
        );
        fs.writeFileSync(
          coverageFile,
          JSON.stringify(filteredCoverage, null, 2),
        );
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
