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
  Framework,
  PickPartial,
  ProjectLanguage,
  UserInput,
} from '../@types';

export const command = {
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
    {
      name: 'database',
      alias: 'db',
      description: 'Possible values: pg, mongodb',
    },
    {
      name: 'auth',
      alias: 'a',
      description: 'Possible values: jwt, auth0',
    },
    {
      name: 'path',
      alias: 'p',
      description: 'Path to generate the project',
    },
  ],
};

export default {
  name: command.name,
  description: command.description,
  alias: command.aliases[0],
  run: async (toolbox: GluegunToolbox) => {
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

    const isPip3Available = !!which('pip3');
    if (!isPip3Available) {
      warning(
        "No `pip3` found on your system, some of the offered functionalities won't be available",
      );
    }

    const pwd = strings.trim(options.path || cwd());
    const isInteractiveMode = !!options.interactive || !!options['i'];
    const isExampleApp = !!options['example-app'] || !!options['e'];
    const framework = options['framework'] || options['f'];
    const db = options['database'] || options['db'];
    const authOption = options['auth'] || options['a'];
    const projectName = first;

    if (isInteractiveMode && isExampleApp) {
      return error(
        'Flags `--interactive` and `--example-app` cannot be used at the same time',
      );
    }

    if (!projectName) {
      throw new CommandError('You must specify a project name');
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
      projectName,
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

    if (isExampleApp) {
      await exampleAppPrompting(userCLIPromptInput, prompt);

      Object.assign(
        userCLIPromptInput,
        exampleAppConfig(userCLIPromptInput.framework, isPip3Available),
      );
    }

    const appDir = path(pwd, userCLIPromptInput.projectName);

    const userInput = Object.assign(
      {},
      {
        features: getFeatures(isPip3Available),
        devSetup: false,
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
        db: userCLIPromptInput.db || Database.NONE,
        framework: userCLIPromptInput.framework || Framework.EXPRESS,
        projectLanguage:
          userCLIPromptInput.projectLanguage || ProjectLanguage.TS,
      },
    ) as UserInput;

    const stepsOfExecution = [];
    const asyncOperations = [];

    await toolbox.createProjectDirectory(userInput);
    await toolbox.initializeGit(userInput);

    if (userInput.framework === Framework.NEST) {
      await toolbox.installNest(userInput);
    } else if (userInput.framework) {
      await toolbox.initializeNpm(userInput);
      await toolbox.installExpress(userInput);
    }

    stepsOfExecution.push(
      toolbox.jsLinters(userInput),
      toolbox.jestConfig(userInput),
      toolbox.auditConfig(userInput),
      toolbox.debug(userInput),
      toolbox.generateReadme(userInput),
      toolbox.editorconfig(userInput),
    );

    if (
      userInput.projectLanguage === ProjectLanguage.TS &&
      userInput.framework !== Framework.NEST
    ) {
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
    }

    if (userInput.db === 'mongodb') {
      stepsOfExecution.push(toolbox.setupMongoDB(userInput));
    }

    if (userInput.isExampleApp && userInput.authOption === AuthOption.JWT) {
      stepsOfExecution.push(toolbox.setupJwt(userInput));
    }

    if (userInput.isExampleApp && userInput.authOption == AuthOption.AUTH0) {
      if (userInput.framework === Framework.NEST) {
        stepsOfExecution.push(toolbox.setupAuth0Nest(userInput));
      }

      if (userInput.framework === Framework.EXPRESS) {
        stepsOfExecution.push(toolbox.setupAuth0Express(userInput));
      }
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

    const packageJson = JSON.parse(
      read(`${userInput.appDir}/package.json`) || '{}',
    );

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
