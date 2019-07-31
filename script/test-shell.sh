#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

info "Linting shell scripts…"
(cd script || exit 127; shellcheck ./*.sh)
