import { mockAxios } from '../utils/mock-axios';
mockAxios()

const authMock = jest.fn();

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => authMock),
}));

import request from 'supertest';
import {
  create as createApp,
  expectError,
  getTodoPayload,
  Unauthorized,
  UnprocessableEntity
} from '../utils';
import { Knex } from 'knex';
import { create } from '@database';
import createError from 'http-errors';

describe('POST /v1/todos', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  const jwtTokens = {
    idToken: 'token',
  };
  let dbClient: Knex;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
    dbClient = create();
  });

  beforeEach(async () => {
    await dbClient.migrate.rollback();
    await dbClient.migrate.latest();
    await dbClient.seed.run();

    authMock.mockImplementation(
      (
        req: { auth: { payload: { sub: string } } },
        res,
        next: () => true
      ) => {
        req.auth = {
          payload: {
            sub: 'tz4a98xxat96iws9zmbrgj3a',
          },
        };
        return next();
      }
    );
  });

  afterAll(async () => {
    await destroy();
  });

  it('should return the created todo', async () => {
    const todoPayload = getTodoPayload();

    const res = await request(app)
      .post('/v1/todos')
      .set('Authorization', 'Bearer ' + jwtTokens.idToken)
      .set('Content-Type', 'application/json')
      .send(todoPayload)

    expect(res.body.name).toEqual(todoPayload.name);
    expect(res.body.note).toEqual(todoPayload.note);
    expect(res.body.completed).toEqual(todoPayload.completed);
  });

  it('given an empty payload, should return 422 error', async () => {
    await request(app)
      .post('/v1/todos')
      .set('Authorization', 'Bearer ' + jwtTokens.idToken)
      .set('Content-Type', 'application/json')
      .send({})
      .expect(expectError(UnprocessableEntity));
  });

  it('should return 401 error when the user is not authenticated', async () => {
    authMock.mockImplementation((request, response, next) => {
      next(createError(401, 'No authorization token was found'))
    });

    await request(app)
      .post('/v1/todos')
      .set('Content-Type', 'application/json')
      .send(getTodoPayload())
      .expect(expectError(Unauthorized));
  });
});
