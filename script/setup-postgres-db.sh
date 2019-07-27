#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$SCRIPT_DIR/common.sh"

function run_sql() {
    log "Running SQL script $2 on $POSTGRES_CONTAINER/$1…"
    docker exec -i "$POSTGRES_CONTAINER" psql -a -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" < $2
}

run_sql postgres docs/design/psql-tlm-db.pgsql
run_sql "$POSTGRES_DB" docs/design/psql-tlm-schema.pgsql
