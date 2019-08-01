#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_DIR/.." || exit 127
source "script/common.sh"

MISSING_DEPENDENCY=0

function require_by_platform() {
    cmd="$1"
    type="$(type -t "$cmd" || true)"
    if [ -z "$type" ]; then
        error "Missing dependency ${UNDERLINE}${cmd}${NO_UNDERLINE}!"
        instr=""
        case "$OS" in
          Debian)
            instr="$2"
            ;;
          RedHat)
            instr="$3"
            ;;
          Windows)
            instr="$4"
            ;;
          Mac)
            instr="$5"
            ;;
        esac
        if [ -n "$instr" ]; then
            error "  To install, try:  ${UNDERLINE}${instr}${NO_UNDERLINE}"
        fi
        MISSING_DEPENDENCY=1
    fi
}

function require() {
    type="$(type -t "$1" || true)"
    if [ -z "$type" ]; then
        error "Missing dependency ${UNDERLINE}$1${NO_UNDERLINE}!"
        instr="$2"
        if [ -n "$instr" ]; then
            error "  To install, try:  ${YELLOW}${instr}"
        fi
        if [[ "${TRY_INSTALL_REQUIREMENTS}" -eq 1 ]]; then
            log "  Trying..."
            eval "$instr"
        else
            MISSING_DEPENDENCY=1
        fi
    fi
}

function exit_if_missing_dependencies() {
    if [ "$MISSING_DEPENDENCY" -ne 0 ]; then
        exit 127
    fi
}

function load_nvm() {
    if hash nvm 2>/dev/null; then
        return
    fi
    NVM_DIR="$HOME/.nvm"
    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
        return
    fi
    # shellcheck disable=SC1090
    source "$NVM_DIR/nvm.sh"
}
load_nvm

info "Checking requirements…"
require_by_platform git \
  "apt install git" \
  "yum install git" \
  "choco install git" \
  "brew install git"
require_by_platform docker \
  "https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04" \
  "curl -fsSL https://get.docker.com/ | sh" \
  "choco install docker" \
  "brew install docker docker-machine xhyve docker-machine-driver-xhyve"

require node "nvm install ${NODE_VERSION}"
require npm "nvm install ${NODE_VERSION}"
require lerna "npm install -g lerna"
require yarn "npm install -g yarn"
