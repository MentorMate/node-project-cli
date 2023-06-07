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
      devDependencies = input.pkgJson.devDependencies;
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

      it('should add class-transformer to dependencies', () => {
        expect(dependencies).toHaveProperty('class-transformer');
      });

      it('should add class-validator to dependencies', () => {
        expect(dependencies).toHaveProperty('class-validator');
      });

      it('should add @nestjs/swagger to devDependencies', () => {
        expect(devDependencies).toHaveProperty('@nestjs/swagger');
      });

      it('should add "openapi:g" to scripts', () => {
        expect(scripts).toHaveProperty('openapi:g');
      });

      it('should copy the example app project source', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/src/`,
          `${input.appDir}/src/`
        );
      });

      it('should copy the openapi-generate script', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/scripts/generate-openapi.ts`,
          `${input.appDir}/scripts/generate-openapi.ts`
        );
      });

      it('should copy the .openapi dir', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/.openapi/gitignorefile`,
          `${input.appDir}/.openapi/.gitignore`
        );
      });

      it('should copy the docker-compose config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/docker-compose.yml`,
          `${input.appDir}/docker-compose.yml`
        );
      });

      it('should copy the docker-compose override config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/docker-compose.override.example.yml`,
          `${input.appDir}/docker-compose.override.example.yml`
        );
      });

      it('should copy the database migrations', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/migrations`,
          `${input.appDir}/migrations`
        );
      });

      it('should copy the ts config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app/tsconfig.json`,
          `${input.appDir}/tsconfig.json`,
          { overwrite: true }
        );
      });

      it('should add the Knex env var section', () => {
        expect(envVars).toHaveProperty('HTTP');
        expect(envVars['HTTP']).toHaveProperty('PORT');
      });

      it('should add knex to dependencies', () => {
        expect(dependencies).toHaveProperty('knex');
      });

      it('should add pg-error-enum to dependencies', () => {
        expect(dependencies).toHaveProperty('pg-error-enum');
      });

      it('shoudl add knex migration scripts', () => {
        expect(Object.keys(scripts)).toEqual(
          expect.arrayContaining([
            'db:connection:print',
            'db:migrate:make',
            'db:migrate:up',
            'db:migrate:down',
            'db:migrate:latest',
            'db:migrate:rollback',
            'db:migrate:version',
            'db:migrate:status',
            'db:migrate:reset',
          ])
        );
      });

      it('should copy the pg scripts', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/db/pg/scripts`,
          `${input.appDir}/scripts`,
          { overwrite: true }
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
