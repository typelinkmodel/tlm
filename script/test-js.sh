#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "Running js unit tests…"
# invoking node directly so lerna has good chance of knowing its environment on windows
node node_modules/lerna/cli.js run prepare
node node_modules/lerna/cli.js run lint
node node_modules/lerna/cli.js run test
