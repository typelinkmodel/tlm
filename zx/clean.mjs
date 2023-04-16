#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("clean");

await $`pnpm recursive run clean`;
await $`pnpm recursive install`;

sectionEnd();
