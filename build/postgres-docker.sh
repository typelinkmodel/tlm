#!/bin/bash

docker run --rm \
  --name d-psql-tlm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tlm \
  -d \
  -p 5432:5432 \
  postgres
#  -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data
