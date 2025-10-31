#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";

sectionStart("setup");
await import("./setup-postgres-container.mjs");
await import("./setup-postgres-db.mjs");
await import("./setup-postgres-pgtap.mjs");
await import("./setup-playwright.mjs");
sectionEnd();
