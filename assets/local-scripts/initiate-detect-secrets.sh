#!/usr/bin/env bash

APP_PATH=$1
CURRENT_PATH="$PWD"

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

# Install detect-secrets if not found
if ! command -v detect-secrets &> /dev/null
then
  echo "detect-secrets could not be found. Installing detect-secrets..."
  pip3 install detect-secrets==1.4.0 --upgrade
fi

# Switch to the needed version
DETECT_SECRETS_VERSION=$(detect-secrets --version)

if [ "$DETECT_SECRETS_VERSION" != "1.4.0" ]
then
  pip3 install detect-secrets==1.4.0 --upgrade
fi

pre-commit autoupdate

# Generate secrets baseline
cd "$APP_PATH"
detect-secrets scan > .secrets.baseline
detect-secrets scan package.json --all-files --baseline .secrets.baseline
cd "$CURRENT_PATH"

echo "[INFO] If you encounter any issues with detect-secrets, please refer to https://github.com/Yelp/detect-secrets"
