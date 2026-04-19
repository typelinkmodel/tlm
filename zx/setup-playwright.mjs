#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("setup-playwright");
// Run via the workspace's own playwright so the browser version matches
// the pinned @playwright/test in packages/tlm-web.
await $`pnpm --filter tlm-web exec playwright install --with-deps chromium`;
sectionEnd();
