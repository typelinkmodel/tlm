#!/usr/bin/env zx

import { info } from "./common.mjs";

info('bootstrapping requirements...');
const docker = await which('docker');

echo`Using docker ${docker}`;
