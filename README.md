# MM Node.js CLI-Pipeline
A CLI tool for generating Node.js projects.

## Installation
Install globally with `npm install -g @mentormate/node-cli` and start generating projects by
running `node-cli g [project name]` inside your root Projects folder. The generated project will
be in its own folder inside the current one.

## Commands
- `generate` / `g` / `--generate` / `-g` `[project name]` - This command starts the process of generating your Node.js project.
    You will have to answer a couple of question so the result will be customized according to your needs.
- `version` / `v` / `--version` / `-v` - Outputs the current version of the CLI tool
- `help` / `h` / `--help` / `-h` - Lists the available commands and their aliases

## Features
The `generate` command will start prompting question so you can customize the project you want to create.
After the initial naming you will be provided with the following options:
### Framework
- Express
- Fastify
- Nest.js - this option will automatically install its predefined linter settings and will always ues TypeScript

### Language
Although you will be provided with two options - `TypeScript` and `Vanilla JS` the usage of the latter is strongly 
discouraged. Only for edge cases, small projects and only after getting permission from your project's architect/team lead
you should choose the `Vanilla JS` option

### Module type
You can choose the type of modules you are going to use in your project. The available options are:
- CommonJS modules
- ES Modules

### Features select
You will be presented with a selection of features that you can choose to be included in your project.
The default choice will include all of the listed features. The features are as follows:
- JS code linters - this option will install `prettier` and `eslint` as dev-dependencies on your project and
    setup some initial configuration according to a common MentorMate standard.
- Hooks with `husky` - this option will setup `husky` for your project and depending on your choice can add:
    * Commit message linting - the hook will enforces usage of proper commit messages using `commitlint` and `commitizen`. 
        `commitizen` will guide you through a friendly CLI when `git cz` command is used instead of `git commit`:
        
        
        ![commitizen.png](https://raw.githubusercontent.com/commitizen/cz-cli/master/meta/screenshots/add-commit.png)

        It is all about using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 
    * Pre-commit hook - the hook will run code and filename linters on the staged files and check for possible
        unwanted secrets/keys committed
    * Pre-push hook - this hook is just a placeholder. For now no action will happen here, but you can configure it by your needs
- Dockerizing GitHub workflow step - this option will create a GitHub workflow file for building a Docker images
    of your application. You can extend this workflow or just use this step in another workflow for testing/releasing/etc...

### Testing
A configured `Jest` setup will always be included in your project, along with a GitHub workflow that will run on opening
PRs that target the `main`/`master` branch and on every subsequent push to the origin branch of the PR.

### Folder structure
If you've chosen `TypeScript` for project language and `Express` or `Fastify` for framework you are going to get a
folder structure already setup for your project. The structure will include database configuration and models folders,
API with controllers and services folder, etc... . In each file there's a short instruction of what should be included
in the current file/folder. Some of the files are optional or just sample files and can/should be deleted.
# License
MIT - see LICENSE

