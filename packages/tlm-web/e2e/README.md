# End-to-End Tests

This directory contains Playwright integration tests for the tlm-web application.

## Overview

The e2e tests verify that the Next.js web application behaves correctly from a user's perspective by automating browser interactions.

## Coverage Collection

The Playwright tests automatically collect V8 coverage data from the application during test execution. This coverage is then converted to lcov format using **monocart-coverage-reports** for consumption by SonarCloud and other coverage tools.

**⚠️ Important**: E2E coverage for Next.js applications with React Server Components (RSC) will naturally be low, as most code runs server-side. E2E tests measure browser-side JavaScript only. See [COVERAGE.md](./COVERAGE.md) for details.

### Quick Coverage Workflow

```bash
# 1. Run Playwright tests (collects V8 coverage)
pnpm run test

# 2. Convert coverage to lcov format with source mapping
pnpm run coverage

# 3. View coverage report
open coverage/html/index.html
```

### Understanding E2E Coverage

E2E tests collect coverage from JavaScript that **actually runs in the browser**:

- ✅ **Covers**: Client components, browser interactions, client-side state management
- ❌ **Does NOT cover**: Server Components (most Next.js 16 apps), server-side rendering
- 📖 **See**: [COVERAGE.md](./COVERAGE.md) for comprehensive documentation on:
  - Source mapping challenges and solutions
  - Why coverage numbers are low for RSC apps
  - Hybrid coverage strategy (unit tests + e2e tests)
  - Troubleshooting source map resolution
  - Production build vs development mode

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

## Coverage Technical Details

For comprehensive information about coverage implementation, source mapping, and troubleshooting, see **[COVERAGE.md](./COVERAGE.md)**.

### Summary

- **Collection**: Playwright's `page.coverage` API collects V8 coverage from the browser
- **Conversion**: `monocart-coverage-reports` converts V8 coverage to lcov with source map resolution
- **Source Mapping**: Maps bundled JavaScript URLs to original TypeScript/JSX source files
- **Filtering**: Includes only application code from `src/`, excludes node_modules and Next.js internals
- **Output**: lcov for SonarCloud, HTML for developers, JSON for tools

**Note**: Source mapping from production builds works better than dev mode due to how Turbopack generates source maps. See [COVERAGE.md](./COVERAGE.md) for details.

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Coverage](https://playwright.dev/docs/api/class-coverage)
- [E2E Coverage Details](./COVERAGE.md) - Comprehensive coverage documentation
