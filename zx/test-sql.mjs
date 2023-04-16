#!/usr/bin/env zx

import { info, notice, testDockerIsRunning } from "./common.mjs";
import settings from "./settings.mjs";

info('Testing SQL database…');

if (await testDockerIsRunning(settings.PgTapContainer)) {
  notice(`Docker container ${settings.PgTapContainer} is already running`);
}
if (!(await testDockerIsRunning(settings.PostgresContainer))) {
  notice(`Docker container ${settings.PostgresContainer} is not running`);
}

const sqlScripts = path.resolve(settings.PgTapTestsDir);

await $`docker run -i --rm \
--name "${settings.PgTapContainer}" \
--link "${settings.PostgresContainer}:db" \
-v "${sqlScripts}:/test" \
-e "USER=${settings.PostgresUser}" \
-e "PASSWORD=${settings.PostgresPassword}" \
-e "DATABASE=${settings.PostgresDatabase}" \
-e "HOST=db" \
-e "PORT=5432" \
-e TESTS=/test/${settings.PgTapTestsPattern} \
"${settings.PgTapImage}" \
/test.sh \
-a -k`;
