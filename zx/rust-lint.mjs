#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("rust-lint");

await $`cargo clippy -- -D warnings`;

sectionEnd();
