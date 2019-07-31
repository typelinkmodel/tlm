#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

"$SCRIPT_DIR/test-shell.sh"
"$SCRIPT_DIR/test-sql.sh"
"$SCRIPT_DIR/test-js.sh"
