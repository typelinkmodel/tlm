#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

"$SCRIPT_DIR/bootstrap.sh"
"$SCRIPT_DIR/setup.sh"
"$SCRIPT_DIR/server.sh"
"$SCRIPT_DIR/test.sh"
