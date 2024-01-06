#!/usr/bin/env bash

RED=$'\e[0;31m'

echo "[INFO] Running detect-secrets hook"

# Exit if docker is not found
if ! command -v docker &> /dev/null
then
    echo "${RED}[ERROR] docker could not be found! Docker is required in order to run detect-secrets"
    exit 1
fi

echo "[INFO] If you encounter any issues with detect-secrets, please refer to https://github.com/Yelp/detect-secrets"

VOLUME_PATH="--volume $(pwd):/usr/src/app"
EXCLUDED_FILES="--exclude-files .*\.(test|spec|e2e)(-e2e|-spec)?\.(js|ts)$ --exclude-files .github/workflows/coverage-e2e.yaml"
STAGED_FILES_PATHS=$(git diff --staged --name-only -z | xargs -0)

# shellcheck disable=SC2086
if ! docker run --rm --name detect-secrets $VOLUME_PATH lirantal/detect-secrets $EXCLUDED_FILES --baseline .secrets.baseline $STAGED_FILES_PATHS;
then
    echo "${RED}[ERROR] Remove secrets before commiting."
    exit 1
fi

echo "[INFO] detect-secrets hook completed succesfully. No secrets found!"