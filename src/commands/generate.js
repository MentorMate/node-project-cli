'use strict';

const { z } = require('zod');
const {
  featureChoices,
  initialFeatureChoices,
  getQuestions,
} = require('../utils/commands/questions');
const { CommandError } = require('../errors/command.error');
const exampleAppConfig = require('../utils/commands/example-app.config');
const features = require('../utils/commands/features');
const feature = require('../utils/feature');
const dockerization = require('../features/dockerization');
const postgresql = require('../features/postgresql');
const licenseChecks = require('../features/license-checks');
const markdownLint = require('../features/markdown-lint');
const auditGithubWorkflow = require('../features/audit-github-workflow');
const editorconfig = require('../features/editorconfig');
const gitRepository = require('../features/git-repository');
const dotenv = require('../features/dotenv');

module.exports = {
  name: 'generate',
  description: 'Generate a Node.js project',
  alias: 'g',
  run: async (toolbox) => {
    const {
      parameters: { options, first },
      system: { run, which },
      strings,
      filesystem: { dir, path, write, cwd, copyAsync, read, exists },
      print: { success, warning, highlight, error },
      prompt,
      meta,
      commandHelp,
    } = toolbox;

    const projectDirectory = {
      meta: {
        id: 'project-directory',
        name: 'The Project Directory',
      },
      options: {
        projectDir: {
          name: 'directory',
          alias: 'd',
          description: 'The project directory name',
          default: (config) => config.projectName,
          schema: z
            .string({
              required_error: 'Project directory name is required',
              invalid_type_error: 'Project directory name must be a string',
            })
            .trim()
            .min(1, {
              message: 'Project direcotry name can not be blank',
            }),
        },
      },
      output: (config) => ({
        directories: [
          {
            path: config.projectDir,
          },
        ],
      }),
    };

    if (commandHelp.shouldPrint()) {
      commandHelp.print({
        description: 'Generate a Node.js project',
        usage: 'node-cli generate project-name [...options]',
        aliases: ['g'],
        options: [
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
      });

      return;
    }

    const extension = feature.toExtension(toolbox, projectDirectory);
    const result = extension({ projectDir: first });
    result.syncOperations();
    await result.asyncOperations();

    const pip3Installation = which('pip3');

    if (!pip3Installation) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available"
      );
    }

    if (!pip3Installation) {
      // removes huskyHooks
      featureChoices.splice(1, 1);
      initialFeatureChoices.pop();
      features.splice(1, 4);
    }

    const pwd = strings.trim(cwd());
    const isInteractiveMode = !!options.interactive || !!options['i'];
    const isExampleApp = !!options['example-app'] || !!options['e'];
    const framework = options['framework'];

    if (framework && !['express', 'nest'].includes(options['framework'])) {
      return error('Framework must be one of: express, nest');
    }

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time'
      );
    }

    let userInput = {};
    let projectName = first;
    userInput.framework = framework;

    if (isInteractiveMode) {
      userInput = await prompt.ask(
        getQuestions(projectName, userInput.framework).slice(0, 2)
      );

      userInput = Object.assign(
        {},
        userInput,
        await prompt.ask(
          getQuestions(userInput.projectName, userInput.framework).slice(2)
        )
      );
    }

    userInput.projectName ||= projectName;
    userInput.isExampleApp = isExampleApp;

    if (userInput.isExampleApp) {
      Object.assign(userInput, exampleAppConfig);
    }

    if (!userInput.projectName) {
      throw new Error('You must specify a project name');
    }

    userInput.framework ||= 'express';
    userInput.features ||= features;
    userInput.db ||= 'none';
    userInput.projectLanguage = userInput.projectLanguage || 'TS';
    userInput.appDir = path(pwd, userInput.projectName);
    userInput.assetsPath = path(meta.src, '..', 'assets');
    userInput.build = {};
    userInput.dockerComposeServices = {};

    userInput.envVars = {
      Node: {
        NODE_ENV: 'development',
      },
    };

    userInput.pkgJson = {
      name: userInput.projectName,
      version: '0.0.1',
      private: true,
      description: '',
      license: 'UNLICENSED',
      author: '',
      engines: {
        node: '>=18.6.0',
        npm: '>=9.5.0',
      },
      scripts: {},
      dependencies: {},
      devDependencies: {},
    };

    const stepsOfExecution = [];
    const asyncOperations = [];

    if (exists(userInput.appDir)) {
      throw new CommandError(`Directory already exists: ${userInput.appDir}`);
    }

    if (userInput.framework === 'nest') {
      await toolbox.installNest(userInput);
    } else if (userInput.framework) {
      dir(userInput.appDir);
      await toolbox.installFramework(userInput);
    }

    stepsOfExecution.push(
      feature.toExtension(toolbox, gitRepository)(userInput)
    );
    stepsOfExecution.push(feature.toExtension(toolbox, dotenv)(userInput));

    stepsOfExecution.push(toolbox.jsLinters(userInput));
    stepsOfExecution.push(toolbox.jestConfig(userInput));
    stepsOfExecution.push(
      feature.toExtension(toolbox, auditGithubWorkflow)(userInput)
    );
    stepsOfExecution.push(toolbox.debug(userInput));
    stepsOfExecution.push(toolbox.generateReadme(userInput));
    stepsOfExecution.push(
      feature.toExtension(toolbox, editorconfig)(userInput)
    );

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

    if (userInput.features.includes(dockerization.meta.id)) {
      const extension = feature.toExtension(toolbox, dockerization);
      stepsOfExecution.push(extension(userInput));
    }

    if (userInput.features.includes(licenseChecks.meta.id)) {
      const extension = feature.toExtension(toolbox, licenseChecks);
      stepsOfExecution.push(extension(userInput));
    }

    if (userInput.features.includes(markdownLint.meta.id)) {
      const extension = feature.toExtension(toolbox, markdownLint);
      stepsOfExecution.push(extension(userInput));
    }

    if (userInput.db === postgresql.meta.id) {
      const extension = feature.toExtension(toolbox, postgresql);
      stepsOfExecution.push(extension(userInput));
    }

    if (userInput.isExampleApp) {
      stepsOfExecution.push(toolbox.setupJwt(userInput));
    }

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations();
      step.asyncOperations && asyncOperations.push(step.asyncOperations());
    });

    asyncOperations.push(
      copyAsync(`${userInput.assetsPath}/.nvmrc`, `${userInput.appDir}/.nvmrc`)
    );

    await Promise.all(asyncOperations);

    if (Object.keys(userInput.dockerComposeServices).length > 0) {
      toolbox.renderDockerCompose(userInput);
    }

    const packageJson = JSON.parse(read(`${userInput.appDir}/package.json`));

    Object.assign(packageJson, {
      scripts: {
        ...packageJson.scripts,
        ...userInput.pkgJson.scripts,
      },
      dependencies: {
        ...packageJson.dependencies,
        ...userInput.pkgJson.dependencies,
      },
      devDependencies: {
        ...packageJson.devDependencies,
        ...userInput.pkgJson.devDependencies,
      },
    });

    if (userInput.framework === 'nest') {
      Object.assign(packageJson.jest, userInput.pkgJson.jest);
    }

    try {
      write(`${userInput.appDir}/package.json`, packageJson);
    } catch (err) {
      throw new Error(
        `An error occured while writing the new package.json file: ${err}`
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
          `An error has occurred while setting up husky and relevant hooks ${err}`
        );
      }
    }

    highlight('\nProject generation completed!\n');
    success(`Run "cd ${userInput.appDir}" to enter your project's folder.`);
    success(
      'Use "git remote add origin [your remote repository address]" to link your local and remote repositories.'
    );
    success(
      'Use "git add . && git commit -m "feat: initial commit" && git push -u origin main" to push your initial local repository contents to your remote one.'
    );
    success(
      'You can then procede managing your repositories according to your usual pracitces.'
    );
  },
};
