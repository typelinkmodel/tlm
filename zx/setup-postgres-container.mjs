#!/usr/bin/env zx

import settings from "./settings.mjs";
import { info, notice, testDockerIsRunning } from "./common.mjs";

if (await testDockerIsRunning(settings.PostgresContainer)) {
  notice(`Docker container ${settings.PostgresContainer} is already running`);
} else {
  info(`Starting docker container ${settings.PostgresContainer}`);
  await $`docker run --rm \
--name "${settings.PostgresContainer}" \
-e "POSTGRES_USER=${settings.PostgresUser}" \
-e "POSTGRES_PASSWORD=${settings.PostgresPassword}" \
-e "POSTGRES_DB=${settings.PostgresDatabase}" \
-d \
-p "${settings.PostgresPort}:5432" \
"${settings.PostgresImage}"`;
}
