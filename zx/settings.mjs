#!/usr/bin/env zx

import { notice } from "./common.mjs";

const username = os.userInfo().username;

const d = {
  USERNAME: username,
  ENV: "d",
  STACK: username,

  PostgresUser: "postgres",
  PostgresPassword: "postgres",
  PostgresDatabase: "tlm",
  PostgresPort: 5432,
  PostgresHost: "localhost",
  PostgresImage: "postgres",
  PostgresScriptsDir: path.join("packages", "tlm-pgsql", "sql"),
  PostgresContainer: "tlm-pgsql",

  PgTapImage: "lsimons/pgtap",
  PgTapTestsDir: path.join("packages", "tlm-pgsql", "test-sql"),
  PgTapTestsPattern: "*.sql",
  PgTapContainer: "tlm-pgtap",

  SectionStartPrefix: "==> ",
  SectionEndMessage: "",
  ErrorPrefix: "ERROR: ",
};

const s = {};
for (const k in d) {
  s[k] = process.env[k] || d[k];
}

notice`USERNAME: ${s.USERNAME}`;
notice`ENV: ${s.ENV}`;
notice`STACK: ${s.STACK}`;

s.PostgresContainer = `${s.ENV}-${s.STACK}-psql-${s.PostgresDatabase}`;
s.PgTapContainer = `${s.ENV}-${s.STACK}-pgtap-${s.PostgresDatabase}`;

if (s.ENV === "ci") {
  // bind postgres to a different local port to not conflict with local development
  s.PostgresPort = process.env.PostgresPort || 5433;

  // github action workflow command output
  // see https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions
  s.SectionStartPrefix = "::group::";
  s.SectionEndMessage = "::endgroup::";
  s.ErrorPrefix = "::error::";
}

// psql client connection settings
process.env.POSTGRES_USER = process.env.POSTGRES_USER || s.PostgresUser;
process.env.POSTGRES_PASSWORD =
  process.env.POSTGRES_PASSWORD || s.PostgresPassword;
process.env.POSTGRES_DATABASE =
  process.env.POSTGRES_DATABASE || s.PostgresDatabase;
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || s.PostgresHost;
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || s.PostgresPort;

export default s;
