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
      filesystem: { copyAsync, write, read },
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

      if (framework !== 'nest') {
        const assetsAppDir = isExampleApp
          ? `${assetsPath}/express/example-app`
          : `${assetsPath}/express/${projectLanguage.toLowerCase()}`;

        await copyAsync(
          `${assetsAppDir}/jest.config.js`,
          `${appDir}/jest.config.js`
        );

        await copyAsync(`${assetsAppDir}/test/`, `${appDir}/test/`);

        if (isExampleApp) {
          await copyAsync(`${assetsAppDir}/__mocks__/`, `${appDir}/__mocks__/`);

          await copyAsync(
            `${assetsAppDir}/jest.setup.ts`,
            `${appDir}/jest.setup.ts`
          );
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

      if (framework !== 'nest') {
        Object.assign(pkgJson.scripts, {
          'test:e2e':
            'DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/.bin/jest --config ./test/jest-e2e.config.js',
          'test:e2e:cov': 'npm run test:e2e -- --coverage',
        });

        Object.assign(pkgJson.devDependencies, {
          supertest: '^6.3.3',
        });

        if (projectLanguage === 'TS') {
          Object.assign(pkgJson.devDependencies, {
            '@types/supertest': '^2.0.12',
          });
        }
      }

      if (isExampleApp) {
        Object.assign(pkgJson.devDependencies, {
          pgtools: '^1.0.0',
        });

        Object.assign(pkgJson.scripts, {
          'test:e2e':
            'DOTENV_CONFIG_PATH=.env.test npm run test:e2e:db:recreate && DOTENV_CONFIG_PATH=.env.test npm run db:migrate:latest && DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/.bin/jest --config ./test/jest-e2e.config.js',
          'test:e2e:db:recreate':
            'DOTENV_CONFIG_PATH=.env.test ts-node -r dotenv/config ./test/utils/recreate-db',
        });
      }

      if (framework === 'nest') {
        pkgJson = {
          ...pkgJson,
          jest: {
            coveragePathIgnorePatterns: [
              '<rootDir>/main.ts$',
              '<rootDir>/app.module.ts$',
            ],
            coverageThreshold: {
              global: {
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        };

        Object.assign(pkgJson.scripts, {
          'test:e2e':
            'DOTENV_CONFIG_PATH=.env.test node -r dotenv/config ./node_modules/.bin/jest --config ./test/jest-e2e.json',
          'test:e2e:cov': 'npm run test:e2e -- --coverage',
        });

        const jestE2eConfig = JSON.parse(read(`${appDir}/test/jest-e2e.json`));

        Object.assign(jestE2eConfig, {
          rootDir: '..',
          coverageDirectory: 'coverage-e2e',
          collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
          coveragePathIgnorePatterns: [
            '<rootDir>/src/main.ts$',
            '<rootDir>/.*spec.ts$',
          ],
          coverageThreshold: {
            global: {
              branches: 85,
              functions: 85,
              lines: 85,
              statements: 85,
            },
          },
        });

        write(`${appDir}/test/jest-e2e.json`, jestE2eConfig);
      }
    }

    return {
      asyncOperations,
      syncOperations,
    };
  };
};
