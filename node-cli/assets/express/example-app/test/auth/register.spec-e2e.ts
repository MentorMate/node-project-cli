import request from 'supertest';
import {
  create as createApp,
  expectError,
  UnprocessableEntity,
  UserConflict,
} from '../utils';
import { create } from '@database';
import { Knex } from 'knex';

describe('POST /auth/register', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let dbClient: Knex;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
    dbClient = create();
  });

  afterAll(async () => {
    await destroy();
  });

  beforeEach(async () => {
    await dbClient.migrate.rollback();
    await dbClient.migrate.latest();
    await dbClient.seed.run();
  });

  it('should create a new user and return a jwt token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'email@email.com', password: 'pass@ord' })
      .expect('content-type', /json/)
      .expect(200);
    expect(typeof res.body.idToken).toBe('string');
  });

  it('should return 409 error when there is an existing user', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'hello@email.com', password: 'pass@ord' })
      .expect('content-type', /json/)
      .expect(expectError(UserConflict));
  });

  it('should return 422 error when there is invalid payload', async () => {
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
