'use strict';

const { getQuestions } = require('../utils/commands/questions');
const exampleAppConfig = require('../utils/commands/example-app.config');
const getFeatures = require('../utils/commands/features');

const command = {
  name: 'setup-dev',
  description: 'Setup dev enviroment for contribution to the project',
  usage: 'node-cli setup-dev [...options]',
  aliases: ['g'],
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
      system: { which },
      filesystem: { path, write, read },
      print: { warning, highlight, error },
      prompt,
      meta,
      commandHelp,
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
        await prompt.ask(getQuestions(userInput, isPip3Avaialble).slice(1, 3))
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
      ? 'example-app'
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

    if (userInput.isExampleApp && userInput.authOption == 'jwt') {
      stepsOfExecution.push(toolbox.setupJwt(userInput));
    }

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations();
      step.asyncOperations?.requiredForDevSetup &&
        asyncOperations.push(step.asyncOperations());
    });

    await Promise.all(asyncOperations);

    const packageJson = JSON.parse(read(`${userInput.appDir}/package.json`));

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
      Object.assign(packageJson.jest, userInput.pkgJson.jest);
      delete packageJson.jest;
      delete packageJson.dependencies['@nestjs/platform-express'];
      delete packageJson.devDependencies['@types/express'];
    }

    try {
      write(`${userInput.appPath}/package.json`, packageJson);
    } catch (err) {
      throw new Error(
        `An error occurred while writing the new package.json file: ${err}`
      );
    }

    highlight('\nProject setup completed!\n');
  },
};
