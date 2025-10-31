#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("setup-playwright");
await $`pnpm dlx playwright install --with-deps chromium`;
sectionEnd();
