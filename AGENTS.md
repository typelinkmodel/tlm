# Agent Instructions for tlm

Type Link Model (TLM) - multi-language monorepo with TypeScript and Rust.

## Quick Reference

- **One-time**: `mise install`
- **Install deps**: `mise run install`
- **Lint**: `mise run lint` (or `ts:lint` / `rs:lint` per language)
- **Format**: `mise run format`
- **Test (unit)**: `mise run test`
- **Postgres lifecycle** (for integration/SQL tests): `mise run sql:setup` / `sql:destroy`
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
│   ├── tlm-tests/         # Cucumber integration tests
│   └── tlm-web/           # Next.js web app + Playwright e2e
├── zx/                    # Docker/Postgres orchestration scripts
└── docs/                  # Documentation
```

## Guidelines

**TypeScript:**
- Biome for lint + format: zero errors (warnings allowed during migration)
- Strict TypeScript
- Jest testing, minimum 80% coverage
- Test files: `*.test.ts` or `*.spec.ts`

**Rust:**
- Workspace-level clippy pedantic + `unsafe_code = "forbid"`
- `cargo fmt --check`: zero diffs
- `cargo clippy -- -D warnings`: zero warnings
- `cargo llvm-cov` produces `codecov.json` for Codecov upload

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
