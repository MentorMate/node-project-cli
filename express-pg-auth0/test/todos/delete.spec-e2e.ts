import { mockAxios } from '../utils/mock-axios';
mockAxios();

const authMock = jest.fn();

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: jest.fn(() => authMock),
}));

import request from 'supertest';
import {
  create as createApp,
  expectError,
  Unauthorized,
  TodoNotFound,
} from '../utils';
import { Knex } from 'knex';
import createError from 'http-errors';

describe('DELETE /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  const jwtTokens = {
    idToken: 'token',
  };
  let dbClient: Knex;

  beforeAll(() => {
    const { app: _app, destroy: _destroy, dbClient: _dbClient } = createApp();
    app = _app;
    destroy = _destroy;
    dbClient = _dbClient;
  });

  beforeEach(async () => {
    await dbClient.migrate.rollback();
    await dbClient.migrate.latest();
    await dbClient.seed.run();

    authMock.mockImplementation(
      (req: { auth: { payload: { sub: string } } }, res, next: () => true) => {
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

  it('should return 204 when todo is deleted', async () => {
    const todo = await dbClient('todos').first();
    if (!todo) {
      throw new Error('Todo not found');
    }

    await request(app)
      .delete(`/v1/todos/${todo.id}`)
      .set('Authorization', 'Bearer ' + jwtTokens.idToken)
      .set('Content-Type', 'application/json')
      .expect(204);
  });

  it('should return 404 when given not existing todo id', async () => {
    await request(app)
      .delete(`/v1/todos/${Date.now()}`)
      .set('Authorization', 'Bearer ' + jwtTokens.idToken)
      .set('Content-Type', 'application/json')
      .expect(expectError(TodoNotFound));
  });

  it('should return 401 error when user is not authenticated', async () => {
    authMock.mockImplementation((request, response, next) => {
      next(createError(401, 'No authorization token was found'));
    });

    await request(app)
      .delete(`/v1/todos/tz4a98xxat96iws9zmbrgj3a`)
      .set('Content-Type', 'application/json')
      .expect(expectError(Unauthorized));
  });
});
