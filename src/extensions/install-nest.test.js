const extend = require('./install-nest');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('install-nest', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installNest on toolbox', () => {
    expect(toolbox.installNest).toBeDefined();
  });

  describe('installNest', () => {
    const input = createExtensionInput();
    let envVars;
    let scripts;
    let dependencies;
    let devDependencies;

    beforeAll(() => {
      input.framework = 'nest';
    });

    beforeEach(async () => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      await toolbox.installNest(input);
      envVars = input.envVars;
      scripts = input.pkgJson.scripts;
      dependencies = input.pkgJson.dependencies;
      devDependencies = input.pkgJson.devDependencies;
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });

    describe('when the nest is installed', () => {
      it('should init a new project', () => {
        expect(toolbox.system.run).toHaveBeenCalledWith(
          `npx @nestjs/cli@9.4.2 new ${input.projectName} --directory ${input.projectName} --skip-git --skip-install --package-manager npm`
        );
      });

      it('should copy and overwrite the project main file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/src/main.ts`,
          `${input.appDir}/src/main.ts`,
          { overwrite: true }
        );
      });

      it('should copy and overwrite the app module', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/src/app.module.ts`,
          `${input.appDir}/src/app.module.ts`,
          { overwrite: true }
        );
      });

      it('should add the HTTP env var section', () => {
        expect(envVars).toHaveProperty('HTTP');
        expect(envVars['HTTP']).toHaveProperty('PORT');
      });

      it('should add helmet to dependencies', () => {
        expect(dependencies).toHaveProperty('helmet');
      });

      it('should add compression to dependencies', () => {
        expect(dependencies).toHaveProperty('compression');
      });

      it('should add @nestjs/config to dependencies', () => {
        expect(dependencies).toHaveProperty('@nestjs/config');
      });

      it('should add @types/compression to devDependencies', () => {
        expect(devDependencies).toHaveProperty('@types/compression');
      });

      it('should update the start script', () => {
        expect(scripts['start']).toEqual(
          expect.stringContaining('-r dotenv/config')
        );
      });

      it('should update the start:dev script', () => {
        expect(scripts['start:dev']).toEqual(
          expect.stringContaining('-r dotenv/config')
        );
      });

      it('should update the start:debug script', () => {
        expect(scripts['start:debug']).toEqual(
          expect.stringContaining('-r dotenv/config')
        );
      });
    });

    describe('when an error is thrown', () => {
      const error = new Error('the-error');

      beforeEach(() => {
        toolbox.system.run = jest.fn(() => {
          throw error;
        });
      });

      it('should rethrow the error with an added user-friendly message', () => {
        expect(toolbox.installNest(input)).rejects.toThrow(
          `An error has occurred while installing Nest: ${error}`
        );
      });
    });
  });
});
