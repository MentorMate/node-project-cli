import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  createTodo,
  getRandomNumber,
  registerUser,
} from '../utils';
import { JwtTokens } from '@common/data/auth';
import { Todo } from '@modules/database';

describe('GET /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;
  let todo: Todo;

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
    todo = res.body;
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    describe('given todo id in the query', () => {
      it('should return the todo', async () => {
        const res = await request(app)
          .get(`/v1/todos/${todo.id}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.id).toEqual(todo.id);
        expect(res.body.name).toEqual(todo.name);
        expect(res.body.note).toEqual(todo.note);
        expect(res.body.completed).toEqual(todo.completed);
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        const res = await request(app)
          .get(`/v1/todos/${getRandomNumber()}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(404);
        expect(res.body.message).toEqual('To-Do not found');
      });
    });

    describe('given a text id in the query', () => {
      it('should return 422 error', async () => {
        const res = await request(app)
          .get(`/v1/todos/test`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Bad Data');
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      const res = await request(app)
        .get(`/v1/todos/${todo.id}`)
        .set('Accept', 'application/json');

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('No authorization token was found');
    });
  });
});
