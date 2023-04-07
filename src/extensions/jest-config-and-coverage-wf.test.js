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

      it('should add the "test:cov" script', () => {
        expect(scripts).toHaveProperty('test:cov');
      });

      it('should add the "test:watch" script', () => {
        expect(scripts).toHaveProperty('test:watch');
      });

      it('should add the jest devDependency', () => {
        expect(devDependencies).toHaveProperty('jest');
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
      });

      describe('when the framework is not nest', () => {
        beforeAll(() => {
          input.framework = 'express';
        });

        it('should add the test:e2e script', () => {
          expect(scripts).toHaveProperty('test:e2e');
        });

        it('should add the test:e2e:cov script', () => {
          expect(scripts).toHaveProperty('test:e2e:cov');
        });

        it('should add the supertest devDependency', () => {
          expect(devDependencies).toHaveProperty('supertest');
        });

        describe('when the languange is TypeScript', () => {
          beforeAll(() => {
            input.projectLanguage = 'TS';
          });

          it('should add the @types/supertest devDependency', () => {
            expect(devDependencies).toHaveProperty('@types/supertest');
          });
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

        it('should add the test:e2e:db:recreate script', () => {
          expect(scripts).toHaveProperty('test:e2e:db:recreate');
        });
      });
    });

    describe('asyncOperations', () => {
      beforeAll(() => {
        input.framework = 'nest';
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
          `${input.workflowsFolder}/coverage.yaml`
        );
      });

      it('should copy the coverage-e2e workflow config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.github/workflows/coverage-e2e.yaml`,
          `${input.workflowsFolder}/coverage-e2e.yaml`
        );
      });

      describe('when the framework is not Nest', () => {
        let assetsAppDir;

        beforeAll(() => {
          input.framework = 'express';

          assetsAppDir = input.isExampleApp
            ? `${input.assetsPath}/express/example-app`
            : `${
                input.assetsPath
              }/express/${input.projectLanguage.toLowerCase()}`;
        });

        it('should copy the jest config', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsAppDir}/jest.config.js`,
            `${input.appDir}/jest.config.js`
          );
        });

        it('should copy the project tests', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${assetsAppDir}/test/`,
            `${input.appDir}/test/`
          );
        });

        describe('and is the example app', () => {
          beforeAll(() => {
            input.isExampleApp = true;
          });

          afterAll(() => {
            input.isExampleApp = false;
          });

          it('should copy the example project unit test mocks', () => {
            expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
              `${input.assetsPath}/express/example-app/__mocks__/`,
              `${input.appDir}/__mocks__/`
            );
          });
        });
      });
    });
  });
});
