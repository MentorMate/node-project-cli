# nest-mongo-auth0

## Setup

### Prerequisites

#### Node and NPM via NVM

**Install NVM:**

Follow the instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).

**Install the version of node specified in the `.nvmrc` file and switch to it:**

```bash
nvm install
nvm use
```

**(Optional) Set the node version as default:**

```bash
nvm alias default $(cat .nvmrc)
```

**(Optional) Automatically switch Node version when changing directories:**

Follow the instructions for your shell [here](https://github.com/nvm-sh/nvm#deeper-shell-integration).

#### Docker

Follow the instructions [here](https://docs.docker.com/engine/install/).

**Post installation steps for Linux users:**

Follow the instructions [here](https://docs.docker.com/engine/install/linux-postinstall/).

**Docker Compose:**

In case `docker compose` isn't setup with the docker installation follow the
instructions [here](https://docs.docker.com/compose/install/).

### Clone the repo and cd into the folder

```bash
git clone git@github.com:<your-project>.git
cd <your-project>
```

### Install Node modules

```bash
npm install
```

### Setup environment variables

Copy the `.env.example` file to `.env`. Update environment variables as needed.

```bash
cp .env.example .env
```

### Setup environment variables for e2e tests

Copy the `.env` file to `.env.test`. Update environment variables as needed.

```bash
cp .env .env.test
```

Update `NODE_ENV` to `test`.

Make sure to provide a different database name from what you have in `.env`
as e2e tests wipe the database clean before they run.


### Setup docker-compose overrides

Create a `docker-compose.override.yml` file using the example:

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
```


Open the `docker-compose.override.yml` file to adjust the database volume path.

### Provision the services

In order to provision the services run:

```bash
docker-compose up -d
```


**Note:**
Make sure to change your database host variable in `.env` and `.env.test` files
to your docker database service name that is in `docker-compose.yml` (e.g. `db`)

### Dev Containers
 
You can work inside a Docker container instead of your host if you like.
  
**How to use (VS Code):**
 
- Make sure you have installed [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Open the project's folder in VS Code
- Hit `Ctrl`/`Cmd` + `Shift` + `P` -> Dev Containers: Open Folder in Container
  
For more information on Dev Containers and [supported editors](https://containers.dev/supporting)
you can check the [documentation](https://containers.dev/).


## Running the app

```bash
# build the app
npm run build
# run in development mode
npm run start

# run in watch mode
npm run start:dev

# run in debug mode
npm run start:debug
```

## Test

### Unit Tests

```bash
# run
npm run test

# watch
npm run test:watch

# coverage
npm run test:cov
```

### End-to-end Tests

```bash
# e2e tests
npm run test:e2e

# e2e coverage
npm run test:e2e:cov
```


## Working with Docker

```bash
# build the image
npm run image:build

# run the image
npm run image:run
```


## Working with OpenAPI

Swagger Document is being generated when the application is started.
In order to see it you can navigate to `{HOST}:{PORT}/swagger`
e.g. `http://localhost:3000/swagger` (make sure the app is running).

You can change the route if you want to in `main.ts`

## Working with Licenses

Whenever a new `npm` module is added to the project we need to check its
license. If the license is included in the
[OSI approved license list](https://opensource.org/licenses/), then we
can use it. If not - we need to review it manually. Start by running
the following `npm` script:

```bash
npm run license:check
```

If the script succeeds, that means that the license is either a included
in the OSI list, or it was already reviewed and passed the review. When
the script fails it will print the first license that needs a review.
In order to list all licenses that need a review run the following:

```bash
npm run license:for-review
```

In order to verify that a license suits your case, you can use a website like
[SOOS](https://app.soos.io/research/licenses). Find the license and inspect
the `Usage` and `Requirements` sections. You need to verify that the license
is `permissive`. Look for things like whether the license allows for
`Commercial Use` and `Private Use`.

If the package passes the review, then include it in the list in
`licenses-reviewed.js` located in the root of ths project.

If the package does not pass the review, then look for an alternative package.

Lastly, if you just want to print a summary of all license, run:

```bash
npm run license:summary
```

## Debug

### VS Code

Go to the Debug menu (CTRL+SHIFT+D). From `RUN AND DEBUG` at the top select
`Run Script: Launch via NPM`. You should now be able to start debugging
by pressing `F5`.

