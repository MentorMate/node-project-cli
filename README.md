# MM Node.js CLI-Pipeline

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A CLI tool for generating Node.js projects.

## Installation

Install globally with `npm install -g @mentormate/node-cli` and start generating projects by
running `node-cli g [project name]` inside your root Projects folder. The generated project will
be in its own folder inside the current one.

## Commands

- `generate` / `g` `[project name]` - This command starts the process of generating your Node.js project.

  There are three ways to generate it:

  - `node-cli g [project name] --interactive` - Interactive mode
  - `node-cli g [project name] --example-app` - Generate an example application
  - `node-cli g [project name]` - No flags. By default, the command will generate a basic express application when no flags are supplied.

- `version` / `v` / `--version` / `-v` - Outputs the current version of the CLI tool
- `help` / `h` / `--help` / `-h` - Lists the available commands and their aliases

### Flags

- `--interactive` - Start an interactive mode. You will have to answer a couple of questions so the result will be customized
  according to your needs.
- `--example-app` - Generate automatically an express ToDo application

## Features

- When `--example-app` flag is used, the generated ToDo app will include the following features:
  &nbsp;

  - Language: `typescript`
  - Db: `postgresql`
  - JS code linters: `prettier` and `eslint`
  - Hooks with `husky`: `commitlint`, `commitizen`, `pre-commit`, `pre-push`
  - Containerization with `docker`
  - Unit and E2E tests with `jest` and `supertest`
  - JWT authentication
  - API documentation with `openapi`
  - TypeScript-first schema validation with `zod`
  - Query Builder with `knex`
  - Global error handling
    &nbsp;

- When `--interactive` flag is used, it will start prompting question so you can customize the project you want to create.
  After the initial naming you will be provided with the following options:

For an exaustive list of features refer to [the features document](docs/features.md).

### Framework

- Express
- Nest.js - this option will automatically install its predefined linter settings and will always use TypeScript

### Language

Although you will be provided with two options - `TypeScript` and `JavaScript` the usage of the latter is strongly
discouraged. Only for edge cases, small projects and only after getting permission from your project's architect/team lead
you should choose the `JavaScript` option

### Features select

You will be presented with a selection of features that you can choose to be included in your project.
The default choice will include all of the listed features. The features are as follows:

- JS code linters - this option will install `prettier` and `eslint` as dev-dependencies on your project and
  setup some initial configuration according to a common MentorMate standard.
- Hooks with `husky` - this option will setup `husky` for your project and depending on your choice can add:

  - Commit hook - the hook will enforces usage of proper commit messages using `commitlint` and `commitizen`.
    `commitizen` will guide you through a friendly CLI when `npx cz` command is used instead of `git commit`:

    ![commitizen.png](https://raw.githubusercontent.com/commitizen/cz-cli/master/meta/screenshots/add-commit.png)

    It is all about using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

  - Pre-commit hook - the hook will run code and filename linters on the staged files and check for possible
    unwanted secrets/keys committed
  - Pre-push hook - this hook is just a placeholder. For now no action will happen here, but you can configure it by your needs

- Containerization with Docker - this option will create a Dockerfile file for building Docker images of your application.

### Testing

A configured `Jest` setup will always be included in your project, along with a GitHub workflow that will run on opening
PRs that target the `main`/`master` branch and on every subsequent push to the origin branch of the PR.

### Folder structure

If you have supplied `--example-app` flag, you are going to get a folder structure already setup for your project. The structure will include
database configuration, models folders, API with controllers, services folder, tests, etc... In each file there's a short instruction of what
should be included in the current file/folder. Some of the files are optional or just sample files and can/should be deleted.

# License

MM-NODE-CLI is MIT licensed, as found in the [LICENSE](https://github.com/MentorMate/node-project-cli/blob/main/LICENSE) file.
