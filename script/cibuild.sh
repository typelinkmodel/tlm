#!/usr/bin/env bash

ENV="${ENV:-ci}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

source "script/bootstrap.sh"
source "script/setup.sh"
source "script/server.sh"
source "script/test.sh"
source "script/destroy.sh"
