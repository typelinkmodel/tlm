# Agent Instructions for tlm

Type Link Model (TLM) - multi-language monorepo with TypeScript and Rust.

## Quick Reference

- **Setup**: `pnpm install && pnpm run setup`
- **Test**: `pnpm run test` (TS) / `cargo test` (Rust)
- **Lint**: `pnpm run lint` (TS) / `cargo clippy -- -D warnings` (Rust)
- **Format**: `pnpm run prettier`
- **CI**: `pnpm run ci` (TS) / `pnpm run ci-rust` (Rust)

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
   pnpm run lint && pnpm run test
   cargo clippy -- -D warnings && cargo test
   ```

2. **Push**:
   ```bash
   git pull --rebase && git push
   git status  # must show "up to date with origin"
   ```

Never stop before pushing. If push fails, resolve and retry.
