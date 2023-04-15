#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("bootstrap");
await import('./bootstrap-requirements.mjs');
sectionEnd();
