'use strict';

module.exports = {
  name: 'generate',
  description: 'Generate a Node.js project',
  alias: 'g',
  run: async (toolbox) => {
    const {
      parameters,
      system: { run, which },
      strings,
      filesystem: { path, dir, write, copyAsync, cwd, read },
      print: { success, warning, muted, highlight },
      prompt,
      meta,
    } = toolbox;

    const CLI_PATH = path(`${meta.src}`, '..');
    const ASSETS_PATH = path(CLI_PATH, 'assets');
    const pip3Installation = which('pip3');

    if (!pip3Installation) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available"
      );
    }

    const featureChoices = [
      { message: 'JS Code Linters', value: 'JSLinters' },
      {
        message: 'Hooks with `husky`',
        value: 'huskyHooks',
        choices: [
          { message: 'Commit message linting', value: 'commitMsgLint' },
          { message: 'Pre-commit hook', value: 'preCommit' },
          { message: 'Pre-push hook', value: 'prePush' },
        ],
      },
      {
        message: 'Dockerize GitHub workflow step',
        value: 'dockerizeWorkflow',
      },
    ];
    const initialFeatureChoices = [0, 1, 5];

    if (!pip3Installation) {
      featureChoices.splice(1, 1);
      initialFeatureChoices.pop();
    }
    const pwd = strings.trim(cwd());
    let pickedFramework;
    let projectName = parameters.first;
    let userInput = await prompt.ask([
      {
        type: 'input',
        name: 'projectName',
        message: 'Specify a project name:',
        initial: projectName,
        format: (v) => v.replace(/\s/g, '-'),
        result: (v) => v.replace(/\s/g, '-'),
      },
      {
        type: 'input',
        name: 'projectScope',
        message: 'Specify project scope [blank if not scoped]:',
        format: (v) => v.replace(/\s/g, '-'),
        result: (v) => v.replace(/\s/g, '-'),
      },
      {
        // The code for installing the framework and copying the folder structure is
        // not yet implemented. WIP
        type: 'select',
        name: 'framework',
        message: 'Pick a framework for your project',
        choices: [
          { message: 'Express', value: 'express' },
          { message: 'Fastify', value: 'fastify' },
          {
            message: 'NestJS (TS only) with pre-installed linters',
            value: 'nest',
          },
        ],
        result(v) {
          pickedFramework = v;
          return v;
        },
      },
    ]);
    userInput = Object.assign(
      {},
      userInput,
      await prompt.ask([
        {
          type: 'select',
          name: 'projectLanguage',
          message:
            'TypeScript should be selected unless there is a sufficient reason not to use it in your project.\n  Please contact the responsible architect on the project for approving Vanilla JS usage',
          choices: [
            { message: 'TypeScript', value: 'TS' },
            { message: 'Vanilla JS', value: 'JS' },
          ],
          skip: pickedFramework.includes('nest'),
        },
        {
          type: 'select',
          name: 'moduleType',
          message: 'CommonJS or ES Modules',
          choices: [
            { message: 'CommonJS', value: 'CJS' },
            { message: 'ES Modules', value: 'ESM' },
          ],
          skip: pickedFramework.includes('nest'),
        },
        {
          type: 'multiselect',
          name: 'features',
          message: 'Select the features you want to be prebuilt',
          choices: featureChoices,
          initial: initialFeatureChoices,
        },
      ])
    );

    userInput.projectLanguage = userInput.projectLanguage || 'TS';
    userInput.moduleType = userInput.moduleType || 'CJS';
    userInput.appDir = path(pwd, userInput.projectName);
    userInput.assetsPath = ASSETS_PATH;
    userInput.pkgJsonScripts = [];
    userInput.pkgJsonInstalls = [];
    userInput.workflowsFolder = `${userInput.appDir}/.github/workflows`;

    const stepsOfExecution = [];
    const asyncOperations = [];

    if (pickedFramework === 'nest') {
      await toolbox.installNest(userInput);
    } else if (pickedFramework) {
      await toolbox.installFramework(userInput);
      stepsOfExecution.push(toolbox.jsLinters(userInput));
    }

    stepsOfExecution.push(toolbox.jestConfig(userInput));

    if (userInput.projectLanguage === 'TS') {
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

    dir(userInput.workflowsFolder);

    stepsOfExecution.forEach((step) => {
      step.syncOperations && step.syncOperations();
      step.asyncOperations && asyncOperations.push(step.asyncOperations());
    });

    asyncOperations.push(
      (async () => {
        muted('Installing dev dependencies...');
        try {
          await run(
            `cd ${
              userInput.appDir
            } && npm install --save-dev ${userInput.pkgJsonInstalls.join(' ')}`
          );
        } catch (err) {
          throw new Error(
            `An error has occurred while installing dev dependencies: ${err}`
          );
        }
        success(
          'All dev dependencies have been installed successfully. Please wait for the other steps to be completed...'
        );
      })(),
      (async () => {
        try {
          await copyAsync(
            `${ASSETS_PATH}/.project-gitignr`,
            `${userInput.appDir}/.gitignore`
          );
          if (userInput.projectLanguage == 'TS') {
            await run(`echo "dist/\n" >> ${userInput.appDir}/.gitignore`);
          }
        } catch (err) {
          throw new Error(
            `An error has occurred while setting up .gitignore: ${err}`
          );
        }
        success(
          '.gitignore file created successfully. Please wait for the other steps to be completed...'
        );
      })()
    );

    await Promise.all(asyncOperations);

    const packageJson = JSON.parse(read(`${userInput.appDir}/package.json`));
    const newScripts = userInput.pkgJsonScripts.reduce(
      (acc, scr) => ({ ...acc, ...scr }),
      {}
    );
    if (pickedFramework === 'nest') {
      Object.assign(newScripts, packageJson.scripts);
      packageJson.jest.coverageThreshold = {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      };
    }
    packageJson.scripts = newScripts;

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
        script += ` && bash ${ASSETS_PATH}/local-scripts/initiate-detect-secrets.sh ${userInput.appDir}`;
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
