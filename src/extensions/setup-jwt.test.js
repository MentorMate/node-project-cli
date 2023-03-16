const extend = require('./setup-jwt');
const {
  createToolboxMock,
  createExtensionInput,
} = require('../utils/test/mocks');

describe('setup-jwt', () => {
  let toolbox;

  beforeEach(() => {
    toolbox = createToolboxMock();
    extend(toolbox);
  });

  it('should be defined', () => {
    expect(extend).toBeDefined();
  });

  it('should set setupJwt on toolbox', () => {
    expect(toolbox.setupJwt).toBeDefined();
  });

  describe('setupJwt', () => {
    let input;
    let ops;

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
      let envVars;
      let dependencies;
      let devDependencies;

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
        expect(envVars['Jwt']).toEqual({
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
