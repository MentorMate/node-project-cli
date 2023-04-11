# Features

## Basic App

### Working with `git`:

- `.gitignore` file

### Node version management:

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

### Code formatting:

- `.prettierrc.js` file
- `.prettierignore` file
- `format` script with caching

### Code linting:

- `.eslintrc.js` file
  - `TypeScript` config
  - `@typescript-eslint/recommended` preset
- `.eslintignore` file
- `lint` script with caching

### File and directory linting:

- `.ls-lint.yml` file

### Commit message linting:

- `.commitlintrc.js` file

### Commit message helper:

- `.czrc` file for `commitizen`

### Shell sciprt static analysis:

- `shellcheck`

### Secret detection:

- `detect-secrets`
- `.pre-commit-config.yaml` file
  - test files excluded

### Working with environment variables:

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

### Unit tests:

- `jest.config.js` file
  - `TypeScript` config
  - coverage config
- `test` script
- `test:watch` script
- `test:cov` script

### e2e tests:

- `jest.config.js` file
  - `TypeScript` config
  - coverage config
- `test:e2e` script
- `test:e2e:cov` script
- uses `.env.test` via `DOTENV_CONFIG_PATH` env var

### Application:

- security headers via `helmet`
- compression via `compression`
- graceful shutdown via `http-terminator`
- example app:
  - `Hello, World!` route
  - unit tests
  - e2e tests

### Auto restart:

- `nodemon.json` file
- `signal` config to enable graceful shutdown
- `start:dev` script for running the application in watch mode

### Git hooks via `husky` and `lint-staged`:

- commit-msg
  - `commitlint`
- pre-commit
  - `tsc`
  - `prettier` (staged)
  - `eslint` (staged)
  - `shellcheck` (staged)
  - `sort-package-json` (staged)
  - `ls-lint`
  - `detect-secrets`
  - `test:cov`
  - `test:e2e:cov`
  - commented out branch name linting example
- pre-push (empty)

### GitHub workflows:

- dependency audit via `npm`
- unit test coverage and report via PR comment
- e2e test coverage and report via PR

### Debugging:

- `start:debug` script
- `VS Code` launch config

### Documentation via `README.md` including the following sections:

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
- testing
  - `test`
  - `test:watch`
  - `test:cov`
  - `test:e2e`
  - `test:e2e:cov`
- working with Docker
  - `image:build`
  - `image:run`
- debugging
  - using `VS Code` launch config
