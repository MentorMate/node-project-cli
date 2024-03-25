'use strict';

import {
  interactiveAppPrompting,
  exampleAppPrompting,
} from '../utils/commands';
import { CommandError } from '../errors/command.error';
import exampleAppConfig from '../utils/commands/example-app.config';
import getFeatures from '../utils/commands/features';
import { GluegunToolbox } from 'gluegun';
import {
  AuthOption,
  Database,
  DeepPartial,
  Framework,
  PickPartial,
  ProjectLanguage,
  UserInput,
} from '../@types';

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

export default {
  name: command.name,
  description: command.description,
  alias: command.aliases[0],
  run: async (toolbox: GluegunToolbox) => {
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

    const isPip3Available = !!which('pip3');

    if (!isPip3Available) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available",
      );
    }

    const isInteractiveMode = !!options.interactive || !!options['i'];
    const isExampleApp = !!options['example-app'] || !!options['e'];
    const framework = options['framework'] || options['f'];
    const db = options['database'] || options['db'];
    const authOption = options['auth'] || options['a'];

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time',
      );
    }

    if (isExampleApp) {
      if (
        framework &&
        ![Framework.EXPRESS, Framework.NEST].includes(framework)
      ) {
        return error(
          `Invalid framework option "${framework}", possible values: express, nest`,
        );
      }

      if (db && ![Database.POSTGRESQL, Database.MONGODB].includes(db)) {
        return error(
          `Invalid database option "${db}", possible values: pg, mongodb`,
        );
      }

      if (db && framework === Framework.EXPRESS && db !== Database.POSTGRESQL) {
        return error(
          `Invalid database option "${db}" for express, possible values: pg`,
        );
      }

      if (
        authOption &&
        ![AuthOption.JWT, AuthOption.AUTH0].includes(authOption)
      ) {
        return error(
          `Invalid auth option "${authOption}", possible values: jwt, auth0`,
        );
      }
    }

    let userCLIPromptInput: PickPartial<
      UserInput,
      'projectName' | 'framework' | 'isExampleApp'
    > = {
      projectName: 'develop',
      framework,
      isExampleApp,
      db,
      authOption,
    };

    if (isInteractiveMode) {
      await interactiveAppPrompting(
        userCLIPromptInput,
        prompt,
        isPip3Available,
      );
    }

    if (userCLIPromptInput.isExampleApp) {
      await exampleAppPrompting(userCLIPromptInput, prompt);

      Object.assign(
        userCLIPromptInput,
        exampleAppConfig(userCLIPromptInput.framework, isPip3Available),
      );
    }

    const appPathSegment = isExampleApp
      ? userCLIPromptInput.framework === Framework.EXPRESS
        ? 'example-app'
        : `example-app-${userCLIPromptInput.db}`
      : userCLIPromptInput.projectLanguage?.toLowerCase() || 'ts';
    const appDir = `${userCLIPromptInput.assetsPath}/${userCLIPromptInput.framework}/${appPathSegment}`;
    const userInput = Object.assign(
      {},
      {
        features: getFeatures(isPip3Available),
        devSetup: true,
        db: Database.NONE,
        projectLanguage:
          userCLIPromptInput.projectLanguage || ProjectLanguage.TS,
        appDir,
        assetsPath: path(meta.src as string, '..', 'assets'),
        workflowsFolder: `${appDir}/.github/workflows`,
        pkgJson: {
          scripts: {},
          dependencies: {},
          devDependencies: {},
        },
        envVars: {
          Node: {
            NODE_ENV: 'development',
          },
        },
        ...userCLIPromptInput,
      },
    ) as UserInput;

    const stepsOfExecution = [];
    const asyncOperations: (() => Promise<unknown>)[] = [];

    if (userInput.framework === Framework.NEST) {
      await toolbox.installNest(userInput);
    } else if (userInput.framework) {
      await toolbox.installFramework(userInput);
    }

    if (
      userInput.framework === Framework.EXPRESS &&
      userInput.db === Database.NONE
    ) {
      // Postgres is the default db for express
      userInput.db = Database.POSTGRESQL;
    }

    stepsOfExecution.push(toolbox.jsLinters(userInput));
    stepsOfExecution.push(toolbox.jestConfig(userInput));
    stepsOfExecution.push(toolbox.auditConfig(userInput));
    stepsOfExecution.push(toolbox.debug(userInput));
    stepsOfExecution.push(toolbox.generateReadme(userInput));
    stepsOfExecution.push(toolbox.editorconfig(userInput));

    if (
      userInput.projectLanguage === ProjectLanguage.TS &&
      userInput.framework !== Framework.NEST
    ) {
      stepsOfExecution.push(toolbox.setupTs(userInput));
    }

    if (userInput.features.includes('dockerizeWorkflow')) {
      stepsOfExecution.push(toolbox.dockerizeWorkflow(userInput));
    }

    if (userInput.db === Database.POSTGRESQL) {
      stepsOfExecution.push(toolbox.setupPostgreSQL(userInput));
    }

    if (userInput.db === Database.MONGODB) {
      stepsOfExecution.push(toolbox.setupMongoDB(userInput));
    }

    if (
      userInput.isExampleApp &&
      (!userInput.authOption || userInput.authOption === AuthOption.JWT)
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
      dependencies: {},
      devDependencies: {},
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
        'test:unit': 'jest',
        'test:unit:cov': 'jest --coverage',
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
      userInput.framework === Framework.NEST
        ? nestPackageJson
        : expressPackageJson;

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

    if (userInput.framework === Framework.NEST) {
      delete (packageJson as DeepPartial<typeof nestPackageJson>).jest;
      delete (packageJson as DeepPartial<typeof nestPackageJson>)
        .dependencies?.['@nestjs/platform-express'];
      delete (packageJson as DeepPartial<typeof nestPackageJson>)
        .devDependencies?.['@types/express'];
    }

    const dbScriptLinkPaths =
      userInput.framework === Framework.NEST
        ? {
            origPath: `${userInput.assetsPath}/db/${userInput.db}/scripts`,
            linkPath: `${userInput.appDir}/scripts`,
          }
        : {
            origPath: `${userInput.assetsPath}/db/${userInput.db}/scripts/db-connection.ts`,
            linkPath: `${userInput.appDir}/scripts/db-connection.ts`,
          };

    const symlinkFiles = [
      isExampleApp && userInput.db === Database.POSTGRESQL && dbScriptLinkPaths,
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
      userInput.framework !== Framework.NEST &&
        userInput.projectLanguage === ProjectLanguage.TS &&
        !isExampleApp && {
          origPath: `${userInput.assetsPath}/tsconfig.json`,
          linkPath: `${userInput.appDir}/tsconfig.json`,
        },
      userInput.framework !== Framework.NEST &&
        userInput.projectLanguage === ProjectLanguage.TS &&
        !isExampleApp && {
          origPath: `${userInput.assetsPath}/tsconfig.build.json`,
          linkPath: `${userInput.appDir}/tsconfig.build.json`,
        },
      userInput.framework === Framework.NEST &&
        isExampleApp && {
          origPath: `${userInput.assetsPath}/nest/example-app/Dockerfile`,
          linkPath: `${userInput.appDir}/Dockerfile`,
        },
      userInput.framework === Framework.NEST &&
        isExampleApp && {
          origPath: `${userInput.assetsPath}/nest/example-app/.devcontainer`,
          linkPath: `${userInput.appDir}/.devcontainer`,
        },
    ].filter(Boolean) as { origPath: string; linkPath: string }[];

    if (userInput.framework === Framework.NEST && isExampleApp) {
      try {
        remove(`${userInput.appDir}/src/api/auth`);
        userInput.db === Database.MONGODB &&
          remove(`${userInput.appDir}/src/api/users`);
        remove(`${userInput.appDir}/test/todos`);
        remove(`${userInput.appDir}/test/auth`);
        await run(
          `bash ${userInput.assetsPath}/nest/link-script.sh ${
            userInput.assetsPath
          } ${userInput.authOption} ${userInput.db} ${os.isMac()}`,
        );
      } catch (err) {
        throw new Error(
          `An error occurred while hard linking features files: ${err}`,
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
        `An error occurred while writing the package.json file and linking config files: ${err}`,
      );
    }

    highlight('\nProject setup completed!\n');
  },
};
