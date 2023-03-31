import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  expectError,
  getUserCredentials,
  UnprocessableEntity,
  UserConflict,
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

    it('should create a new user and return a jwt token', () => {
      return request(app)
        .post('/auth/register')
        .send(credentials)
        .expect('content-type', /json/)
        .expect(200)
        .then((res) => {
          expect(typeof res.body.idToken).toBe('string');
        });
    });

    describe('when there is an existing user', () => {
      it('should return 409 error', () => {
        return request(app)
          .post('/auth/register')
          .send(credentials)
          .expect('content-type', /json/)
          .expect(expectError(UserConflict));
      });
    });
  });

  describe('when there is invalid payload', () => {
    it('should return 422 error', () => {
      return request(app)
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