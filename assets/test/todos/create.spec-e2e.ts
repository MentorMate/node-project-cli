import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import { create as createApp, getTodoPayload, registerUser } from '../utils';
import { JwtTokens } from '@common/data/auth';

describe('POST /v1/todos', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  beforeAll(async () => {
    const res = await registerUser(app);
    jwtTokens = res.body;
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    const todoPayload = getTodoPayload();

    describe('given the todo payload', () => {
      it('should return the created todo', async () => {
        const res = await request(app)
          .post('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json')
          .send(todoPayload);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.name).toEqual(todoPayload.name);
        expect(res.body.note).toEqual(todoPayload.note);
        expect(res.body.completed).toEqual(false);
      });
    });

    describe('given an empty payload', () => {
      it('should return 422 error', async () => {
        const res = await request(app)
          .post('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json')
          .send({});

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(422);
        expect(res.body.message).toEqual('Bad Data');
      });
    });
  });

  describe('when user is not authenticated', () => {
    const todoPayload = getTodoPayload();

    it('should return 401 error', async () => {
      const res = await request(app)
        .post('/v1/todos')
        .send(todoPayload)
        .set('Accept', 'application/json');

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('No authorization token was found');
    });
  });
});
