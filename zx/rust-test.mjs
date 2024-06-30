#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("rust-test");

await $`cargo llvm-cov --all-features --workspace `;
await $`cargo llvm-cov report --codecov --output-path codecov.json`;

sectionEnd();
