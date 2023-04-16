#!/usr/bin/env zx

import { info } from "./common.mjs";
import settings from "./settings.mjs";

info(`Install pgtap into ${settings.PostgresContainer}…`);
await $`docker run -i --rm \
--name "${settings.PgTapContainer}" \
--link "${settings.PostgresContainer}:db" \
--entrypoint "/install.sh" \
-e "USER=${settings.PostgresUser}" \
-e "PASSWORD=${settings.PostgresPassword}" \
-e "DATABASE=${settings.PostgresDatabase}" \
-e "HOST=db" \
-e "PORT=5432" \
"${settings.PgTapImage}"`;
