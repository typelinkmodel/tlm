#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("test");
await import('./test-sql.mjs');
await import('./test-js.mjs');
sectionEnd();
