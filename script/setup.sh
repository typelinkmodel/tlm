#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "==> setup"
source "script/setup-postgres-container.sh"
source "script/setup-postgres-db.sh"
source "script/setup-postgres-pgtap.sh"
