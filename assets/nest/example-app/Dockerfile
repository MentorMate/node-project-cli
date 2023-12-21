#
# 🧑‍💻 Development
#
FROM node:18-alpine AS dev

# Update OS packages
RUN apk update && apk upgrade --no-cache

# Set the working directory
WORKDIR /usr/src/app

# Set to dev environment
ENV NODE_ENV development

# Copy the source code
COPY --chown=node:node . .

RUN npm ci \
  # skip funding messages
  --fund false \
  # skip pre/post scripts
  --ignore-scripts \
  # skip vulnerability check
  --no-audit \
  # skip update information
  --no-update-notifier \
  # rebuild bcrypt
  && npm rebuild bcrypt

#
# 🏡 Production Build
#
FROM node:18-alpine as build

WORKDIR /usr/src/app
RUN apk update && apk upgrade --no-cache

# Set to production environment
ENV NODE_ENV production

# In order to run `npm run build` we need access to the Nest CLI.
# Nest CLI is a dev dependency.
COPY --chown=node:node --from=dev /usr/src/app/node_modules ./node_modules
# Copy source code
COPY --chown=node:node . .

# Generate the production build. The build script runs "nest build" to compile the application.
RUN npm run build

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
  # rebuild bcrypt
  && npm rebuild bcrypt \
  # attempt to reduce image size
  && npm cache clean --force

# Set Docker as a non-root user
USER node

#
# 🚀 Production Server
#
FROM node:18-alpine as prod

WORKDIR /usr/src/app
RUN apk update && apk upgrade --no-cache

# Set to production environment
ENV NODE_ENV production

# Copy only the necessary files
COPY --chown=node:node --from=build /usr/src/app/dist dist
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules

# Set Docker as non-root user
USER node

# Run
CMD [ "node", "./dist/src/main.js" ]