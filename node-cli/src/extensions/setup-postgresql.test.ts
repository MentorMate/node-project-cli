import extend from './setup-postgresql';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import {
  MockToolbox,
  Operations,
  ProjectEnvVars,
  SampleExtensionInput,
} from '../utils/test/types';

describe('setup-postgresql', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupPostgreSQL on toolbox', () => {
    expect(toolbox.setupPostgreSQL).toBeDefined();
  });

  describe('setupPostgreSQL', () => {
    let input: SampleExtensionInput;
    let ops: Operations;

    beforeAll(() => {
      input = createExtensionInput();
    });

    beforeEach(() => {
      ops = toolbox.setupPostgreSQL(input);
    });

    it('should return syncOperations and asyncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
      expect(ops.asyncOperations).toBeDefined();
    });

    describe('syncOperations', () => {
      let envVars: ProjectEnvVars;
      let dependencies: Record<string, string>;
      let devDependencies: Record<string, string>;

      beforeAll(() => {
        input.features = [];
      });

      beforeEach(() => {
        ops.syncOperations();
        envVars = input.envVars;
        dependencies = input.pkgJson.dependencies;
        devDependencies = input.pkgJson.devDependencies;
      });

      it('should add the postgres env vars', () => {
        expect(envVars['PostgreSQL']).toEqual({
          PGHOST: 'localhost',
          PGPORT: 5432,
          PGUSER: 'user',
          PGPASSWORD: 'password',
          PGDATABASE: 'default',
        });
      });

      it('should add the pg dependency', () => {
        expect(dependencies).toHaveProperty('pg');
      });

      it('should add the @types/pg dev dependency', () => {
        expect(devDependencies).toHaveProperty('@types/pg');
      });
    });

    describe('asyncOperations', () => {
      let assetsPath: string;
      let appDir: string;

      beforeAll(() => {
        assetsPath = input.assetsPath;
        appDir = input.appDir;
      });

      beforeEach(() => {
        toolbox.filesystem.copyAsync = jest.fn(() => {});
      });

      beforeEach(async () => {
        await toolbox.setupPostgreSQL(input).asyncOperations();
      });

      it('should copy the docker-compose.yml file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${assetsPath}/db/pg/docker-compose.yml`,
          `${appDir}/docker-compose.yml`,
        );
      });

      it('should copy the docker-compose.override.yml file', () => {
        expect(toolbox.filesystem.copyAsync).toHaveBeenCalledWith(
          `${assetsPath}/db/pg/docker-compose.override.example.yml`,
          `${appDir}/docker-compose.override.example.yml`,
        );
      });
    });
  });
});
