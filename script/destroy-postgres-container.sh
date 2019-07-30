#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$SCRIPT_DIR/common.sh"

log "Stopping docker container $POSTGRES_CONTAINER…"
docker stop "$POSTGRES_CONTAINER"
