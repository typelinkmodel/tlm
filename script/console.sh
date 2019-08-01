#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

source "script/bootstrap-build-container.sh"

entrypoint="/bin/bash"
if [[ "$OS" == "Windows" ]]; then
    entrypoint="//bin/bash"
fi
mountpoint="/mnt"
if [[ "$OS" == "Windows" ]]; then
    mountpoint="//mnt"
fi

info "Running bash in $BUILD_CONTAINER…"
docker exec -it -w "$mountpoint" "$BUILD_CONTAINER" "$entrypoint"
