#!/usr/bin/env zx

import { info, warn } from "./common.mjs";

// noinspection JSUnresolvedReference
const actions = argv._;

if (actions.length === 0) {
  warn`missing action(s)`;
  echo`Usage: pnpm run x <action> [action ...]`;
  process.exit(1);
}

info("Executing actions:", ...actions);

for (const action of actions) {
  const module = `./${action}.mjs`;
  await import(module);
}
