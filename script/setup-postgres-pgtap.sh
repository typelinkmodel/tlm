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
    --entrypoint "/install.sh" \
    -e "USER=$POSTGRES_USER" \
    -e "PASSWORD=$POSTGRES_PASSWORD" \
    -e "DATABASE=$POSTGRES_DB" \
    -e "HOST=db" \
    -e "PORT=5432" \
    "$PGTAP_IMAGE"

if [[ "$OS" == "Windows" ]]; then
    export MSYS_NO_PATHCONV=
fi
