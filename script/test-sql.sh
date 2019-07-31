#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
#shellcheck source=common.sh
source "$SCRIPT_DIR/common.sh"

info "Testing SQL database…"
if [ -n "$(docker ps -q -f name="$PGTAP_CONTAINER")" ]; then
  log "Container $PGTAP_CONTAINER is already running, please remove it."
  exit 1
fi

sql_script_path="$PWD/packages/tlm-core-model/test-sql"
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
  -e "PORT=$POSTGRES_PORT" \
  -e "TESTS=/test/*.sql" \
  "$PGTAP_IMAGE"

# restore pgtap...
# todo: custom docker image that doesn't uninstall
"$SCRIPT_DIR/setup-postgres-pgtap.sh"
