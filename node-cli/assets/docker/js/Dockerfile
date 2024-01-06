FROM node:18-alpine

# Update OS packages
RUN apk update && apk upgrade --no-cache

# Create a directory under the node user
RUN mkdir -p /usr/src/app && chown node:node /usr/src/app

# Set the working directory
WORKDIR /usr/src/app

# Switch to the predefined node use to avoid running as root
USER node

# Copy both package.json and package-lock.json
COPY --chown=node:node package*.json ./

# Run clean install
RUN npm ci \
  # skip funding messages
  --fund false \
  # skip pre/post scripts
  --ignore-scripts \
  # skip vulnerability check
  --no-audit \
  # skip update information
  --no-update-notifier \
  # skip dev dependencies
  --omit=dev \
  # attempt to reduce image size
  && npm cache clean --force

# Copy the source code
COPY --chown=node:node ./src/ ./dist/

# Run
CMD [ "node", "./dist/index.js" ]
