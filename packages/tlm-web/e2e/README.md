# End-to-End Tests

This directory contains Playwright integration tests for the tlm-web application.

## Overview

The e2e tests verify that the Next.js web application behaves correctly from a user's perspective by automating browser interactions.

## Coverage Collection

The Playwright tests automatically collect V8 coverage data from the application during test execution. This coverage is then converted to Istanbul/lcov format for consumption by SonarCloud and other coverage tools.

### How It Works

1. **Automatic Collection**: The `fixtures.ts` file extends Playwright's test fixture to automatically start and stop JavaScript coverage collection for each test
2. **Coverage Storage**: Raw V8 coverage data is saved to `.nyc_output/coverage-*.json` files
3. **Filtering**: Only application code served from `localhost:3000` is included; build artifacts, hot-reloader, and node_modules are excluded
4. **Conversion**: Run `pnpm run coverage` to convert V8 coverage to Istanbul format and generate lcov reports
5. **SonarCloud Integration**: The generated `coverage/lcov.info` file is picked up by SonarCloud via `sonar.javascript.lcov.reportPaths`

**Important**: The e2e test code itself is excluded from coverage statistics via `sonar.exclusions` configuration, so only application code is measured.

### Coverage Workflow

```bash
# 1. Run Playwright tests (collects V8 coverage)
pnpm run test

# 2. Convert coverage to lcov format
pnpm run coverage

# 3. View coverage report
open coverage/lcov-report/index.html
```

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

## Coverage Technical Details

The coverage conversion process uses:

- **v8-to-istanbul**: Converts V8 coverage format to Istanbul format
- **istanbul-lib-coverage**: Creates coverage maps from Istanbul data
- **istanbul-lib-report** & **istanbul-reports**: Generates lcov and HTML reports

The conversion script (`zx/convert-coverage.mjs`) processes each V8 coverage entry and applies the Playwright documentation example pattern:

```javascript
const converter = v8toIstanbul(virtualPath, 0, { source: entry.source });
await converter.load();
converter.applyCoverage(entry.functions);
const istanbulCoverage = converter.toIstanbul();
```

Coverage entries that cannot be converted (typically build artifacts or external code) are skipped with optional verbose logging available via `VERBOSE=1` environment variable.

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Coverage](https://playwright.dev/docs/api/class-coverage)
