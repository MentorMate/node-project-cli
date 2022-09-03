#!/usr/bin/env bash

npm ci
npm run build
[ -d target ] && rm -rf target/
mkdir target

npm pack --pack-destination ./target