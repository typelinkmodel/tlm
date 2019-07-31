#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

if [ -n "$(docker ps -q -f name="$POSTGRES_CONTAINER")" ]; then
  log "Container $POSTGRES_CONTAINER is already running."
  exit 0
fi

info "Starting docker container $POSTGRES_CONTAINER…"
docker run --rm \
  --name "$POSTGRES_CONTAINER" \
  -e "POSTGRES_USER=$POSTGRES_USER" \
  -e "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
  -e "POSTGRES_DB=$POSTGRES_DB" \
  -d \
  -p "$POSTGRES_PORT:5432" \
  "$POSTGRES_IMAGE"
