#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "Stopping docker container $POSTGRES_CONTAINER…"
docker stop "$POSTGRES_CONTAINER"
