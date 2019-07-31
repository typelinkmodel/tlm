#!/usr/bin/env bash

ENV=d

# git bash on windows: set USER from USERNAME
if [ -z "${USER:-}" ]; then
    USER="${USERNAME,,}"
fi

# shellcheck disable=SC2034
POSTGRES_USER="postgres"
# shellcheck disable=SC2034
POSTGRES_PASSWORD="postgres"
# shellcheck disable=SC2034
POSTGRES_DB="tlm"
# shellcheck disable=SC2034
POSTGRES_PORT=5432
# shellcheck disable=SC2034
POSTGRES_CONTAINER="$ENV-$USER-psql-tlm"
# shellcheck disable=SC2034
POSTGRES_IMAGE="postgres"

# shellcheck disable=SC2034
PGTAP_CONTAINER="$ENV-$USER-pstap-tlm"
# shellcheck disable=SC2034
PGTAP_IMAGE="hbpmip/pgtap"

# shellcheck disable=SC2034
NODE_VERSION="10.16.0"
