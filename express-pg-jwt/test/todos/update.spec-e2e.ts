import request from 'supertest';
import {
  create as createApp,
  expectError,
  getTodoPayload,
  TodoNotFound,
  Unauthorized,
  UnprocessableEntity,
} from '../utils';
import { JwtTokens } from '@api/auth';
import { Knex } from 'knex';
import { create } from '@database';

describe('POST /v1/todos/:id', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;
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

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'hello@email.com', password: 'pass@ord' });

    jwtTokens = res.body;
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    describe('given the todo payload and id in the query', () => {
      it('should return the updated todo', async () => {
        const todo = await dbClient('todos').first();
        if (!todo) {
          throw new Error('Todo not found');
        }

        const todoPayload = getTodoPayload();

        const res = await request(app)
          .patch(`/v1/todos/${todo.id}`)
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .send(todoPayload)
          .expect(200);

        expect(res.body.name).toEqual(todoPayload.name);
        expect(res.body.note).toEqual(todoPayload.note);
        expect(res.body.completed).toEqual(todoPayload.completed);
      });
    });

    describe('given an empty payload and id in the query', () => {
      it('should return the not updated todo', async () => {
        const todo = await dbClient('todos').first();
        if (!todo) {
          throw new Error('Todo not found');
        }

        const res = await request(app)
          .patch(`/v1/todos/${todo.id}`)
          .send({})
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(res.status).toEqual(200);
        expect(res.body.id).toEqual(todo.id);
        expect(res.body.name).toEqual(todo.name);
        expect(res.body.note).toEqual(todo.note);
        expect(res.body.completed).toEqual(todo.completed);
        expect(res.body.userId).toEqual(todo.userId);
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        await request(app)
          .patch(`/v1/todos/${Date.now()}`)
          .send(getTodoPayload())
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect('content-type', /json/)
          .expect(expectError(TodoNotFound));
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await request(app)
        .patch('/v1/todos/tz4a98xxat96iws9zmbrgj3a')
        .send(getTodoPayload())
        .expect(expectError(Unauthorized));
    });
  });
});
