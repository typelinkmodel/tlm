#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

info "Linting shell scripts…"
if [ -n "$(docker ps -q -f name="$SHELLCHECK_CONTAINER")" ]; then
    warn "Container $SHELLCHECK_CONTAINER is already running, please remove it."
fi

curr_path="${PWD}"
if [[ "$OS" == "Windows" ]]; then
    curr_path="$(cygpath -w "$curr_path")"
fi

docker run -it --rm \
    --name "$SHELLCHECK_CONTAINER" \
    -v "$curr_path:/mnt" \
    "$SHELLCHECK_IMAGE" \
    script/*.sh
