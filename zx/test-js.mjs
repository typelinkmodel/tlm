#!/usr/bin/env zx

import { info } from "./common.mjs";

info("Running js unit tests…");

await $`pnpm recursive run test`;
