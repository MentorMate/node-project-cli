import '@extensions/zod/register';
import '@extensions/knex/register';

import {
  create as createApp,
  getUserCredentials,
  registerUser,
} from '../utils';

describe('POST /auth/register', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  afterAll(async () => {
    await destroy();
  });

  describe('given the email and password are valid', () => {
    const credentials = getUserCredentials();

    it('should create a new user and return a jwt token', async () => {
      const res = await registerUser(app, credentials);

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(200);
      expect(typeof res.body.idToken).toBe('string');
    });

    describe('when there is an existing user', () => {
      it('should return 409 error', async () => {
        const res = await registerUser(app, credentials);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(409);
        expect(res.body.message).toEqual('User email already taken');
      });
    });
  });

  describe('when there is invalid payload', () => {
    it('should return 422 error', async () => {
      const res = await registerUser(app, {
        email: 'test',
        password: 'test',
      });

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(422);
      expect(res.body.message).toEqual('Bad Data');
    });
  });
});
