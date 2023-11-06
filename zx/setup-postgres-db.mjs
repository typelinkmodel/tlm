#!/usr/bin/env zx

import { info, notice, quiet, waitFor, waitForSocket } from "./common.mjs";
import settings from "./settings.mjs";

async function waitForPsql() {
  process.stdout.write(`wait for psql on ${settings.PostgresContainer}`);
  await quiet(async () => {
    await waitFor(() => new Promise((resolve, reject) => {
      $`docker exec -i \
"${settings.PostgresContainer}" \
psql \
-b \
-v ON_ERROR_STOP=1 \
-U "${settings.PostgresUser}" \
-h localhost \
-p 5432 \
-c "SELECT TRUE;" >/dev/null 2>/dev/null`
        .then(() => resolve())
        .catch(() => reject());
    }));
  });
}

async function invokeSQL(database, file) {
  notice(`Running SQL script ${file} on ${settings.PostgresContainer}/${database}…`);
  // when running on windows, resolve() adds the drive letter
  // zx then invokes bash, passing the windows path to docker
  // docker then gets confused about the drive letter
  // So we use a relative path instead and hope that always works, instead of:
  //  const absPath = path.resolve(file);
  //  await $`docker cp ${absPath} ${settings.PostgresContainer}:/tmp/${fileName}`;
  const fileName = path.basename(file);
  await $`docker cp ${file} ${settings.PostgresContainer}:/tmp/${fileName}`;
  await $`docker exec -i \
"${settings.PostgresContainer}" \
psql \
-b \
-v ON_ERROR_STOP=1 \
-U "${settings.PostgresUser}" \
-h localhost \
-p 5432 \
-d "${database}" \
-f /tmp/${fileName} >/dev/null`;
}

info(`Setting up database schema ${settings.PostgresContainer}/${settings.PostgresDatabase}…`);
await waitForSocket(settings.PostgresHost, settings.PostgresPort);
await waitForPsql();

const sqlScripts = settings.PostgresScriptsDir.replaceAll("\\", "/");
const pattern = `${sqlScripts}/*.pgsql`;
const scripts = (await glob(pattern)).sort();

for (const script of scripts) {
  if (/db\.pgsql$/g.test(script)) {
    await quiet(() => invokeSQL("postgres", script));
  } else {
    await quiet(() => invokeSQL(settings.PostgresDatabase, script));
  }
}
