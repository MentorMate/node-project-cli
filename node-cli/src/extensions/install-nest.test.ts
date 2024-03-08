import extend from './install-nest';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import { MockToolbox, ProjectEnvVars } from '../utils/test/types';
import { Database, Framework, ProjectLanguage } from '../@types';

describe('install-nest', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set installNest on toolbox', () => {
    expect(toolbox.installNest).toBeDefined();
  });

  describe('installNest', () => {
    const input = createExtensionInput();
    let envVars: ProjectEnvVars;
    let scripts: Record<string, string>;
    let dependencies: Record<string, string>;

    beforeAll(() => {
      input.projectLanguage = ProjectLanguage.TS;
      input.framework = Framework.NEST;
      input.db = Database.POSTGRESQL;
    });

    beforeEach(async () => {
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
        `cd /path/to/project-name && cd ../ && npx @nestjs/cli@9.4.2 new project-name --directory project-name --strict --skip-git --skip-install --package-manager npm`,
      );
    });

    it('should remove the src/ dir', () => {
      expect(toolbox.filesystem.removeAsync).toHaveBeenCalledWith(
        `${input.appDir}/src/`,
      );
    });

    it('should remove the test/ dir', () => {
      expect(toolbox.filesystem.removeAsync).toHaveBeenCalledWith(
        `${input.appDir}/test/`,
      );
    });

    it('should copy the project source', () => {
      expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
        `${input.assetsPath}/nest/ts/src/`,
        `${input.appDir}/src/`,
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
        expect.stringContaining('-r dotenv/config'),
      );
    });

    it('should update the start:dev script', () => {
      expect(scripts['start:dev']).toEqual(
        expect.stringContaining('-r dotenv/config'),
      );
    });

    it('should update the start:debug script', () => {
      expect(scripts['start:debug']).toEqual(
        expect.stringContaining('-r dotenv/config'),
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
          `${input.assetsPath}/nest/example-app-pg/src/`,
          `${input.appDir}/src/`,
        );
      });

      it('should add class-transformer to dependencies', () => {
        expect(dependencies).toHaveProperty('class-transformer');
      });

      it('should add class-validator to dependencies', () => {
        expect(dependencies).toHaveProperty('class-validator');
      });

      it('should add @nestjs/swagger to dependencies', () => {
        expect(dependencies).toHaveProperty('@nestjs/swagger');
      });

      it('should copy the example app project source', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app-pg/src/`,
          `${input.appDir}/src/`,
        );
      });

      it('should copy the docker-compose config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app-pg/docker-compose.yml`,
          `${input.appDir}/docker-compose.yml`,
        );
      });

      it('should copy the docker-compose override config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app-pg/docker-compose.override.example.yml`,
          `${input.appDir}/docker-compose.override.example.yml`,
        );
      });

      it('should copy the database migrations', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app-pg/migrations`,
          `${input.appDir}/migrations`,
        );
      });

      it('should copy the ts config', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/nest/example-app-pg/tsconfig.json`,
          `${input.appDir}/tsconfig.json`,
          { overwrite: true },
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
            'db:migrate:make',
            'db:migrate:up',
            'db:migrate:down',
            'db:migrate:latest',
            'db:migrate:rollback',
            'db:migrate:version',
            'db:migrate:status',
            'db:migrate:reset',
          ]),
        );
      });

      it('should copy the pg scripts', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${input.assetsPath}/db/pg/scripts`,
          `${input.appDir}/scripts`,
          { overwrite: true },
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
          `An error has occurred while installing Nest: ${error}`,
        );
      });
    });
  });
});
