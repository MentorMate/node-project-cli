import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  createTodo,
  expectError,
  registerUser,
  Unauthorized,
  TodoNotFound,
} from '../utils';
import { JwtTokens } from '@common/data/auth';

describe('DELETE /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;
  let todoId: number;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  beforeAll(async () => {
    const res = await registerUser(app);
    jwtTokens = res.body;
  });

  beforeAll(async () => {
    const res = await createTodo(app, jwtTokens.idToken);
    todoId = res.body.id;
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    describe('given todo id in the query', () => {
      it('should return 204 when todo is deleted', () => {
        return request(app)
          .delete(`/v1/todos/${todoId}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(204);
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        return request(app)
          .delete(`/v1/todos/${Date.now()}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect('content-type', /json/)
          .expect(expectError(TodoNotFound));
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', () => {
      return request(app)
        .delete(`/v1/todos/${todoId}`)
        .expect('content-type', /json/)
        .expect(expectError(Unauthorized));
    });
  });
});
