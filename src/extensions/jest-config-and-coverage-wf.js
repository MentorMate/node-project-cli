'use strict';

module.exports = (toolbox) => {
  toolbox.jestConfig = ({
    appDir,
    projectLanguage,
    workflowsFolder,
    pkgJson,
    assetsPath,
    framework,
    isExampleApp,
  }) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring Jest...');

      await copyAsync(
        `${assetsPath}/.github/workflows/coverage.yaml`,
        `${workflowsFolder}/coverage.yaml`
      );

      if (framework !== 'nest') {
        const jestConfigFile = `${assetsPath}/jest/${projectLanguage.toLowerCase()}-jest.config.js`;
        await copyAsync(jestConfigFile, `${appDir}/jest.config.js`);
      }

      if (isExampleApp) {
        await copyAsync(
          `${assetsPath}/express/example-app/jest.config.js`,
          `${appDir}/jest.config.js`,
          { overwrite: true }
        );
        await copyAsync(
          `${assetsPath}/express/example-app/__mocks__/`,
          `${appDir}/__mocks__/`
        );
        await copyAsync(
          `${assetsPath}/express/example-app/test/`,
          `${appDir}/test/`
        );
      }

      if (framework === 'nest' || isExampleApp) {
        await copyAsync(
          `${assetsPath}/.github/workflows/coverage-e2e.yaml`,
          `${workflowsFolder}/coverage-e2e.yaml`
        );
      }

      success(
        'Jest configured successfully. Please wait for the other steps to be completed...'
      );
    }

    function syncOperations() {
      Object.assign(pkgJson.scripts, {
        test: 'jest',
        'test:cov': 'jest --coverage',
        'test:watch': 'jest --watch',
      });

      Object.assign(pkgJson.devDependencies, {
        jest: '^29.4.2',
      });

      if (projectLanguage === 'TS') {
        Object.assign(pkgJson.devDependencies, {
          'ts-jest': '^29.0.5',
          '@types/jest': '^29.4.0',
        });
      }

      if (isExampleApp) {
        Object.assign(pkgJson.devDependencies, {
          pgtools: '^1.0.0',
          supertest: '^6.3.3',
          '@types/supertest': '^2.0.12',
        });

        Object.assign(pkgJson.scripts, {
          'test:e2e':
            'DOTENV_CONFIG_PATH=.env.test npm run test:e2e:db:recreate && DOTENV_CONFIG_PATH=.env.test npm run db:migrate:latest && DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/.bin/jest --config ./test/jest-e2e.config.js',
          'test:e2e:cov': 'npm run test:e2e -- --coverage',
          'test:e2e:db:recreate':
            'DOTENV_CONFIG_PATH=.env.test ts-node -r dotenv/config ./test/utils/recreate-db',
        });
      }
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
