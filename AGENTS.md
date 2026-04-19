# Agent Instructions for tlm

> This file (`AGENTS.md`) is the canonical agent configuration. `CLAUDE.md` is a symlink to this file.

Type Link Model (TLM) — TypeScript monorepo managed with pnpm.
[`mise`](https://mise.jdx.dev/) is the top-level entry point: it pins
every toolchain version and exposes every repo command as a task (see
`.mise.toml`). Tasks are namespaced `<lang>:<verb>` so you can fan out
at any granularity.

## Quick Reference

First time in a fresh clone: `mise install` (downloads + pins the
toolchain), then `mise run install` (pnpm install).

- **Install all deps**: `mise run install`
- **Lint all**: `mise run lint` (or `ts:lint`)
- **Format all**: `mise run format`
- **Test (unit)**: `mise run test`
- **Postgres lifecycle** (for integration/SQL tests): `mise run sql:setup` / `sql:destroy`
- **CI**: `mise run ci:ts`
- **Full CI gate**: `mise run ci`
- **Watch PR CI**: `mise run ci-watch`

Per-language native commands still work when mise isn't in the way:

| Language   | Install         | Lint                         | Test                 |
|------------|-----------------|------------------------------|----------------------|
| TypeScript | `pnpm install`  | `pnpm lint` (from repo root) | `pnpm -r run test`   |

## Structure

```
tlm/
├── packages/
│   ├── tlm-core-db/       # Database abstractions
│   ├── tlm-core-model/    # Core modeling types
│   ├── tlm-pgsql/         # PostgreSQL implementation
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

**Database:** PostgreSQL via Docker. SQL tests use pgTAP.

**Specs:** Significant features need a spec in `docs/spec/`. Wait for human review before implementing.

## Commit Message Convention

Follow [Conventional Commits](https://conventionalcommits.org/):

**Format:** `type(scope): description`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `perf`, `revert`, `improvement`, `chore`

## Session Completion

Work is NOT complete until a PR is merged and local `main` is back in
sync with `origin/main`. Drive every change through a short-lived
branch; do not commit directly to `main`.

1. **Quality gates** (if code changed):
   ```bash
   mise run ci
   ```

2. **Branch + commit**: if you're still on `main`, cut a feature
   branch before committing. Use a Conventional-Commits type as the
   branch prefix (`feat/...`, `fix/...`, `chore/bump-deps`, etc.).
   Stage files by name — avoid `git add -A` / `git add .` so secrets
   and build output don't sneak in.
   ```bash
   git checkout -b <type>/<short-slug>
   git status
   git add <files>
   git commit -m "<type>(<scope>): <description>"
   ```

3. **Push the branch**:
   ```bash
   git push -u origin HEAD
   ```

4. **Open a PR** against `main`:
   ```bash
   gh pr create --base main \
     --title "<type>(<scope>): <description>" \
     --body "<summary + test plan>"
   ```

5. **Watch CI** until every required check is green:
   ```bash
   mise run ci-watch
   ```
   On failure, inspect with `gh run view --log-failed`, fix, commit,
   push, and re-watch. Do not proceed until the PR is green.

6. **Merge + sync**:
   ```bash
   gh pr merge --merge --delete-branch
   git checkout main && git pull
   git status  # must show "up to date with origin/main"
   ```

Never stop before `main` is updated with the merged change. If any step
fails, resolve and retry — don't hand back a half-shipped change.
