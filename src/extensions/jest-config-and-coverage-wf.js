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

      await copyAsync(
        `${assetsPath}/.github/workflows/coverage-e2e.yaml`,
        `${workflowsFolder}/coverage-e2e.yaml`
      );

      const assetsAppDir = isExampleApp
        ? `${assetsPath}/${framework}/example-app`
        : `${assetsPath}/${framework}/${projectLanguage.toLowerCase()}`;

      await copyAsync(
        `${assetsAppDir}/jest.config.js`,
        `${appDir}/jest.config.js`
      );

      await copyAsync(`${assetsAppDir}/test/`, `${appDir}/test/`);

      if (isExampleApp) {
        await copyAsync(
          `${assetsAppDir}/jest.setup.ts`,
          `${appDir}/jest.setup.ts`
        );

        if (framework === 'express') {
          await copyAsync(`${assetsAppDir}/__mocks__/`, `${appDir}/__mocks__/`);
        }
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
            'DOTENV_CONFIG_PATH=.env.test npm run test:e2e:db:recreate && DOTENV_CONFIG_PATH=.env.test npm run db:migrate:latest && DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.config.js',
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
