#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

function run_sql() {
    log "Running SQL script $2 on $POSTGRES_CONTAINER/$1…"
    docker exec -i \
        "$POSTGRES_CONTAINER" \
        psql \
        -b \
        -v ON_ERROR_STOP=1 \
        -U "$POSTGRES_USER" \
        -h localhost \
        -p 5432 \
        -d "$1" < "$2" >/dev/null
}

function wait_for_psql() {
    echo -n "Waiting for psql to be available..."
    waited=0
    until docker exec -i \
            "$POSTGRES_CONTAINER" \
            psql \
            -b \
            -v ON_ERROR_STOP=1 \
            -U "$POSTGRES_USER" \
            -h localhost \
            -p 5432 \
            -c "SELECT TRUE;" >/dev/null 2>&1; do
        echo -n .
        sleep 0.5
        waited=$((waited + 1))
        if [[ $waited -ge 10 ]]; then
          echo -n X
          break # hope
        fi
    done
    echo
}

info "Setting up database schema $POSTGRES_CONTAINER/$POSTGRES_DB…"

wait_for_tcp localhost "${POSTGRES_PORT}"
wait_for_psql

for s in packages/tlm-core-model/sql/*.pgsql; do
    if [[ "${s}" == *db.pgsql ]]; then
        run_sql postgres "$s"
    else
        run_sql "$POSTGRES_DB" "$s"
    fi
done
