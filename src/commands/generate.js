'use strict';

const { getQuestions } = require('../utils/commands/questions');
const { CommandError } = require('../errors/command.error');
const exampleAppConfig = require('../utils/commands/example-app.config');
const getFeatures = require('../utils/commands/features');

const command = {
  name: 'generate',
  description: 'Generate a Node.js project',
  usage: 'node-cli generate project-name [...options]',
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
      parameters: { options, first },
      system: { run, which },
      strings,
      filesystem: { path, dir, write, cwd, copyAsync, read },
      print: { success, warning, highlight, error },
      prompt,
      meta,
      template: { generate },
      commandHelp,
    } = toolbox;

    if (commandHelp.shouldPrint()) {
      commandHelp.print(command);
      return;
    }

    const isPip3Avaialble = !!which('pip3');

    if (!isPip3Avaialble) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available",
      );
    }

    const pwd = strings.trim(cwd());
    const isInteractiveMode = !!options.interactive || !!options['i'];
    const isExampleApp = !!options['example-app'] || !!options['e'];
    const framework = options['framework'] || options['f'];
    const projectName = first;

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time',
      );
    }

    let userInput = {
      projectName,
      framework,
      isExampleApp,
    };

    if (isInteractiveMode) {
      userInput = await prompt.ask(
        getQuestions(userInput, isPip3Avaialble).slice(0, 2),
      );

      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(getQuestions(userInput, isPip3Avaialble).slice(2)),
      );
    }

    if (userInput.isExampleApp) {
      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(getQuestions(userInput, isPip3Avaialble).slice(1, 5)),
      );

      Object.assign(
        userInput,
        exampleAppConfig(userInput.framework, isPip3Avaialble),
      );
    }

    if (!userInput.projectName) {
      throw new CommandError('You must specify a project name');
    }

    userInput.framework ||= 'express';
    userInput.features ||= getFeatures(isPip3Avaialble);
    userInput.db ||= 'none';
    userInput.projectLanguage = userInput.projectLanguage || 'TS';
    userInput.appDir = path(pwd, userInput.projectName);
    userInput.assetsPath = path(meta.src, '..', 'assets');
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

    await toolbox.createProjectDirectory(userInput);
    await toolbox.initializeGit(userInput);

    if (userInput.framework === 'nest') {
      await toolbox.installNest(userInput);
    } else if (userInput.framework) {
      await toolbox.initializeNpm(userInput);
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

    if (
      userInput.features.includes('huskyHooks') ||
      userInput.features.includes('commitMsgLint') ||
      userInput.features.includes('preCommit') ||
      userInput.features.includes('prePush')
    ) {
      stepsOfExecution.push(toolbox.setupHusky(userInput));
    }

    if (userInput.features.includes('dockerizeWorkflow')) {
      stepsOfExecution.push(toolbox.dockerizeWorkflow(userInput));
    }

    if (userInput.features.includes('licenseChecks')) {
      stepsOfExecution.push(toolbox.setupLicenseChecks(userInput));
    }

    if (userInput.features.includes('markdownLinter')) {
      stepsOfExecution.push(toolbox.setupMarkdownLinter(userInput));
    }

    if (userInput.db === 'pg') {
      stepsOfExecution.push(toolbox.setupPostgreSQL(userInput));
    } else if (userInput.db === 'mongodb') {
      stepsOfExecution.push(toolbox.setupMongoDB(userInput));
    }

    if (userInput.isExampleApp && userInput.authOption == 'jwt') {
      stepsOfExecution.push(toolbox.setupJwt(userInput));
    }

    dir(userInput.workflowsFolder);

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations();
      step.asyncOperations && asyncOperations.push(step.asyncOperations());
    });

    asyncOperations.push(
      copyAsync(`${userInput.assetsPath}/.nvmrc`, `${userInput.appDir}/.nvmrc`),
      generate({
        template: 'dotenv/.env.example.ejs',
        target: `${userInput.appDir}/.env.example`,
        props: { groups: userInput.envVars },
      }),
    );

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
      write(`${userInput.appDir}/package.json`, packageJson);
    } catch (err) {
      throw new Error(
        `An error occurred while writing the new package.json file: ${err}`,
      );
    }

    if (
      userInput.features.includes('huskyHooks') ||
      userInput.features.includes('commitMsgLint') ||
      userInput.features.includes('preCommit') ||
      userInput.features.includes('prePush')
    ) {
      let script = `cd ${userInput.appDir} && npx husky install && npx sort-package-json`;

      if (
        userInput.features.includes('huskyHooks') ||
        userInput.features.includes('preCommit')
      ) {
        script += ` && bash ${userInput.assetsPath}/local-scripts/initiate-detect-secrets.sh ${userInput.appDir}`;
      }

      try {
        await run(script);
      } catch (err) {
        throw new Error(
          `An error has occurred while setting up husky and relevant hooks ${err}`,
        );
      }
    }

    highlight('\nProject generation completed!\n');
    success(`Run "cd ${userInput.appDir}" to enter your project's folder.`);
    success(
      'Use "git remote add origin [your remote repository address]" to link your local and remote repositories.',
    );
    success(
      'Use "git add . && git commit -m "feat: initial commit" && git push -u origin main" to push your initial local repository contents to your remote one.',
    );
    success(
      'You can then proceed managing your repositories according to your usual practices.',
    );
  },
};
