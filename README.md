# [Type Link Model (TLM)](https://type.link.model.tools/) Monorepo

TLM is a simple modelling technique inspired by [Object Role Modelling](https://en.wikipedia.org/wiki/Object-role_modeling) that is suitable for working with web APIs and the typical simple tree structures used in web documents.

This is an unfinished hobby project. _Use at your own risk._

## Prerequisites

* latest LTS [node](https://nodejs.org/)
* recent [pnpm](https://pnpm.io/), if you have node, try `corepack enable`
* [docker cli](https://github.com/docker/cli) installed and connected

### Rust version

* latest stable [rust](https://www.rust-lang.org/)

## Build

![CI](https://github.com/lsimons/tlm/workflows/CI/badge.svg)

```shell
pnpm install
pnpm run setup
pnpm run test
```

### Rust version

```shell
cargo build
cargo test
cargo clippy -- -D warnings
```

or run tests with coverage:
```shell
cargo llvm-cov
```

## Code

### TypeScript

Code style follows [Prettier](https://prettier.io/).

### Commits

Follow

> https://conventionalcommits.org/

with types:

- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- revert: undoing (an)other commit(s)
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests
- improvement: Improves code in some other way (that is not a feat or fix)
- chore: Changes that take care of some other kind of chore that doesn't impact the main code

(based on angular conventions https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

## More info

See [docs/](docs/).
