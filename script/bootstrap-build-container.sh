#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

curr_path="$PWD"
if [[ "$OS" == "Windows" ]]; then
    curr_path="$(cygpath -w "$curr_path")"
fi
entrypoint="/bin/bash"
if [[ "$OS" == "Windows" ]]; then
    entrypoint="//bin/bash"
fi
mountpoint="/mnt"
if [[ "$OS" == "Windows" ]]; then
    entrypoint="//mnt"
fi

if [ -n "$(docker ps -q -f name="$BUILD_CONTAINER")" ]; then
    warn "Container $BUILD_CONTAINER is already running."
else
    info "Starting docker container $BUILD_CONTAINER…"
    docker run --rm \
        --name "$BUILD_CONTAINER" \
        -d --init \
        -v "$curr_path:$mountpoint" \
        --entrypoint "$entrypoint" \
        "$NODE_IMAGE" \
        -c 'sleep infinity'

    docker exec -w "$mountpoint" "$BUILD_CONTAINER" "$entrypoint" <<END
npm install -g lerna
lerna bootstrap
END
fi
