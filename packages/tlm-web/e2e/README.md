# End-to-End Tests

This directory contains Playwright integration tests for the tlm-web application.

## Overview

The e2e tests verify that the Next.js web application behaves correctly from a user's perspective by automating browser interactions.

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

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)