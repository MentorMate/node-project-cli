'use strict';

module.exports = (toolbox) => {
  toolbox.jestConfig = ({
    appDir,
    projectLanguage,
    workflowsFolder,
    pkgJson,
    assetsPath,
    framework,
    authOption,
    isExampleApp,
    db,
  }) => {
    const {
      print: { success, muted },
      filesystem: { copyAsync },
    } = toolbox;

    async function asyncOperations() {
      muted('Configuring Jest...');

      await copyAsync(
        `${assetsPath}/.github/workflows/coverage.yaml`,
        `${workflowsFolder}/coverage.yaml`,
      );

      await copyAsync(
        `${assetsPath}/.github/workflows/coverage-e2e.yaml`,
        `${workflowsFolder}/coverage-e2e.yaml`,
      );

      let assetsAppDir;
      if (isExampleApp) {
        if (framework === 'express' && authOption === 'auth0') {
          assetsAppDir = `${assetsPath}/${framework}/example-app-auth0`;
        } else if (framework === 'express' && authOption === 'jwt') {
          assetsAppDir = `${assetsPath}/${framework}/example-app`;
        } else if (framework === 'nest') {
          assetsAppDir = `${assetsPath}/${framework}/example-app-${db}`;
        }
      } else {
        assetsAppDir = `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}`;
      }

      await copyAsync(
        `${assetsAppDir}/jest.config.js`,
        `${appDir}/jest.config.js`,
      );

      if (framework === 'express') {
        await copyAsync(`${assetsAppDir}/test/`, `${appDir}/test/`);
      }

      if (isExampleApp && db === 'pg') {
        await copyAsync(
          `${assetsAppDir}/jest.setup.ts`,
          `${appDir}/jest.setup.ts`,
        );

        if (framework === 'express') {
          await copyAsync(`${assetsAppDir}/__mocks__/`, `${appDir}/__mocks__/`);
        }
      }

      success(
        'Jest configured successfully. Please wait for the other steps to be completed...',
      );
    }

    function syncOperations() {
      Object.assign(pkgJson.scripts, {
        test: 'jest',
        'test:cov': 'jest --coverage',
        'test:e2e': `DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.config.js`,
        'test:e2e:cov': 'npm run test:e2e -- --coverage',
      });

      Object.assign(pkgJson.devDependencies, {
        jest: '^29.4.2',
        supertest: '^6.3.3',
      });

      if (projectLanguage === 'TS') {
        Object.assign(pkgJson.devDependencies, {
          'ts-jest': '^29.0.5',
          '@types/jest': '^29.4.0',
          '@types/supertest': '^2.0.12',
        });
      }

      if (isExampleApp) {
        Object.assign(pkgJson.devDependencies, {
          pgtools: '^1.0.0',
        });

        Object.assign(pkgJson.scripts, {
          'test:e2e':
            'DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.config.js --runInBand',
        });
      }
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
