#!/usr/bin/env bash

# Install detect-secrets if not found
if ! command -v detect-secrets &> /dev/null
then
    echo "detect-secrets could not be found. Installing detect-secrets..."
    if command -v pip3 &> /dev/null
    then
      pip3 install detect-secrets==1.4.0 --upgrade
    else
      echo "pip3 not found, could not install detect-secrets"
      exit 1
    fi
fi

# Switch to the needed version
DETECT_SECRETS_VERSION=$(detect-secrets --version)

if [ "$DETECT_SECRETS_VERSION" != "1.4.0" ]
then
  pip3 install detect-secrets==1.4.0 --upgrade
fi

# Install pre-commit if not found
if ! command -v pre-commit &> /dev/null
then
    echo "pre-commit could not be found. Installing pre-commit..."
    if command -v brew &> /dev/null
    then
      brew install pre-commit
      elif command -v pip3 &> /dev/null
      then
      pip3 install pre-commit
    else
      echo "neither brew, nor pip3 found, could not install pre-commit"
      exit 1
    fi
fi

echo "[INFO] If you encounter any issues with detect-secrets, please refer to https://github.com/Yelp/detect-secrets"
