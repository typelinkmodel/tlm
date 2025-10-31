# E2E Test Coverage with Source Mapping

This document explains how coverage works for Playwright end-to-end tests in the tlm-web package and the current state of source mapping.

## Overview

The e2e tests use Playwright to collect V8 coverage data from the browser during test execution. This coverage is then converted to lcov format using **monocart-coverage-reports**, which handles source map resolution to map bundled JavaScript back to original TypeScript/JSX source files.

## Current Implementation

### Coverage Collection (fixtures.ts)

The `fixtures.ts` file extends Playwright's test fixture to automatically collect JavaScript coverage:

1. **Before each test**: Starts V8 coverage collection with `page.coverage.startJSCoverage()`
2. **After each test**: Stops coverage and saves to `.nyc_output/coverage-*.json`
3. **Filtering**: Excludes Next.js internals, HMR client, and node_modules

### Coverage Conversion (zx/convert-coverage.mjs)

The conversion script uses **monocart-coverage-reports** to:

1. Read V8 coverage JSON files from `.nyc_output/`
2. Resolve source maps from bundled JavaScript to original source files
3. Generate multiple report formats (lcov, HTML, JSON)
4. Filter to only include application source code from `src/`

### Why monocart-coverage-reports?

- **Purpose-built** for V8 coverage from browsers (Playwright, Puppeteer)
- **Automatic source map resolution** - discovers and applies source maps
- **Handles complex builds** - works with webpack, Turbopack, and other bundlers
- **Multiple output formats** - lcov for SonarCloud, HTML for developers, JSON for tools
- **Source filtering** - includes only your application code in reports

## The Source Mapping Challenge

### Development Mode (Default)

When running tests with `pnpm run test`:

- ✅ **Fast iteration** - Next.js dev server with hot reloading
- ✅ **Coverage collection works** - V8 coverage is collected from the browser
- ❌ **Source maps incomplete** - Turbopack in dev mode generates source maps on-the-fly but doesn't write complete ones to disk
- ❌ **Cannot map to source** - Coverage shows URLs like `http://localhost:3000/_next/static/chunks/...` instead of `src/app/page.tsx`

### Production Mode (For Coverage)

When running tests with `pnpm run test:coverage`:

- ✅ **Complete source maps** - Production build generates full source maps to disk
- ✅ **Can map to source** - monocart can resolve mappings from bundles to source files
- ⚠️ **Minimal client-side code** - Next.js 16 with React Server Components renders most content server-side
- ⚠️ **Low coverage numbers** - Only interactive/client components execute JavaScript in the browser

### The React Server Components Reality

Modern Next.js applications with React Server Components (RSC) render most of the page on the server:

```typescript
// src/app/page.tsx - This is a SERVER component by default
export default function Page() {
  return <h1>Hello World</h1>;
}
```

This code:
- ❌ **Does NOT run in the browser** - Rendered to HTML on the server
- ❌ **NOT in browser coverage** - e2e tests only measure browser-side JavaScript
- ✅ **Should be tested with unit tests** - Use Jest/Testing Library for component testing

Only client components with the `'use client'` directive run JavaScript in the browser:

```typescript
// src/app/interactive.tsx - CLIENT component
'use client';
import { useState } from 'react';

export default function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Current Status: Source Mapping with Production Build

### ✅ Working

1. **Production build generates source maps**: `productionBrowserSourceMaps: true` in `next.config.ts`
2. **monocart-coverage-reports configured**: Reads source maps and resolves them
3. **Coverage collection**: V8 coverage is successfully collected during tests
4. **Report generation**: lcov, HTML, and JSON reports are generated

### ⚠️ Limitations

1. **Low coverage numbers**: The sample app has minimal client-side JavaScript (only ~5 statements)
2. **Mostly server-rendered**: Next.js RSC apps don't send much JavaScript to the browser
3. **Source map paths**: Some mappings use `turbopack:///[project]/` virtual paths that may need URL rewriting

### ❌ Not Working Yet

1. **Source file resolution**: Coverage still shows `localhost-3000` instead of actual source paths like `src/app/page.tsx`
2. **Turbopack source map format**: May need custom resolver for `turbopack:///` URLs in source maps

## Recommended Approach: Hybrid Coverage Strategy

### 1. Unit Tests (Jest) - Primary Coverage Source

Use Jest with Testing Library for **component-level coverage**:

```bash
pnpm run test:unit  # Run Jest tests with coverage
```

**Covers**:
- React components (server and client)
- Business logic and utilities
- State management
- Data fetching and transformations

**Advantages**:
- ✅ Fast execution
- ✅ Complete coverage of component logic
- ✅ No source mapping issues (tests run in Node.js with direct TypeScript)
- ✅ Easy to debug

### 2. E2E Tests (Playwright) - Integration Coverage

Use Playwright for **user workflow coverage**:

