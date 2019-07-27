#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$SCRIPT_DIR/common.sh"

"$SCRIPT_DIR/setup-postgres-container.sh"

"$SCRIPT_DIR/setup-postgres-db.sh"
