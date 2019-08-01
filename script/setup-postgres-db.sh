#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

function run_sql() {
    info "Running SQL script $2 on $POSTGRES_CONTAINER/$1…"
    docker exec -i \
        "$POSTGRES_CONTAINER" \
        psql \
        -b \
        -v ON_ERROR_STOP=1 \
        -U "$POSTGRES_USER" \
        -h localhost \
        -p 5432 \
        -d "$1" < "$2"
}

wait_for_tcp localhost "${POSTGRES_PORT}"
sleep 0.5

for s in packages/tlm-core-model/sql/*.pgsql; do
    if [[ "${s}" == *db.pgsql ]]; then
        run_sql postgres "$s"
    else
        run_sql "$POSTGRES_DB" "$s"
    fi
done
