# Type Link Model (TLM) — retired

**TLM is archived and no longer maintained.** This repository is kept as a
read-only record.

## What it was

TLM was a solo, unfinished experiment in *text-first fact-based modelling*: a
way to describe a domain as a set of elementary facts written as plain
sentences you can read aloud to a domain expert —

```
A Person is identified by id which must be a URI.
A Person has exactly one name.
A Team has at least one lead which must be a Person.
```

— and then generate the technical artifacts (schemas, diagrams, docs, SQL) from
those facts. It drew on
[Object-Role Modeling](https://en.wikipedia.org/wiki/Object-role_modeling)
(ORM), simplified for web APIs and the simple tree structures common in web
documents. It never got past the sketch stage.

## Why it's retired

This is a *contextual* decision, not doctrine. In 2026 the pragmatic landing
spot for "models as code" is [LinkML](https://linkml.io/): it's maintained,
peer-reviewed, and ships the whole generation pipeline — JSON Schema, ER/UML
diagrams, docs, SQL DDL, Pydantic/TypeScript/Java — that TLM only sketched.
Meanwhile the classical fact-based tooling TLM grew out of has withered to a
couple of Windows-GUI survivors. So there was little reason to keep building TLM
and good reason to point people at LinkML instead.

LinkML is *not* a fact-based tool, and adopting it gives up two things TLM/ORM
had: you stop reading the model as sentences, and example data moves out of the
model into separate fixtures. Those losses — and why they're worth accepting
today — are the subject of the article below.

## Where it went

- **Article:**
  [Fact-based modelling and LinkML](https://leosimons.com/2026/07/26/fact-based-modelling-and-linkml/)
  — the thinking behind this decision, with a LinkML worked example.
- **Caseum**, the "M / Models" view — recommends LinkML for models-as-code.

The durable idea here isn't "use LinkML." It's to **model just the facts, and
find them by talking with domain experts — using examples, natural language, and
simple drawings.** That's a human skill; it outlives any particular tool.

## What's kept here

As teaching artifacts, not as living code:

- [`docs/spec/tlmd.md`](docs/spec/tlmd.md) — the TLMD notation, a clean
  illustration of fact-oriented sentences.
- [`docs/design/`](docs/design/) — sample models (HR, media, messages) in TLMD
  and rendered into various formats.

### TLMD → LinkML, roughly

| TLMD sentence form  | LinkML                            |
| ------------------- | --------------------------------- |
| `is identified by`  | `identifier: true`                |
| `has exactly one`   | `required: true` (single)         |
| `has at most one`   | optional single (the default)     |
| `has at least one`  | `required: true` + `multivalued: true` |
| `can have some`     | `multivalued: true` (optional)    |
| `has toggle`        | `range: boolean`                  |
| `which must be a X` | `range: X`                        |

LinkML labels only one direction of a link (so it loses TLM's coach/coachee
named-role pairs) and has no XSD generator. See the article for the full worked
example.

## Building (for the record)

The code still builds and its tests still pass. Requires
[node](https://nodejs.org/), [pnpm](https://pnpm.io/) (`corepack enable`), and
the [docker cli](https://github.com/docker/cli).

```shell
mise install        # one-time: install pinned toolchains
mise run install    # pnpm install
mise run sql:setup  # start Postgres in Docker
mise run test       # run the unit tests
mise run sql:destroy
```
