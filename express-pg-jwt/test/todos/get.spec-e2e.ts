import request from 'supertest';
import {
  create as createApp,
  expectError,
  TodoNotFound,
  Unauthorized,
  UnprocessableEntity,
} from '../utils';
import { JwtTokens } from '@api/auth';
import { Todo } from '@api/todos';
import { Knex } from 'knex';
import { create } from '@database';

describe('GET /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;
  let dbClient: Knex;
  const todo: Partial<Todo> = {
    id: 1,
    name: 'Laundry 1',
    note: 'Buy detergent 1',
    completed: false,
    userId: 'tz4a98xxat96iws9zmbrgj3a',
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

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'hello@email.com', password: 'pass@ord' });

    jwtTokens = res.body;
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

    describe('given a text id in the query', () => {
      it('should return 422 error', async () => {
        await request(app)
          .get(`/v1/todos/test`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(expectError(UnprocessableEntity));
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await request(app)
        .get(`/v1/todos/${todo.id}`)
        .expect(expectError(Unauthorized));
    });
  });
});