```bash
pnpm run test  # Run e2e tests
```

**Covers**:
- Critical user paths
- Client-side interactions
- Browser-specific code
- Integration between components
- Client components with 'use client'

**Advantages**:
- ✅ Tests real user scenarios
- ✅ Catches integration bugs
- ✅ Validates production behavior

**Note**: E2E coverage numbers will be low for RSC apps - this is expected and normal.

### 3. Combined Coverage

SonarCloud and other tools should combine both:

```yaml
# sonar-project.properties
sonar.javascript.lcov.reportPaths=
  packages/tlm-web/coverage/lcov.info,        # E2E coverage
  packages/tlm-web/coverage/unit/lcov.info    # Unit test coverage (when added)
```

## Usage

### Quick Start (Development)

```bash
# Run e2e tests (dev mode - fast iteration)
pnpm run test

# No coverage conversion needed for development
```

### Coverage Reports (Production Build)

```bash
# 1. Build production version with source maps
pnpm run build

# 2. Run tests against production build
pnpm run start &  # Start production server
pnpm run test     # Run tests (or use test:coverage config)
# (kill the server after tests complete)

# 3. Convert coverage to lcov with source mapping
pnpm run coverage

# 4. View HTML report
open coverage/html/index.html
```

### CI/CD Pipeline

```yaml
# In GitHub Actions or similar
steps:
  - name: Install dependencies
    run: pnpm install

  - name: Build for coverage
    run: pnpm run build

  - name: Run e2e tests with coverage
    run: |
      pnpm run start &
      sleep 5
      pnpm run test
      pkill -f "next start"

  - name: Convert coverage
    run: pnpm run coverage

  - name: Upload to SonarCloud
    uses: SonarSource/sonarcloud-github-action@master
```

## Troubleshooting

### Issue: Coverage shows URLs instead of source paths

**Symptom**: `lcov.info` contains `SF:localhost-3000` instead of `SF:src/app/page.tsx`

**Cause**: Source maps aren't being resolved correctly

**Solutions**:
1. ✅ Use production build: `pnpm run build` before tests
2. ✅ Check `productionBrowserSourceMaps: true` in `next.config.ts`
3. 🔄 Configure monocart source path resolver for `turbopack:///` URLs (TODO)

### Issue: Very low coverage numbers (5-10%)

**Symptom**: Only a few statements covered despite many tests

**Cause**: This is **expected** for Next.js RSC apps - most code runs on the server

**Solutions**:
1. ✅ Add unit tests with Jest for component coverage
2. ✅ Add client components with `'use client'` if you need interactivity
3. ✅ Combine e2e and unit test coverage in SonarCloud

### Issue: Source maps not found

**Symptom**: `[MCR]` warnings about missing source maps

**Cause**: monocart can't fetch `.map` files from the server

**Solutions**:
1. ✅ Ensure server is running when converting coverage
2. ✅ Configure source map loader in `convert-coverage.mjs` to read from `.next/static/`
3. 🔄 Implement custom source map fetcher (TODO)

## Next Steps (TODO)

To fully resolve source mapping for this project:

1. **Custom source path resolver**: Handle `turbopack:///[project]/` URLs in source maps
   ```javascript
   // In convert-coverage.mjs
   sourcePath: (filePath) => {
     if (filePath.startsWith('turbopack:///[project]/')) {
       return filePath.replace('turbopack:///[project]/', projectRoot + '/');
     }
     return filePath;
   }
   ```

2. **Source map loader**: Teach monocart to read from `.next/static/chunks/*.map` files
   ```javascript
   sourceMap: {
     loader: async (url) => {
       // Map HTTP URL to local .next file system path
       // Read and return the source map content
     }
   }
   ```

3. **Add unit tests**: Create Jest configuration for component testing
   ```bash
   # Install testing dependencies
   pnpm add -D @testing-library/react @testing-library/jest-dom

   # Create jest.config.js for unit tests
   # Add test:unit script to package.json
   ```

4. **Combine coverage**: Configure SonarCloud to merge unit and e2e coverage

## References

- [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports) - V8 coverage to lcov converter
- [Playwright Coverage API](https://playwright.dev/docs/api/class-coverage) - Browser coverage collection
- [Next.js Source Maps](https://nextjs.org/docs/app/api-reference/next-config-js/productionBrowserSourceMaps) - Configuration
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) - Understanding RSC

## Summary

**Current state**: E2E coverage collection works, but source mapping from bundled code to source files is not yet complete due to Turbopack's virtual source map paths.

**Recommended approach**: Use **unit tests (Jest) for component coverage** and **e2e tests (Playwright) for integration testing**. E2E coverage numbers will be naturally low for RSC apps - this is expected and correct.

**To fix source mapping**: Implement custom resolvers in `convert-coverage.mjs` to handle `turbopack:///` virtual paths and read source maps from `.next/static/` directory.