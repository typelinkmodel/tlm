#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

curr_path="$PWD"
if [[ "$OS" == "Windows" ]]; then
    curr_path="$(cygpath -w "$curr_path")"
fi

info "Running 'shellcheck $*' in docker container…"
docker run -it --rm \
    --name "$SHELLCHECK_CONTAINER" \
    -v "$curr_path:/mnt" \
    "$SHELLCHECK_IMAGE" \
    "$@"
