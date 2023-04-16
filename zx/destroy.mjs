#!/usr/bin/env zx

import { sectionEnd, sectionStart } from "./common.mjs";
import settings from "./settings.mjs";

sectionStart("destroy");

await $`docker stop ${settings.PostgresContainer}`;

sectionEnd();
