#!/usr/bin/env bash

CONTAINER_NAME=$1

# Wait for the first container start event
grep -m 1 "container start" <(docker events --filter type=container --filter event=start --filter container="$CONTAINER_NAME")
