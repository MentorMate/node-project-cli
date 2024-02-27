import extend from './setup-jwt';
import { createToolboxMock, createExtensionInput } from '../utils/test/mocks';
import {
  MockToolbox,
  Operations,
  ProjectEnvVars,
  SampleExtensionInput,
} from '../utils/test/types';

describe('setup-jwt', () => {
  let toolbox: MockToolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox as any);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupJwt on toolbox', () => {
    expect(toolbox.setupJwt).toBeDefined();
  });

  describe('setupJwt', () => {
    let input: SampleExtensionInput;
    let ops: Operations;

    beforeAll(() => {
      input = createExtensionInput();
    });

    beforeEach(() => {
      ops = toolbox.setupJwt(input);
    });

    it('should return syncOperations when the extension is called', () => {
      expect(ops.syncOperations).toBeDefined();
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

      it('should add the jwt env vars', () => {
        expect(envVars['JWT']).toEqual({
          JWT_SECRET: 'super-secret',
          JWT_EXPIRATION: 7200,
        });
      });

      it('should add the jsonwebtoken dependency', () => {
        expect(dependencies).toHaveProperty('jsonwebtoken');
      });

      it('should add the @types/jsonwebtoken dev dependency', () => {
        expect(devDependencies).toHaveProperty('@types/jsonwebtoken');
      });

      it('should add the express-jwt dependency', () => {
        expect(dependencies).toHaveProperty('express-jwt');
      });
    });
  });
});
