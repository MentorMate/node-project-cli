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

    beforeAll(() => {
      input.projectLanguage = 'TS';
      input.framework = 'nest';
    });

    beforeEach(async () => {
      toolbox.print.muted = jest.fn(() => {});
      toolbox.print.success = jest.fn(() => {});
      toolbox.print.error = jest.fn(() => {});
      toolbox.system.run = jest.fn(() => {});
      toolbox.filesystem.copyAsync = jest.fn(() => {});
      toolbox.filesystem.removeAsync = jest.fn(() => {});
      await toolbox.installNest(input);
      envVars = input.envVars;
      scripts = input.pkgJson.scripts;
      dependencies = input.pkgJson.dependencies;
    });

    it('should print a muted and a success message', async () => {
      expect(toolbox.print.muted).toHaveBeenCalledTimes(1);
      expect(toolbox.print.success).toHaveBeenCalledTimes(1);
      expect(toolbox.print.error).not.toHaveBeenCalled();
    });

    it('should init a new project', () => {
      expect(toolbox.system.run).toHaveBeenCalledWith(
        `npx @nestjs/cli@9.4.2 new ${input.projectName} --directory ${input.projectName} --strict --skip-git --skip-install --package-manager npm`
      );
    });

    it('should remove the src/ dir', () => {
      expect(toolbox.filesystem.removeAsync).toHaveBeenCalledWith(
        `${input.appDir}/src/`
      );
    });

    it('should remove the test/ dir', () => {
      expect(toolbox.filesystem.removeAsync).toHaveBeenCalledWith(
        `${input.appDir}/test/`
      );
    });

    it('should copy the project source', () => {
      expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
        `${input.assetsPath}/nest/ts/src/`,
        `${input.appDir}/src/`
      );
    });

    describe('when it is the example app', () => {
      beforeAll(() => {
        input.isExampleApp = true;
      });

      afterAll(() => {
        input.isExampleApp = false;
      });

      it('should copy the example app project source', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/src/`,
          `${input.appDir}/src/`
        );
      });
    });

    it('should add the HTTP env var section', () => {
      expect(envVars).toHaveProperty('HTTP');
      expect(envVars['HTTP']).toHaveProperty('PORT');
    });

    it('should add @nestjs/platform-fastify to dependencies', () => {
      expect(dependencies).toHaveProperty('@nestjs/platform-fastify');
    });

    it('should add helmet to dependencies', () => {
      expect(dependencies).toHaveProperty('@fastify/helmet');
    });

    it('should add @fastify/compress to dependencies', () => {
      expect(dependencies).toHaveProperty('@fastify/compress');
    });

    it('should add @nestjs/config to dependencies', () => {
      expect(dependencies).toHaveProperty('@nestjs/config');
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
