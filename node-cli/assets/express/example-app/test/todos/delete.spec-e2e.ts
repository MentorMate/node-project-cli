import request from 'supertest';
import {
  create as createApp,
  expectError,
  Unauthorized,
  TodoNotFound
} from '../utils';
import { JwtTokens } from '@api/auth';
import { Knex } from 'knex';
import { create } from '@database';

describe('DELETE /v1/todos/:id', () => {
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
    await request(app)
      .delete('/v1/todos/tz4a98xxat96iws9zmbrgj3a')
      .set('Content-Type', 'application/json')
      .expect(expectError(Unauthorized));
  });
});
