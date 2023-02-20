const extend = require('./install-framework');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('install-framework', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installFramework on toolbox', () => {
    expect(toolbox.installFramework).toBeDefined();
  });

  describe('installFramework', () => {
    const input = createExtensionInput();
    let scripts;
    let dependencies;
    let devDependencies;

    beforeAll(() => {
      input.framework = 'fastify'; // else-branch coverage
      input.projectLanguage = 'JS';
    });

    beforeEach(() => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      toolbox.filesystem.dir = jest.fn(() => {});
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.installFramework(input);
      scripts = input.pkgJson.scripts;
      dependencies = input.pkgJson.dependencies;
      devDependencies = input.pkgJson.devDependencies;
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });

    it('should install add the framework to dependencies', () => {
      expect(dependencies).toHaveProperty(input.framework);
    });

    it('should install add dotenv to devDependencies', () => {
      expect(devDependencies).toHaveProperty('dotenv');
    });

    it('should copy the .env.example file', () => {
      expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
        `${input.assetsPath}/dotenv/.env.example`,
        `${input.appDir}/.env.example`
      );
    });

    describe('when the language is TypeScript', () => {
      beforeAll(() => {
        input.projectLanguage = 'TS';
      });

      it('should add the start script', () => {
        expect(scripts).toHaveProperty('start');
      });

      it('should copy the example project source', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/src/`,
          `${input.appDir}/src/`
        );
      });

      it('should copy the example project tests', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/test/`,
          `${input.appDir}/test/`
        );
      });
    });

    describe('when the framework is express', () => {
      beforeAll(() => {
        input.projectLanguage = 'JS'; // else-branch coverage
        input.framework = 'express';
      });

      it('should add helmet to dependencies', () => {
        expect(dependencies).toHaveProperty('helmet');
      });

      it('should add cors to dependencies', () => {
        expect(dependencies).toHaveProperty('cors');
      });

      it('should add compression to dependencies', () => {
        expect(dependencies).toHaveProperty('compression');
      });

      describe('and the language is TypeScript', () => {
        beforeAll(() => {
          input.projectLanguage = 'TS';
        });

        it('should copy the example express project source', () => {
          expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
            `${input.assetsPath}/express/src/`,
            `${input.appDir}/src/`,
            { overwrite: true }
          );
        });

        it('should add @types/express to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/express');
        });

        it('should add @types/cors to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/cors');
        });

        it('should add @types/compression to devDependencies', () => {
          expect(devDependencies).toHaveProperty('@types/compression');
        });
      });
    });
  });
});
