'use strict';

const {
  featureChoices,
  initialFeatureChoices,
  getQuestions,
} = require('../utils/commands/questions');
const exampleAppConfig = require('../utils/commands/example-app.config');
const features = require('../utils/commands/features');

module.exports = {
  name: 'generate',
  description: 'Generate a Node.js project',
  alias: 'g',
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
    } = toolbox;

    if (options['help']) {
      // TODO: write a better help
      console.log(
        'node-cli generate project-name [--interactive|--example-app]'
      );
      return;
    }

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
    const isInteractiveMode = !!options.interactive;
    const isExampleApp = !!options['example-app'];

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time'
      );
    }

    let userInput = {};
    let projectName = first;

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

    userInput.projectScope ||= '';
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
      await toolbox.createProjectDirectory(userInput);
      await toolbox.initializeNpm(userInput);
      await toolbox.installFramework(userInput);
      stepsOfExecution.push(toolbox.jsLinters(userInput));
    }

    await toolbox.initializeGit(userInput);

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

    if (userInput.db === 'pg') {
      stepsOfExecution.push(toolbox.setupPostgreSQL(userInput));
    }

    if (userInput.isExampleApp) {
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
      })
    );

    await Promise.all(asyncOperations);

    const packageJson = JSON.parse(read(`${userInput.appDir}/package.json`));

    packageJson.private = true;

    packageJson.scripts = {
      ...packageJson.scripts,
      ...userInput.pkgJson.scripts,
    };

    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...userInput.pkgJson.dependencies,
    };

    packageJson.devDependencies = {
      dotenv: '^16.0.3',
      ...packageJson.devDependencies,
      ...userInput.pkgJson.devDependencies,
    };

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
