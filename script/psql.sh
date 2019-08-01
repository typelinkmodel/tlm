#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

if [ -z "$(docker ps -q -f name="$POSTGRES_CONTAINER")" ]; then
    warn "Container $POSTGRES_CONTAINER is not running, try script/setup.sh."
fi
info "Running 'psql $*' for $POSTGRES_CONTAINER/$POSTGRES_DB…"
docker exec -it "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
