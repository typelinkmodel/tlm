#!/usr/bin/env bash

# from https://github.com/anordal/shellharden/blob/master/how_to_do_things_safely_in_bash.md

if test "$BASH" = "" || "$BASH" -uc "a=();true \"\${a[@]}\"" 2>/dev/null; then
    # Bash 4.4, Zsh
    set -euo pipefail
else
    # Bash 4.3 and older chokes on empty arrays with set -u.
    set -eo pipefail
fi
shopt -s nullglob
shopt -s globstar

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.."
#shellcheck source=settings.sh
source "$SCRIPT_DIR/settings.sh"

UNDERLINE=""
NO_UNDERLINE=""
RESET=""
RED=""
GREEN=""
YELLOW=""

if test -t 1; then
    ncolors="$(tput colors)"

    if test -n "$ncolors" && test "$ncolors" -ge 8; then
        UNDERLINE="$(tput smul)"
        NO_UNDERLINE="$(tput rmul)"
        RESET="$(tput sgr0)"
        RED="$(tput setaf 1)"
        GREEN="$(tput setaf 2)"
        YELLOW="$(tput setaf 3)"
    fi
fi

function log() {
    printf "%s\n" "$*" >&2;
}

function info() {
    log "${GREEN}${*}${RESET}"
}

function warn() {
    log "${YELLOW}${*}${RESET}"
}

function error() {
    log "${RED}${*}${RESET}"
}

function errexit() {
    log "${RED}${*}${RESET}"
    exit 127
}

# OS will be one of:
# - Mac (for Darwin, etc)
# - Debian (if there's 'apt', so includes Ubuntu, including Windows WSL UBUNTU)
# - RedHat (if there's 'yum', so includes CentOS, includes Fedora, includes Windows WSL CentOS)
# - Windows (includes Cygwin, MingW and MSYS bash, includes Git Bash)
# - Linux (something else, assumed)
OS=""
case "$(uname -s)" in
    Darwin)
        OS="Mac"
        ;;
    Linux)
        if hash apt 2>/dev/null; then
            OS="Debian"
        elif hash yum 2>/dev/null; then
            OS="RedHat"
        else
          OS="Linux"
        fi
        ;;
    CYGWIN*|MINGW*|MSYS*)
        OS="Windows"
        ;;
    *)
        warn "Unrecognized OS ${UNDERLINE}$(uname -s)${NO_UNDERLINE}!"
        # shellcheck disable=SC2034
        OS="Linux"
        ;;
esac
