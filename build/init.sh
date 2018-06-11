# script recording original project set up

nodenv install 10.2.1
nodenv local 10.2.1
npm install -g lerna
npm install -g yarn
nodenv rehash

git init
nodenv global 10.2.1

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
