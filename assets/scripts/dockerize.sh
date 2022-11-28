#!/usr/bin/env bash

export APP_NAME=$1

bash ./scripts/build_package.sh

cd ./target && tar xzf ./*.tgz
cd package && docker build -t "${APP_NAME}":latest . 
