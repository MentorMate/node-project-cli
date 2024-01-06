import { validateJwt } from './validate-jwt.middleware';

describe('validateAccessToken', () => {
  it('should return an instance of the express-jwt middleware', () => {
    const middleware = validateJwt('my-secret');

    expect(middleware.name).toBe('middleware');
    expect(middleware.unless).toBeDefined();
  });
});
