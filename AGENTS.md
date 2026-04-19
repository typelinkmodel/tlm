# Agent Instructions for tlm

Type Link Model (TLM) - multi-language monorepo with TypeScript and Rust.

## Quick Reference

- **One-time**: `mise install`
- **Setup**: `mise run install && pnpm run setup`
- **Test (TS)**: `mise run test` (or `pnpm run test`)
- **Test (Rust)**: `mise run ci:rust` (wraps `pnpm run ci-rust`)
- **Lint (TS)**: `mise run lint` (or `pnpm run lint`)
- **Format**: `mise run prettier`
- **CI (TS)**: `mise run ci:ts`
- **CI (Rust)**: `mise run ci:rust`
- **Full CI gate**: `mise run ci`

## Structure

```
tlm/
├── packages/
│   ├── tlm-core-db/       # Database abstractions
│   ├── tlm-core-model/    # Core modeling types
│   ├── tlm-pgsql/         # PostgreSQL implementation
│   ├── tlm-rust/          # Rust implementation
│   └── tlm-tests/         # Integration tests
├── zx/                    # Build automation scripts
└── docs/                  # Documentation
```

## Guidelines

**TypeScript:**
- ESLint + Prettier: zero warnings/errors
- Strict TypeScript, no `any` types
- Jest testing, minimum 80% coverage
- Test files: `*.test.ts` or `*.spec.ts`

**Rust:**
- `cargo clippy -- -D warnings`: zero warnings
- `cargo test`: all tests pass
- `cargo llvm-cov` for coverage

**Database:** PostgreSQL via Docker. SQL tests use pgTAP.

**Specs:** Significant features need a spec in `docs/spec/`. Wait for human review before implementing.

## Commit Message Convention

Follow [Conventional Commits](https://conventionalcommits.org/):

**Format:** `type(scope): description`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `perf`, `revert`, `improvement`, `chore`

## Session Completion

Work is NOT complete until `git push` succeeds.

1. **Quality gates** (if code changed):
   ```bash
   mise run ci
   ```

2. **Push**:
   ```bash
   git pull --rebase && git push
   git status  # must show "up to date with origin"
   ```

Never stop before pushing. If push fails, resolve and retry.
