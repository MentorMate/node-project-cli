import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  expectError,
  getUserCredentials,
  UnprocessableEntity,
  UserConflict,
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
    it('should create a new user and return a jwt token', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(getUserCredentials())
        .expect('content-type', /json/)
        .expect(200);
      expect(typeof res.body.idToken).toBe('string');
    });

    describe('when there is an existing user', () => {
      it('should return 409 error', async () => {
        const credentials = getUserCredentials();

        await registerUser(app, credentials);

        await request(app)
          .post('/auth/register')
          .send(credentials)
          .expect('content-type', /json/)
          .expect(expectError(UserConflict));
      });
    });
  });

  describe('when there is invalid payload', () => {
    it('should return 422 error', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'test',
          password: 'test',
        })
        .expect('content-type', /json/)
        .expect(expectError(UnprocessableEntity));
    });
  });
});
