#!/usr/bin/env bash

# shellcheck disable=SC2034
TRY_INSTALL_REQUIREMENTS=1

# bind different local port to not conflict with local development
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_PORT="$((POSTGRES_PORT + 1))"
