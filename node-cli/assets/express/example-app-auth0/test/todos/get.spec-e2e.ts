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
  TodoNotFound,
  Unauthorized,
} from '../utils';
import { Knex } from 'knex';
import { create } from '@database';
import createError from 'http-errors';

describe('GET /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let dbClient: Knex;
  const jwtTokens = {
    idToken: 'token',
  };

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

  describe('when user is authenticated', () => {
    describe('given todo id in the query', () => {
      it('should return the todo', async () => {
        const todo = await dbClient('todos').first();
        if (!todo) {
          throw new Error('Todo not found');
        }

        const res = await request(app)
          .get(`/v1/todos/${todo.id}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.id).toEqual(todo.id);
        expect(res.body.name).toEqual(todo.name);
        expect(res.body.note).toEqual(todo.note);
        expect(res.body.completed).toEqual(todo.completed);
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        await request(app)
          .get(`/v1/todos/${Date.now()}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(expectError(TodoNotFound));
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      authMock.mockImplementation((request, response, next) => {
        next(createError(401, 'No authorization token was found'));
      });

      await request(app)
        .get('/v1/todos/tz4a98xxat96iws9zmbrgj3a')
        .expect(expectError(Unauthorized));
    });
  });
});
