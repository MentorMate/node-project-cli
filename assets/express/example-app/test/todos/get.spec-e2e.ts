import request from 'supertest';
import {
  create as createApp,
  createTodo,
  expectError,
  registerUser,
  TodoNotFound,
  Unauthorized,
  UnprocessableEntity,
} from '../utils';
import { JwtTokens } from '@api/auth';
import { Todo } from '@api/todos';

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
    jwtTokens = await registerUser(app);
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
          .expect('content-type', /json/)
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
          .expect('content-type', /json/)
          .expect(expectError(TodoNotFound));
      });
    });

    describe('given a text id in the query', () => {
      it('should return 422 error', async () => {
        await request(app)
          .get(`/v1/todos/test`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect('content-type', /json/)
          .expect(expectError(UnprocessableEntity));
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await request(app)
        .get(`/v1/todos/${todo.id}`)
        .expect('content-type', /json/)
        .expect(expectError(Unauthorized));
    });
  });
});
