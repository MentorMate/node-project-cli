const extend = require('./ts-setup');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('ts-setup', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupTs on toolbox', () => {
    expect(toolbox.setupTs).toBeDefined();
  });

  describe('setupTs', () => {
    const input = createExtensionInput();
    let ops;

    beforeEach(() => {
      ops = toolbox.setupTs(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;
      let devDependencies;

      beforeAll(() => {
        input.framework = 'nest';
      });

      beforeEach(() => {
        toolbox.filesystem.copy = jest.fn(() => {});
        toolbox.filesystem.read = jest.fn(() =>
          JSON.stringify({ compilerOptions: {} })
        );
        toolbox.filesystem.write = jest.fn(() => {});
        toolbox.setupTs(input).syncOperations();
        scripts = input.pkgJson.scripts;
        devDependencies = input.pkgJson.devDependencies;
      });

      describe('when the framework is not Nest', () => {
        beforeAll(() => {
          input.framework = 'express';
          input.pkgJsonScripts = [];
          input.pkgJsonInstalls = [];
        });

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copy).toHaveBeenCalledWith(
            `${input.assetsPath}/tsconfig.json`,
            `${input.appDir}/tsconfig.json`
          );
        });

        it('should add a clean script', () => {
          expect(scripts['clean']).toBeDefined();
        });

        it('should add a build script', () => {
          expect(scripts['build']).toBeDefined();
        });

        it('should add the typescript package', () => {
          expect(devDependencies).toHaveProperty('typescript');
        });

        it('should add the @tsconfig/recommended package', () => {
          expect(devDependencies).toHaveProperty('@tsconfig/recommended');
        });

        it('should add the tsconfig-paths package', () => {
          expect(devDependencies).toHaveProperty('tsconfig-paths');
        });

        it('should add the @types/node package', () => {
          expect(devDependencies).toHaveProperty('@types/node');
        });

        it('should add the rimraf package', () => {
          expect(devDependencies).toHaveProperty('rimraf');
        });

        it('should add the ts-node package', () => {
          expect(devDependencies).toHaveProperty('ts-node');
        });
      });

      describe('when the framework is Nest', () => {
        beforeAll(() => {
          input.framework = 'nest';
          input.pkgJson.scripts = {};
          input.pkgJson.devDependencies = {};
        });

        it('should not copy the tsconfig', () => {
          expect(toolbox.filesystem.copy).not.toHaveBeenCalled();
        });

        it('should not add any scripts or devDependencies', () => {
          expect(Object.keys(scripts).length).toBe(0);
          expect(Object.keys(devDependencies).length).toBe(0);
        });
      });

      describe('when the module system is ESM', () => {
        beforeAll(() => {
          input.moduleType = 'ESM';
        });

        it('should update the tsconfig file', () => {
          expect(toolbox.filesystem.read).toHaveBeenCalledWith(
            `${input.appDir}/tsconfig.json`
          );
          expect(toolbox.filesystem.write).toHaveBeenCalled();
          const config = toolbox.filesystem.write.mock.calls[0][1];
          expect(config.compilerOptions.module).toBe('ES2015');
        });
      });
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        await toolbox.setupTs(input).asyncOperations();
      });

      describe('when the framework is not Nest', () => {
        beforeAll(() => {
          input.framework = 'express';
        });

        it('should print a muted and a success message', () => {
          expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
          expect(toolbox.print.success).toHaveBeenCalledTimes(1);
          expect(toolbox.print.error).not.toHaveBeenCalled();
        });

        it('should copy the tsconfig file', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/tsconfig.build.json`,
            `${input.appDir}/tsconfig.build.json`
          );
        });
      });

      describe('when the framework is Nest', () => {
        beforeAll(() => {
          input.framework = 'nest';
        });

        it('should not a muted nor a success message', () => {
          expect(toolbox.print.muted).not.toHaveBeenCalled();
          expect(toolbox.print.success).not.toHaveBeenCalled();
          expect(toolbox.print.error).not.toHaveBeenCalled();
        });

        it('should not copy anything', () => {
          expect(toolbox.filesystem.copyAsync).not.toHaveBeenCalled();
        });
      });

      describe('when an error is thrown', () => {
        const error = new Error('the-error');

        beforeAll(() => {
          input.framework = 'express';
        });

        beforeEach(() => {
          toolbox.filesystem.copyAsync = jest.fn(() => {
            throw error;
          });
        });

        it('should rethrow the error with an added user-friendly message', () => {
          expect(toolbox.setupTs(input).asyncOperations()).rejects.toThrow(
            `An error has occurred while executing TS configuration: ${error}`
          );
        });
      });
    });
  });
});
