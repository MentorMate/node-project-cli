# Features

## Basic App

To generate a basic app run:

```bash
node-cli g <project-name>
```

### Working with `git`

- `.gitignore` file

### Node version management

- `.nvmrc` file with the `NodeJs` version
- `README.md` sections:
  - setup and use `nvm`
  - shell integration (switch between node versions automatically)

### TypeScript

- `tsconfig.json` file
  - `ts-node` config:
    - load `.d.ts` files
    - require `tsconfig-paths` and `dotenv`
- `tsconfig.build.json` file
- `build` script

### Code formatting

- `.editorconfig` file
- `.prettierrc.js` file
- `.prettierignore` file
- `format` script with caching

### Code linting

- `.eslintrc.js` file
  - `TypeScript` config
  - `@typescript-eslint/recommended` preset
- `.eslintignore` file
- `lint` script with caching

### File and directory linting

- `.ls-lint.yml` file

### Markdown linting

- `lint-staged` config entry

### Commit message linting

- `.commitlintrc.js` file

### Commit message helper

- `.czrc` file for `commitizen`

### Shell sciprt static analysis

- `shellcheck`

### Secret detection

- `detect-secrets`
- `.pre-commit-config.yaml` file
  - test files excluded

### Working with environment variables

- `.env.example` file with defaults
- `dotenv` as a `devDependency`

### Containerization via `Docker`

- `Docker` file
  - multi-stage build to ensure no `devDependencies`
  - `OS` pkg manager update
  - run under predefined `node` user to avoid running as `root`
  - `--no-scripts` on `npm ci`
- `.dockerignore` file
- `image:build` script
  - via BuildKit
  - uses project name for image
- `image:run` script
  - remove the image after stop
  - run in host network
  - uses `.env` via `--env-file` flag

### Unit tests

- `jest.config.js` file
  - `TypeScript` config
  - coverage config
- `test` script
- `test:watch` script
- `test:cov` script

### e2e tests

- `jest.config.js` file
  - `TypeScript` config
  - coverage config
- `test:e2e` script
- `test:e2e:cov` script
- uses `.env.test` via `DOTENV_CONFIG_PATH` env var

### License Check

- `license:check` script
- `license:for-review` script
- `license:summary` script

### Application features

- security headers via `helmet`
- compression via `compression`
- graceful shutdown
  - for http via `http-terminator`
- example app:
  - `Hello, World!` route
  - unit tests
  - e2e tests

### Auto restart

- `nodemon.json` file
- `signal` config to enable graceful shutdown
- `start:dev` script for running the application in watch mode

### Git hooks via `husky` and `lint-staged`

- commit-msg:
  - `commitlint`
- pre-commit:
  - `tsc`
  - `prettier` (staged)
  - `eslint` (staged)
  - `markdownlint` (staged)
  - `shellcheck` (staged)
  - `sort-package-json` (staged)
  - `ls-lint`
  - `detect-secrets`
  - `test:cov`
  - `test:e2e:cov`
  - commented out branch name linting example
- pre-push (empty):

### GitHub workflows

- dependency audit via `npm`
- unit test coverage and report via PR comment
- e2e test coverage and report via PR

### Debugging

- `start:debug` script
- `VS Code` launch config

### Documentation via `README.md` including the following sections

- setup:
  - `nvm`
  - `pip3`
  - `docker`
  - `git clone`
  - `npm install`
  - `.env`
- running:
  - `build`
  - `start`
  - `start:dev`
  - `start:debug`
- testing:
  - `test`
  - `test:watch`
  - `test:cov`
  - `test:e2e`
  - `test:e2e:cov`
- working with Docker:
  - `image:build`
  - `image:run`
- debugging:
  - using `VS Code` launch config

## Example To-Do App

While the goal of the basic application is to get rid of the mundane parts
of the project setup, you can only go so far without picking your stack.
The example application builds on top of the basic application and also
implements a To-Do app backend as a RESTful JSON API.

The stack is as follows:

- `PostgreSQL` - database
- `knex` - query builder
- `express-jwt` - JWT validation
- `pino` - logger
- `zod` - validation
- `zod-openapi` - OpenAPI generation

To generate the example app run:

```bash
node-cli g <project-name> --example-app
```

### Database `PostgreSQL`

- env vars in `.env`
  - the default `pg` env var names are used
- `docker-compose.yml` file for local setup
  - env vars are read from `.env`
- a `README.md` section

### Database migrations `knex`

- read `.env` instead of `knexfile.js`
- `npm` scripts for working with migrations
- a `README.md` section for working with migrations

### Query Builder `knex`

- `TypeScript` declarations
- extensions:
  - `paginate` - offset based pagination
  - `sort` - an attempt at a more declarative sorting
  - `filter` - an attempt at a more declarative filtration

### To-Do Application features

- env var validation
- graceful shutdown
  - for the database connections
- request logging in development
- CORS via `cors`
- authentication via `express-jwt`
- request payload validation via `zod`
- global error handler with support for HTTP errors via `http-errors`
- database error handling for Foreign Key and Unique contraint violations via `pg-error-enum`
- adds support for async route handlers for express
- adds type inference for the request params, query and body based
  on the validation schemas via `zod.infer`

### Endpoints

- `/healthz` - dummy healthcheck endpoints
  - `GET /live` - liveness
  - `GET /ready` - readiness
- `/auth` - authentication
  - `POST /register` - register
  - `POST /login` - login
- `/v1` - versioned part of the API
  - `/todos` - the To-Dos resource
    - `GET` - get a page of To-Dos
    - `POST` - create a To-Do
    - `/:id` - a To-Do resource
      - `GET` - get a To-Do
      - `PATCH` - update a To-Do
      - `DELETE` - delete a To-Do

### Open API

- an `OpenAPI` generation
  - via a script, so that it doesn't run in production
  - uses `zod` schemas to generate param and body schemas
  - uses route definitions to generate paths
  - supports named schemas
  - adds authentication when required by the route definition
  - provides utility for JSON only APIs
  - provides utility for describing responses
- `SwaggerUI`
  - via a `Docker` image
  - server port can be adjusted in `.env`
- a `README.md` section

### Unit Tests

- coverage

### e2e Tests

- database re-initialization before every run
  - drop and create
  - run migrations
- separate `.env.test` to be able to keep your development database intact
- coverage
