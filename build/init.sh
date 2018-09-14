# script recording original project set up

nodenv install 10.10.0
nodenv local 10.10.0
npm install -g lerna
npm install -g yarn
nodenv rehash

git init
nodenv global 10.10.0

git add .node-version
git commit -m "build: use node 10"

lerna init
# edit config code: lerna.json package.json
git add lerna.json package.json
git commit -m "build: lerna init"

mkdir build
touch build/init.sh
# write this file: code build/init.sh
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