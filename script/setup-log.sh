#!/usr/bin/env bash

# script recording original project set up

echo "Do not run me"
exit 1

nvm install 10.16.0
nvm use 10.16.0
npm install -g lerna
npm install -g yarn

git init

lerna init
# edit config: code lerna.json package.json
git add lerna.json package.json
git commit -m "build: lerna init"

mkdir script
touch script/bootstrap.sh
# write this file: code script/bootstrap.sh
git add script
git commit -m "build: init log"

lerna create tlm-core-model
lerna add -D typescript
lerna add -D tslint
lerna add -D jest
lerna add -D ts-jest
lerna add -D @types/node
lerna add -D @types/jest
# edit project structure further, add config files
git add .
