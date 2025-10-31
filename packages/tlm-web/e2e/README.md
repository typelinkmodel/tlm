# End-to-End Tests

This directory contains Playwright integration tests for the tlm-web application.

## Overview

The e2e tests verify that the Next.js web application behaves correctly from a user's perspective by automating browser interactions.

## Coverage Collection

The Playwright tests automatically collect V8 coverage data from the application during test execution. This coverage data is stored in the `.nyc_output` directory and represents actual code execution during integration tests.

### How It Works

- **Automatic Collection**: The `fixtures.ts` file extends Playwright's test fixture to automatically start and stop JavaScript coverage collection for each test
- **Coverage Storage**: Raw V8 coverage data is saved to `.nyc_output/coverage-*.json` files
- **Filtering**: Only application code served from `localhost:3000` is included; build artifacts, hot-reloader, and node_modules are excluded
- **SonarCloud**: The e2e test code itself is excluded from coverage statistics via `sonar.exclusions` configuration

This approach ensures that integration test coverage supplements unit test coverage, providing a complete picture of code execution.

## Running Tests

### Run all tests (headless)

```bash
pnpm run test
```

### Run tests with UI mode (interactive)

```bash
pnpm run test:ui
```

### Run tests in headed mode (see the browser)

```bash
pnpm run test:headed
```

### Run specific test file

```bash
pnpm exec playwright test home.spec.ts
```

## Test Structure

- **home.spec.ts** - Tests for the home page, including verification that "Hello World" is displayed

## Configuration

The Playwright configuration is located at `playwright.config.ts` in the package root. Key settings:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Web Server**: Automatically starts Next.js dev server before tests
- **Retries**: 2 retries on CI, 0 locally
- **Reporter**: HTML report (generated in `playwright-report/`)

## Writing Tests

Tests use the Playwright Test framework. Basic example:

```typescript
import { test, expect } from "@playwright/test";

test("my test", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

## CI Integration

The tests are configured to run in CI mode when `process.env.CI` is set:

- Forbids `.only` in test files
- Uses 2 retries for flaky test mitigation
- Runs with 1 worker (sequential execution)
- Does not reuse existing server

## Reports

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

## Coverage Notes

The V8 coverage format collected by Playwright differs from Istanbul/NYC coverage format. The raw coverage data is primarily useful for:

- Verifying that tests are exercising application code
- Integration with tools that support V8 coverage format
- Future conversion to lcov format if needed

For now, coverage collection is enabled but not actively converted to lcov reports. This can be extended in the future if detailed coverage metrics from Playwright tests are required.

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Coverage](https://playwright.dev/docs/api/class-coverage)
