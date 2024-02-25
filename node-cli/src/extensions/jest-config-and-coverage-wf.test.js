const extend = require('./jest-config-and-coverage-wf');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('jest-config-and-coverage-wf', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set jestConfig on toolbox', () => {
    expect(toolbox.jestConfig).toBeDefined();
  });

  describe('jestConfig', () => {
    let input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.jestConfig(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;
      let devDependencies;

      beforeAll(() => {
        input.projectLanguage = 'JS';
      });

      beforeEach(() => {
        toolbox.jestConfig(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add the test script', () => {
        expect(scripts).toHaveProperty('test');
      });

      it('should add the "test:unit:cov" script', () => {
        expect(scripts).toHaveProperty('test:unit:cov');
      });

      it('should add the test:e2e script', () => {
        expect(scripts).toHaveProperty('test:e2e');
      });

      it('should add the test:e2e:cov script', () => {
        expect(scripts).toHaveProperty('test:e2e:cov');
      });

      it('should add the jest devDependency', () => {
        expect(devDependencies).toHaveProperty('jest');
      });

      it('should add the supertest devDependency', () => {
        expect(devDependencies).toHaveProperty('supertest');
      });

      describe('when the languange is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS';
        });

        it('should add the ts-jest devDependency', () => {
          expect(devDependencies).toHaveProperty('ts-jest');
        });

        it('should add the @types/jest devDependency', () => {
          expect(devDependencies).toHaveProperty('@types/jest');
        });

        it('should add the @types/supertest devDependency', () => {
          expect(devDependencies).toHaveProperty('@types/supertest');
        });
      });

      describe('and it is the example app', () => {
        beforeAll(() => {
          input.isExampleApp = true;
        });

        afterAll(() => {
          input.isExampleApp = false;
        });

        it('should add the pgtools devDependency', () => {
          expect(devDependencies).toHaveProperty('pgtools');
        });

        it('should add the test:e2e script', () => {
          expect(scripts).toHaveProperty('test:e2e');
        });
      });
    });

    describe('asyncOperations', () => {
      let assetsAppDir;

      beforeAll(() => {
        input.framework = 'express';
        assetsAppDir = input.isExampleApp
          ? `${input.assetsPath}/${input.framework}/example-app`
          : `${input.assetsPath}/${
              input.framework
            }/${input.projectLanguage.toLowerCase()}`;
      });

      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.jestConfig(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      it('should copy the coverage workflow config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.github/workflows/coverage.yaml`,
          `${input.workflowsFolder}/coverage.yaml`,
        );
      });

      it('should copy the coverage-e2e workflow config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.github/workflows/coverage-e2e.yaml`,
          `${input.workflowsFolder}/coverage-e2e.yaml`,
        );
      });

      it('should copy the jest config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${assetsAppDir}/jest.config.js`,
          `${input.appDir}/jest.config.js`,
        );
      });

      it('should copy the project tests', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${assetsAppDir}/test/`,
          `${input.appDir}/test/`,
        );
      });

      describe('express example app - auth0', () => {
        beforeAll(() => {
          input.isExampleApp = true;
          input.db = 'pg';
          input.authOption = 'auth0';
          input.framework = 'express';
        });

        afterAll(() => {
          input.isExampleApp = false;
          input.db = undefined;
          input.authOption = undefined;
        });

        it('should copy the jest setup file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app-auth0/jest.config.js`,
            `${input.appDir}/jest.config.js`,
          );

          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app-auth0/jest.setup.ts`,
            `${input.appDir}/jest.setup.ts`,
          );

          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/example-app-auth0/__mocks__/`,
            `${input.appDir}/__mocks__/`,
          );
        });
      });

      describe('express example app - jwt', () => {
        beforeAll(() => {
          input.isExampleApp = true;
          input.db = 'pg';
          input.authOption = 'jwt';
          input.framework = 'express';
        });

        afterAll(() => {
          input.isExampleApp = false;
          input.authOption = undefined;
        });

        it('should copy the jest setup file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app/jest.config.js`,
            `${input.appDir}/jest.config.js`,
          );

          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app/jest.setup.ts`,
            `${input.appDir}/jest.setup.ts`,
          );

          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/example-app/__mocks__/`,
            `${input.appDir}/__mocks__/`,
          );
        });
      });

      describe('nest example app - postgres', () => {
        beforeAll(() => {
          input.isExampleApp = true;
          input.db = 'pg';
          input.authOption = 'auth0';
          input.framework = 'nest';
        });

        afterAll(() => {
          input.isExampleApp = false;
          input.db = undefined;
          input.authOption = undefined;
        });

        it('should copy the jest setup file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app-pg/jest.setup.ts`,
            `${input.appDir}/jest.setup.ts`,
          );
        });
      });

      describe('nest example app - mongodb', () => {
        beforeAll(() => {
          input.isExampleApp = true;
          input.db = 'mongodb';
          input.authOption = 'auth0';
          input.framework = 'nest';
        });

        afterAll(() => {
          input.isExampleApp = false;
          input.db = undefined;
          input.authOption = undefined;
        });

        it('should copy the jest setup file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/${input.framework}/example-app-mongodb/jest.config.js`,
            `${input.appDir}/jest.config.js`,
          );
        });
      });
    });
  });
});
