ARG exposed_port=3000

FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Bundle app source
COPY . .

EXPOSE ${exposed_port}
CMD [ "node", "./src/index.js" ]