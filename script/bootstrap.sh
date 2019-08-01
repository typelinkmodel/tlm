#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

source "script/bootstrap-requirements.sh"

# yarn workspace symlinking does not work well in a linux container on a windows host on a mounted volume
# source "script/bootstrap-build-container.sh"
# source "script/bootstrap-build-tools.sh"
