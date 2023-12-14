'use strict';

const { getQuestions } = require('../utils/commands/questions');
const exampleAppConfig = require('../utils/commands/example-app.config');
const getFeatures = require('../utils/commands/features');

const command = {
  name: 'setup-dev',
  description: 'Setup dev environment for contribution to the project',
  usage: 'node-cli setup-dev [...options]',
  aliases: ['sd'],
  options: [
    {
      name: 'framework',
      alias: 'f',
      description: 'Possible values: express, nest',
    },
    {
      name: 'interactive',
      alias: 'i',
      description: 'Run in interactive mode',
    },
    {
      name: 'example-app',
      alias: 'e',
      description: 'Generate an example To-Do app',
    },
  ],
};

module.exports = {
  name: command.name,
  description: command.description,
  alias: command.aliases[0],
  run: async (toolbox) => {
    const {
      parameters: { options },
      system: { which, run },
      filesystem: { path, write, remove, symlink },
      print: { warning, highlight, error },
      prompt,
      meta,
      commandHelp,
      os,
    } = toolbox;

    if (commandHelp.shouldPrint()) {
      commandHelp.print(command);
      return;
    }

    const isPip3Avaialble = !!which('pip3');

    if (!isPip3Avaialble) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available"
      );
    }

    const isInteractiveMode = !!options.interactive || !!options['i'];
    const isExampleApp = !!options['example-app'] || !!options['e'];
    const framework = options['framework'] || options['f'];

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time'
      );
    }

    let userInput = {
      projectName: 'develop',
      framework,
      isExampleApp,
    };

    if (isInteractiveMode) {
      userInput = await prompt.ask(
        getQuestions(userInput, isPip3Avaialble).slice(0, 2)
      );

      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(getQuestions(userInput, isPip3Avaialble).slice(2))
      );
    }

    if (userInput.isExampleApp) {
      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(getQuestions(userInput, isPip3Avaialble)[1])
      );
      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(getQuestions(userInput, isPip3Avaialble).slice(2, 5))
      );

      Object.assign(
        userInput,
        exampleAppConfig(userInput.framework, isPip3Avaialble)
      );
    }

    userInput.devSetup = true;
    userInput.framework ||= 'express';
    userInput.features ||= getFeatures(isPip3Avaialble);
    userInput.db ||= 'none';
    userInput.projectLanguage = userInput.projectLanguage || 'TS';
    userInput.assetsPath = path(meta.src, '..', 'assets');

    const appPathSegment = isExampleApp
      ? userInput.framework === 'express'
        ? 'example-app'
        : `example-app-${userInput.db}`
      : userInput.projectLanguage.toLowerCase();

    userInput.appDir = `${userInput.assetsPath}/${userInput.framework}/${appPathSegment}`;
    userInput.workflowsFolder = `${userInput.appDir}/.github/workflows`;

    userInput.envVars = {
      Node: {
        NODE_ENV: 'development',
      },
    };

    userInput.pkgJson = {
      scripts: {},
      dependencies: {},
      devDependencies: {},
    };

    const stepsOfExecution = [];
    const asyncOperations = [];

    if (userInput.framework === 'nest') {
      await toolbox.installNest(userInput);
    } else if (userInput.framework) {
      await toolbox.installFramework(userInput);
    }

    if (userInput.framework === 'express' && userInput.db === 'none') {
      // Postgres is the default db for express
      userInput.db = 'pg';
    }

    stepsOfExecution.push(toolbox.jsLinters(userInput));
    stepsOfExecution.push(toolbox.jestConfig(userInput));
    stepsOfExecution.push(toolbox.auditConfig(userInput));
    stepsOfExecution.push(toolbox.debug(userInput));
    stepsOfExecution.push(toolbox.generateReadme(userInput));
    stepsOfExecution.push(toolbox.editorconfig(userInput));

    if (userInput.projectLanguage === 'TS' && userInput.framework !== 'nest') {
      stepsOfExecution.push(toolbox.setupTs(userInput));
    }

    if (userInput.features.includes('dockerizeWorkflow')) {
      stepsOfExecution.push(toolbox.dockerizeWorkflow(userInput));
    }

    if (userInput.db === 'pg') {
      stepsOfExecution.push(toolbox.setupPostgreSQL(userInput));
    }

    if (userInput.db === 'mongodb') {
      stepsOfExecution.push(toolbox.setupMongoDB(userInput));
    }

    if (
      userInput.isExampleApp &&
      (!userInput.authOption || userInput.authOption === 'jwt')
    ) {
      stepsOfExecution.push(toolbox.setupJwt(userInput));
    }

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations();
      step.asyncOperations?.requiredForDevSetup &&
        asyncOperations.push(step.asyncOperations());
    });

    await Promise.all(asyncOperations);

    const expressPackageJson = {
      name: 'dev-app',
      version: '1.0.0',
      main: 'index.js',
      scripts: {},
      keywords: [],
      license: 'ISC',
    };

    const nestPackageJson = {
      name: 'dev-app',
      version: '1.0.0',
      license: 'ISC',
      scripts: {
        build: 'nest build',
        format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
        start: 'nest start',
        'start:dev': 'nest start --watch',
        'start:debug': 'nest start --debug --watch',
        'start:prod': 'node dist/main',
        lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:cov': 'jest --coverage',
        'test:debug':
          'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
        'test:e2e': 'jest --config ./test/jest-e2e.json',
      },
      dependencies: {
        '@nestjs/common': '^9.0.0',
        '@nestjs/core': '^9.0.0',
        '@nestjs/platform-express': '^9.0.0',
        'reflect-metadata': '^0.1.13',
        rxjs: '^7.2.0',
      },
      devDependencies: {
        '@nestjs/cli': '^9.0.0',
        '@nestjs/schematics': '^9.0.0',
        '@nestjs/testing': '^9.0.0',
        '@types/express': '^4.17.13',
        '@types/jest': '29.5.1',
        '@types/node': '18.16.12',
        '@types/supertest': '^2.0.11',
        '@typescript-eslint/eslint-plugin': '^5.0.0',
        '@typescript-eslint/parser': '^5.0.0',
        eslint: '^8.0.1',
        'eslint-config-prettier': '^8.3.0',
        'eslint-plugin-prettier': '^4.0.0',
        jest: '29.5.0',
        prettier: '^2.3.2',
        'source-map-support': '^0.5.20',
        supertest: '^6.1.3',
        'ts-jest': '29.1.0',
        'ts-loader': '^9.2.3',
        'ts-node': '^10.0.0',
        'tsconfig-paths': '4.2.0',
        typescript: '^5.0.0',
      },
      jest: {
        moduleFileExtensions: ['js', 'json', 'ts'],
        rootDir: 'src',
        testRegex: '.*\\.spec\\.ts$',
        transform: {
          '^.+\\.(t|j)s$': 'ts-jest',
        },
        collectCoverageFrom: ['**/*.(t|j)s'],
        coverageDirectory: '../coverage',
        testEnvironment: 'node',
      },
    };

    const packageJson =
      userInput.framework === 'nest' ? nestPackageJson : expressPackageJson;

    Object.assign(packageJson, {
      private: true,
      engines: {
        node: '>=18.6.0',
        npm: '>=9.5.0',
      },
      scripts: {
        ...packageJson.scripts,
        ...userInput.pkgJson.scripts,
      },
      dependencies: {
        ...packageJson.dependencies,
        ...userInput.pkgJson.dependencies,
      },
      devDependencies: {
        dotenv: '^16.0.3',
        ...packageJson.devDependencies,
        ...userInput.pkgJson.devDependencies,
      },
    });

    if (userInput.framework === 'nest') {
      delete packageJson.jest;
      delete packageJson.dependencies['@nestjs/platform-express'];
      delete packageJson.devDependencies['@types/express'];
    }

    const dbScriptLinkPaths =
      userInput.framework === 'nest'
        ? {
            origPath: `${userInput.assetsPath}/db/${userInput.db}/scripts`,
            linkPath: `${userInput.appDir}/scripts`,
          }
        : {
            origPath: `${userInput.assetsPath}/db/${userInput.db}/scripts/db-connection.ts`,
            linkPath: `${userInput.appDir}/scripts/db-connection.ts`,
          };

    const symlinkFiles = [
      isExampleApp && userInput.db === 'pg' && dbScriptLinkPaths,
      {
        origPath: `${userInput.assetsPath}/vscode`,
        linkPath: `${userInput.appDir}/.vscode`,
      },
      {
        origPath: `${userInput.assetsPath}/.eslintignore`,
        linkPath: `${userInput.appDir}/.eslintignore`,
      },
      {
        origPath: `${userInput.assetsPath}/.prettierignore`,
        linkPath: `${userInput.appDir}/.prettierignore`,
      },
      {
        origPath: `${userInput.assetsPath}/.prettierrc.js`,
        linkPath: `${userInput.appDir}/.prettierrc.js`,
      },
      userInput.framework !== 'nest' &&
        userInput.projectLanguage === 'TS' &&
        !isExampleApp && {
          origPath: `${userInput.assetsPath}/tsconfig.json`,
          linkPath: `${userInput.appDir}/tsconfig.json`,
        },
      userInput.framework !== 'nest' &&
        userInput.projectLanguage === 'TS' &&
        !isExampleApp && {
          origPath: `${userInput.assetsPath}/tsconfig.build.json`,
          linkPath: `${userInput.appDir}/tsconfig.build.json`,
        },
      userInput.framework === 'nest' &&
        isExampleApp && {
          origPath: `${userInput.assetsPath}/nest/example-app/Dockerfile`,
          linkPath: `${userInput.appDir}/Dockerfile`,
        },
      userInput.framework === 'nest' &&
        isExampleApp && {
          origPath: `${userInput.assetsPath}/nest/example-app/.devcontainer`,
          linkPath: `${userInput.appDir}/.devcontainer`,
        },
    ].filter(Boolean);

    if (userInput.framework === 'nest' && isExampleApp) {
      try {
        remove(`${userInput.appDir}/src/api/auth`);
        userInput.db === 'mongodb' &&
          remove(`${userInput.appDir}/src/api/users`);
        remove(`${userInput.appDir}/test/todos`);
        remove(`${userInput.appDir}/test/auth`);
        await run(
          `bash ${userInput.assetsPath}/nest/link-script.sh ${
            userInput.assetsPath
          } ${userInput.authOption} ${userInput.db} ${os.isMac()}`
        );
      } catch (err) {
        throw new Error(
          `An error occurred while hard linking features files: ${err}`
        );
      }
    }

    try {
      remove(`${userInput.appDir}/package.json`);
      write(`${userInput.appDir}/package.json`, packageJson);
      for (const file of symlinkFiles) {
        remove(file.linkPath);
        await symlink(file.origPath, file.linkPath);
      }
    } catch (err) {
      throw new Error(
        `An error occurred while writing the package.json file and linking config files: ${err}`
      );
    }

    highlight('\nProject setup completed!\n');
  },
};
