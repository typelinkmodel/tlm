#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "Install pgtap into $POSTGRES_CONTAINER…"
if [[ "$OS" == "Windows" ]]; then
    # https://github.com/moby/moby/issues/24029
    export MSYS_NO_PATHCONV=1
fi
docker run -i --rm \
    --name "$PGTAP_CONTAINER" \
    --link "$POSTGRES_CONTAINER:db" \
    --entrypoint "/usr/bin/psql" \
    -e "PGPASSWORD=$POSTGRES_PASSWORD" \
    "$PGTAP_IMAGE" \
    -h db -p 5432 -d "$POSTGRES_DB" -U "$POSTGRES_USER" -f /pgtap/sql/pgtap.sql -q >/dev/null 2>&1

if [[ "$OS" == "Windows" ]]; then
    export MSYS_NO_PATHCONV=
fi
