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

        describe('and the framework is not nest', () => {
          beforeAll(() => {
            input.framework = 'express';
          });

          describe('and the database it pg', () => {
            beforeAll(() => {
              input.db = 'pg';
            });

            it('should add the pgtools devDependency', () => {
              expect(devDependencies).toHaveProperty('pgtools');
            });

            it('should add the @types/supertest devDependency', () => {
              expect(devDependencies).toHaveProperty('@types/supertest');
            });

            it('should add the supertest devDependency', () => {
              expect(devDependencies).toHaveProperty('supertest');
            });

            it('should add the test:e2e script', () => {
              expect(scripts).toHaveProperty('test:e2e');
            });

            it('should add the test:e2e:cov script', () => {
              expect(scripts).toHaveProperty('test:e2e:cov');
            });

            it('should add the test:e2e:db:recreate script', () => {
              expect(scripts).toHaveProperty('test:e2e:db:recreate');
            });
          });
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

      describe('when the framework is not Nest', () => {
        beforeAll(() => {
          input.framework = 'express';
        });

        describe('when the language is TypeScript', () => {
          beforeAll(() => {
            input.projectLanguage = 'TS';
          });

          it('should copy the TypeScript jest config', () => {
            expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
              `${input.assetsPath}/jest.config.ts.js`,
              `${input.appDir}/jest.config.js`
            );
          });

          describe('and the database is pg', () => {
            beforeAll(() => {
              input.db = 'pg';
            });

            it('should copy the example project tests', () => {
              expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
                `${input.assetsPath}/test/`,
                `${input.appDir}/test/`
              );
            });
          });
        });

        describe('when the language is JavaScript', () => {
          beforeAll(() => {
            input.projectLanguage = 'JS';
          });

          it('should copy the JavaScript jest config', () => {
            expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
              `${input.assetsPath}/jest.config.vanilla.js`,
              `${input.appDir}/jest.config.js`
            );
          });
        });
      });

      describe('when an error is thrown', () => {
        const error = new Error('the-error');

        beforeEach(async () => {
          toolbox.filesystem.copyAsync = jest.fn(() => {
            throw error;
          });
        });

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.jestConfig(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while copying jest configuration and workflow: ${error}`
          );
        });
      });
    });
  });
});
