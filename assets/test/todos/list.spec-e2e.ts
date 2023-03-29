import '@extensions/zod/register';
import '@extensions/knex/register';

import request from 'supertest';
import {
  create as createApp,
  createTodo,
  getTodoPayload,
  registerUser,
} from '../utils';
import { JwtTokens } from '@common/data/auth';

describe('GET /v1/todos', () => {
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

  beforeAll(async () => {
    await createTodo(app, jwtTokens.idToken, true);
    await createTodo(app, jwtTokens.idToken);
    await createTodo(app, jwtTokens.idToken);
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    describe('when no filters are applied', () => {
      it('should return whole todos list', async () => {
        const res = await request(app)
          .get('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(3);
      });
    });

    describe('when completed=true filter is applied', () => {
      it('should return completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?filters[completed]=true')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(1);
      });
    });

    describe('when completed=false filter is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?filters[completed]=false')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(2);
      });
    });

    describe('when pagination items is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?pagination[items]=2')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(2);
        expect(res.body.meta.total).toEqual(3);
      });
    });

    describe('when pagination page is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?pagination[page]=2&pagination[items]=3')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .set('Accept', 'application/json');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(0);
        expect(res.body.meta.total).toEqual(3);
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      const res = await request(app)
        .get('/v1/todos')
        .send(getTodoPayload())
        .set('Accept', 'application/json');

      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.status).toEqual(401);
      expect(res.body.message).toEqual('Invalid token');
    });
  });
});
