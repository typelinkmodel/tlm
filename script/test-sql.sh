#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "Testing SQL database…"
if [ -n "$(docker ps -q -f name="$PGTAP_CONTAINER")" ]; then
    warn "Container $PGTAP_CONTAINER is already running, please remove it."
fi

sql_script_path="$PWD/${PGTAP_TESTS_DIR}"
if [[ "$OS" == "Windows" ]]; then
    sql_script_path="$(cygpath -w "$sql_script_path")"
fi

docker run -it --rm \
    --name "$PGTAP_CONTAINER" \
    --link "$POSTGRES_CONTAINER:db" \
    -v "$sql_script_path:/test" \
    -e "USER=$POSTGRES_USER" \
    -e "PASSWORD=$POSTGRES_PASSWORD" \
    -e "DATABASE=$POSTGRES_DB" \
    -e "HOST=db" \
    -e "PORT=5432" \
    -e "TESTS=/test/${PGTAP_TESTS_PATTERN}" \
    "$PGTAP_IMAGE" \
    /test.sh \
    -a -k
