#!/usr/bin/env bash

until echo > "/dev/tcp/$1/$2"; do
    sleep 0.2
done
