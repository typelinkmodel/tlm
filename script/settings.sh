#!/usr/bin/env bash

# git bash on windows: set USER from USERNAME
if [ -z "${USER:-}" ]; then
    USER="${USERNAME,,}"
fi

ENV=${ENV:-d}
STACK="${STACK:-$USER}"

# shellcheck disable=SC2034
TRY_INSTALL_REQUIREMENTS=${TRY_INSTALL_REQUIREMENTS:-0}

# shellcheck disable=SC2034
NODE_VERSION="${NODE_VERSION:-10.16.0}"
# shellcheck disable=SC2034
BUILD_CONTAINER="${NODE_CONTAINER:-$ENV-$STACK-build}"
# shellcheck disable=SC2034
NODE_IMAGE="${NODE_IMAGE:-node:${NODE_VERSION}}"

# shellcheck disable=SC2034
POSTGRES_USER="${POSTGRES_USER:-postgres}"
# shellcheck disable=SC2034
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
# shellcheck disable=SC2034
POSTGRES_DB="${POSTGRES_DB:-tlm}"
# shellcheck disable=SC2034
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
# shellcheck disable=SC2034
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-$ENV-$STACK-psql-$POSTGRES_DB}"
# shellcheck disable=SC2034
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres}"

# shellcheck disable=SC2034
PGTAP_CONTAINER="${PGTAP_CONTAINER:-$ENV-$STACK-pstap-$POSTGRES_DB}"
# shellcheck disable=SC2034
PGTAP_IMAGE="${PGTAP_IMAGE:-hbpmip/pgtap}"
# shellcheck disable=SC2034
PGTAP_TESTS_DIR="${PGTAP_TESTS_DIR:-packages/tlm-core-model/test-sql}"
# shellcheck disable=SC2034
PGTAP_TESTS_PATTERN="${PGTAP_TESTS_PATTERN:-*.sql}"

# shellcheck disable=SC2034
SHELLCHECK_CONTAINER="${SHELLCHECK_CONTAINER:-$ENV-$STACK-shellcheck}"
# shellcheck disable=SC2034
SHELLCHECK_IMAGE="${SHELLCHECK_IMAGE:-koalaman/shellcheck}"
