# AGENTS.md - Instructions for AI Coding Agents

This document provides guidelines for AI coding agents working on the **Type Link Model (TLM)** project.

## Project Overview

- **Multi-language monorepo**: TypeScript (primary) and Rust
- **Package manager**: pnpm with workspaces
- **Architecture**: Modular packages in `packages/` directory
- **Testing**: Jest for TypeScript, cargo test for Rust
- **CI/CD**: GitHub Actions with comprehensive quality gates
- **Code quality**: ESLint, Prettier, cargo clippy with strict standards

## Project Structure

```
tlm/
├── packages/
│   ├── tlm-core-db/       # Database abstractions
│   ├── tlm-core-model/    # Core modeling types
│   ├── tlm-pgsql/         # PostgreSQL implementation
│   ├── tlm-rust/          # Rust implementation
│   └── tlm-tests/         # Integration tests
├── zx/                    # Build automation scripts
├── docs/                  # Documentation and design
└── [config files]        # Root-level configuration
```

## Development Standards

### Code Quality Requirements

All code must meet these quality standards:

1. **TypeScript Coverage**: Minimum 80% test coverage (branches, functions, lines, statements)
2. **ESLint**: Zero warnings or errors
3. **Prettier**: All code must be formatted
4. **Rust**: Zero clippy warnings with `-D warnings` flag
5. **Type Safety**: Strict TypeScript configuration, no `any` types

### Commit Message Convention

