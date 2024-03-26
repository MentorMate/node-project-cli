import request from 'supertest';
import {
  create as createApp,
  expectError,
  InvalidCredentials,
  UnprocessableEntity,
} from '../utils';
import { Knex } from 'knex';

describe('POST /auth/login', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let dbClient: Knex;

  beforeAll(() => {
    const { app: _app, destroy: _destroy, dbClient: _dbClient } = createApp();
    app = _app;
    destroy = _destroy;
    dbClient = _dbClient
  });

  afterAll(async () => {
    await destroy();
  });

  beforeEach(async () => {
    await dbClient.migrate.rollback();
    await dbClient.migrate.latest();
    await dbClient.seed.run();
  });

  describe('given the email and password are valid', () => {
    it('should login the user and return a jwt token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'hello@email.com', password: 'pass@ord' })
        .expect(200);
      expect(typeof res.body.idToken).toBe('string');
    });

    describe('when there are empty credentials', () => {
      it('should return 422', async () => {
        await request(app)
          .post('/auth/login')
          .send({})
          .expect('content-type', /json/)
          .expect(expectError(UnprocessableEntity));
      });
    });

    describe('when the email does not exist in db', () => {
      it('should return 422', async () => {
        await request(app)
          .post('/auth/login')
          .send({ email: 'fake@email.com', password: 'pass@ord' })
          .expect('content-type', /json/)
          .expect(expectError(InvalidCredentials));
      });
    });
  });

  describe('when the password does not match in db', () => {
    it('should return 422', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: 'hello@email.com', password: 'wrong password' })
        .expect('content-type', /json/)
        .expect(expectError(InvalidCredentials));
    });
  });
});
