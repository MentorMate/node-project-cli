import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  getUserCredentials,
  registerUser,
} from '../utils';

describe('POST /auth/login', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  const credentials = getUserCredentials();

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  beforeAll(async () => {
    await registerUser(app, credentials);
  });

  afterAll(async () => {
    await destroy();
  });

  describe('given the email and password are valid', () => {
    it('should login the user and return a jwt token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send(credentials);

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(200);
      expect(typeof res.body.idToken).toBe('string');
    });

    describe('when there are empty credentials', () => {
      it('should return 422', async () => {
        const res = await request(app)
          .post('/auth/login')
          .set('Accept', 'application/json')
          .send({});

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Bad Data');
      });
    });

    describe('when the email does not exist in db', () => {
      it('should return 422', async () => {
        const newCredentials = getUserCredentials();
        const res = await request(app)
          .post('/auth/login')
          .set('Accept', 'application/json')
          .send(newCredentials);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Invalid email or password');
      });
    });

    describe('when the password does not match in db', () => {
      it('should return 422', async () => {
        const res = await request(app)
          .post('/auth/login')
          .set('Accept', 'application/json')
          .send({ email: credentials.email, password: 'wrong password' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Invalid email or password');
      });
    });
  });

  describe('when the password does not match in db', () => {
    it('should return 422', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ email: credentials.email, password: 'wrong password' });

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(422);
      expect(res.body.message).toEqual('Invalid email or password');
    });
  });
});
