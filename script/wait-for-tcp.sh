#!/usr/bin/env bash

waited=0
until echo > "/dev/tcp/$1/$2"; do
    sleep 0.2
    waited=$(( waited + 1 ))
    echo -n "."
    if [[ $waited -eq 20 ]]; then
      echo -n "X"
      break
    fi
done
