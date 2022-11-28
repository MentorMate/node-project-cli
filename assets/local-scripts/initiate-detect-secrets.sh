#!/usr/bin/env bash

APP_PATH=$1
CURRENT_PATH="$PWD"

# Install detect-secrets if not found
if ! command -v detect-secrets &> /dev/null
then
  echo "detect-secrets could not be found. Installing detect-secrets..."
  pip3 install git+https://github.com/Yelp/detect-secrets@1.2.0
fi

# Generate secrets baseline
cd "$APP_PATH"
detect-secrets scan > .secrets.baseline
detect-secrets scan package.json --all-files --baseline .secrets.baseline
cd "$CURRENT_PATH"

# Install pre-commit if not found
if ! command -v pre-commit &> /dev/null
then
    echo "pre-commit could not be found. Installing pre-commit..."
    if ! command -v brew &> /dev/null
    then
      pip3 install pre-commit
    else
      brew install pre-commit
    fi
fi

echo "[INFO] If you encounter any issues with detect-secrets, please refer to https://github.com/Yelp/detect-secrets"