Follow [Conventional Commits](https://conventionalcommits.org/) with these types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `build`: Build system changes
- `ci`: CI configuration changes
- `perf`: Performance improvements
- `revert`: Reverting commits
- `improvement`: General code improvements
- `chore`: Maintenance tasks

**Format**: `type(scope): description`
**Example**: `feat(core-model): add new validation rules`

## Building and Testing

### Initial Setup

```bash
pnpm install
pnpm run setup      # Sets up development environment including PostgreSQL
```

### Development Commands

```bash
# TypeScript development
pnpm run test       # Run all tests
pnpm run lint       # Lint all packages
pnpm run prettier   # Format code
pnpm run clean      # Clean build artifacts

# Rust development
cargo build         # Build Rust code
cargo test          # Run Rust tests
cargo clippy -- -D warnings  # Lint with zero tolerance

# Full CI pipeline (what runs in GitHub Actions)
pnpm run ci         # TypeScript CI: clean, lint, setup, test, destroy
pnpm run ci-rust    # Rust CI: lint and test
```

### Package-Level Commands

Each package supports:

- `pnpm run clean` - Remove build artifacts
- `pnpm run compile` - Compile TypeScript
- `pnpm run test` - Run package tests
- `pnpm run lint` - Lint package code

## Architecture Guidelines

### TypeScript Packages

1. **Structure**: Each package follows the pattern:

   ```
   package/
   ├── src/          # Source code
   ├── test/         # Tests
   ├── lib/          # Compiled output (generated)
   └── package.json  # Package configuration
   ```

2. **Dependencies**:
   - Use workspace dependencies with `@typelinkmodel/` namespace
   - All packages are currently private (`"private": true`)
   - Prefer minimal external dependencies

3. **Testing**:
   - Test files: `*.test.ts` or `*.spec.ts`
   - Use Jest framework
   - Maintain 80%+ coverage across all metrics
   - Include unit and integration tests

### Rust Implementation

1. **Structure**: Located in `packages/tlm-rust/`
2. **Testing**: Use standard `cargo test`
3. **Linting**: Must pass `cargo clippy -- -D warnings`
4. **Coverage**: Use `cargo llvm-cov` for coverage reports

### Database Integration

- PostgreSQL is the primary database
- Development uses Docker containers
- Test database setup/teardown is automated
- SQL scripts in `packages/tlm-pgsql/sql/`
- SQL tests using pgTAP in `packages/tlm-pgsql/test-sql/`

## AI Agent Best Practices

### Code Changes

1. **Always run tests** after making changes:

   ```bash
   pnpm run test
   ```

2. **Lint before committing**:

   ```bash
   pnpm run lint
   ```

3. **Format code consistently**:

   ```bash
   pnpm run prettier
   ```

4. **For Rust changes**, ensure:
   ```bash
   cargo clippy -- -D warnings
   cargo test
   ```

### Making Changes

1. **Understand context**: Read existing code and tests before modifying
2. **Maintain patterns**: Follow existing code organization and naming conventions
3. **Update tests**: Modify or add tests for any functional changes
4. **Preserve coverage**: Ensure test coverage doesn't drop below 80%
5. **Type safety**: Use strict typing, avoid `any` or type assertions

### Testing Strategy

1. **Unit tests**: Test individual functions and classes
2. **Integration tests**: Test package interactions
3. **SQL tests**: Use pgTAP for database functionality
4. **Coverage**: Verify with `jest --coverage` or check coverage reports

### Documentation

1. **Code comments**: Use TSDoc/JSDoc for public APIs
2. **README updates**: Update package READMEs for significant changes
3. **Type definitions**: Maintain accurate TypeScript types
4. **Architecture docs**: Update `docs/` for structural changes

## Environment and Dependencies

### Required Tools

- **Node.js**: LTS version
- **pnpm**: Latest stable version
- **Docker**: For PostgreSQL development database
- **Rust**: Latest stable version

### Configuration Files

Key configuration files to respect:

- `tsconfig.base.json` - TypeScript base configuration
- `eslint.config.js` - ESLint rules (using flat config)
- `jest.config.base.js` - Jest base configuration
- `pnpm-workspace.yaml` - Workspace definition

## CI/CD Pipeline

The GitHub Actions workflow runs:

1. **Setup**: Install dependencies, setup Rust toolchain
2. **TypeScript CI**:
   - Clean build artifacts
   - Lint all packages
   - Setup test environment (PostgreSQL)
   - Run all tests
   - Destroy test environment
3. **Rust CI**:
   - Lint with clippy
   - Run tests
4. **Quality Gates**:
   - SonarQube analysis
   - Codecov coverage reporting

### Coverage Requirements

- **Global target**: 85% (as configured in codecov.yml)
- **Jest threshold**: 80% minimum for branches, functions, lines, statements
- **Rust coverage**: Tracked via `cargo llvm-cov`

## Troubleshooting

### Common Issues

1. **PostgreSQL not starting**: Run `pnpm run setup` to initialize containers
2. **Test failures**: Check if Docker is running and accessible
3. **Lint errors**: Run `pnpm run prettier` to fix formatting issues
4. **Coverage drops**: Add tests for new code paths
5. **Rust clippy warnings**: Address all warnings - project uses `-D warnings`

### Debug Commands

```bash
# Check PostgreSQL status
docker ps | grep tlm

# Restart development environment
pnpm run destroy && pnpm run setup

# Run tests with verbose output
pnpm run test -- --verbose

# Check specific package
cd packages/[package-name] && pnpm test
```

## Code Examples

### Adding a New TypeScript Package Feature

1. **Write the test first**:

   ```typescript
   // test/feature.test.ts
   import { newFeature } from "../src/feature";

   describe("newFeature", () => {
     it("should handle input correctly", () => {
       expect(newFeature("input")).toBe("expected");
     });
   });
   ```

2. **Implement the feature**:

   ```typescript
   // src/feature.ts
   export function newFeature(input: string): string {
     // Implementation
     return "expected";
   }
   ```

3. **Update exports**:

   ```typescript
   // src/index.ts
   export { newFeature } from "./feature";
   ```

4. **Verify**:
   ```bash
   pnpm run test
   pnpm run lint
   ```

### Adding Rust Functionality

1. **Write test**:

   ```rust
   #[cfg(test)]
   mod tests {
       use super::*;

       #[test]
       fn test_new_function() {
           assert_eq!(new_function("input"), "expected");
       }
   }
   ```

2. **Implement**:

   ```rust
   pub fn new_function(input: &str) -> String {
       // Implementation
       "expected".to_string()
   }
   ```

3. **Verify**:
   ```bash
   cargo test
   cargo clippy -- -D warnings
   ```

## Final Notes

- This is a **hobby project** - prioritize learning and code quality over speed
- **Maintain backwards compatibility** when possible
- **Document breaking changes** clearly
- **Ask questions** if project patterns are unclear
- **Preserve the Apache-2.0 license** headers where present

Follow these guidelines to maintain the project's high quality standards and contribute effectively to the TLM codebase.
