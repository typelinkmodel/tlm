#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("lint");

await $`pnpm recursive run lint`;

sectionEnd();
