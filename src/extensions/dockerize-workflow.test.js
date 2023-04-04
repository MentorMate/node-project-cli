const extend = require('./dockerize-workflow');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('dockerize-workflow', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set dockerizeWorkflow on toolbox', () => {
    expect(toolbox.dockerizeWorkflow).toBeDefined();
  });

  describe('dockerizeWorkflow', () => {
    let input;
    let ops;

    beforeAll(() => {
      input = createExtensionInput();
    });

    beforeEach(() => {
      ops = toolbox.setupHusky(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let scripts;

      beforeEach(() => {
        toolbox.dockerizeWorkflow(input).syncOperations();
        scripts = input.pkgJson.scripts;
      });

      it('should add a image:build script', () => {
        expect(scripts['image:build']).toMatch(/docker build/);
      });

      it('should add a image:run script', () => {
        expect(scripts['image:run']).toMatch(/docker run/);
      });
    });

    describe('asyncOperations', () => {
      beforeEach(async () => {
        toolbox.print.muted = jest.fn(() => {});
        toolbox.print.success = jest.fn(() => {});
        toolbox.print.error = jest.fn(() => {});
        toolbox.filesystem.copyAsync = jest.fn(() => {});
        toolbox.patching.replace = jest.fn(() => {});
        toolbox.system.run = jest.fn(() => {});
        await toolbox.dockerizeWorkflow(input).asyncOperations();
      });

      it('should print a muted and a success message', () => {
        expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
        expect(toolbox.print.success).toHaveBeenCalledTimes(1);
        expect(toolbox.print.error).not.toHaveBeenCalled();
      });

      it('should copy Dockerfile', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/Dockerfile`,
          `${input.appDir}/Dockerfile`
        );
      });

      it('should copy .dockerignore', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/.dockerignore`,
          `${input.appDir}/.dockerignore`
        );
      });

      describe('when the language is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS';
        });

        it('should update the start command in Dockefile to use the built index', () => {
          expect(toolbox.patching.replace).toHaveBeenCalledWith(
            `${input.appDir}/Dockerfile`,
            './src/index.js',
            './dist/index.js'
          );
        });
      });

      describe('when the framework is Nest', () => {
        beforeAll(() => {
          input.framework = 'nest';
        });

        it('should update the entry point script in Dockefile', () => {
          expect(toolbox.patching.replace).toHaveBeenCalledWith(
            `${input.appDir}/Dockerfile`,
            '/index.js',
            '/main.js'
          );
        });
      });

      describe('when an error is thrown', () => {
        const error = new Error('the-error');

        beforeEach(() => {
          toolbox.patching.replace = jest.fn(() => {
            throw error;
          });
        });

        it('should rethrow the error with an added user-friendly message', () => {
          expect(
            toolbox.dockerizeWorkflow(input).asyncOperations()
          ).rejects.toThrow(
            `An error has occurred while creating a dockerize workflow step: ${error}`
          );
        });
      });
    });
  });
});
