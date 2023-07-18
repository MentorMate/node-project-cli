import request from 'supertest';
import {
  create as createApp,
  createTodo,
  expectError,
  getTodoPayload,
  registerUser,
  sortByField,
  Unauthorized,
} from '../utils';
import { JwtTokens } from '@api/auth';

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
    jwtTokens = await registerUser(app);
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
          .expect(200);

        expect(res.body.data.length).toEqual(3);
      });
    });

    describe('when completed=true filter is applied', () => {
      it('should return completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?filters[completed]=true')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.data.length).toEqual(1);
      });
    });

    describe('when completed=false filter is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?filters[completed]=false')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.data.length).toEqual(2);
      });
    });

    describe('when name = "Laundry" filter is applied', () => {
      it('should return todo list with matched results', async () => {
        const res = await request(app)
          .get('/v1/todos?filters[name]=Laundry')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.data.length).toEqual(3);
      });
    });

    describe('when pagination items is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?pagination[items]=2')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.data.length).toEqual(2);
      });
    });

    describe('when pagination page is applied', () => {
      it('should return not completed todo list', async () => {
        const res = await request(app)
          .get('/v1/todos?pagination[page]=2&pagination[items]=3')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect(200);

        expect(res.body.data.length).toEqual(0);
        expect(res.body.meta.total).toEqual(3);
      });
    });

    describe('when sort by name desc', () => {
      it('should return desc ordered todo list', async () => {
        const res = await request(app)
          .get('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        const sortedRes = await request(app)
          .get('/v1/todos?sorts[0][column]=name&sorts[0][order]=desc')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(sortedRes.headers['content-type']).toMatch(/json/);
        expect(sortedRes.status).toEqual(200);
        expect(sortedRes.body.meta.total).toEqual(res.body.meta.total);
        expect(sortedRes.body.data).toStrictEqual(
          sortByField(res.body.data, 'name', 'desc')
        );
      });
    });

    describe('when sort by name asc', () => {
      it('should return asc ordered todo list', async () => {
        const res = await request(app)
          .get('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        const sortedRes = await request(app)
          .get('/v1/todos?sorts[0][column]=name&sorts[0][order]=asc')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(sortedRes.headers['content-type']).toMatch(/json/);
        expect(sortedRes.status).toEqual(200);
        expect(sortedRes.body.meta.total).toEqual(res.body.meta.total);
        expect(sortedRes.body.data).toStrictEqual(
          sortByField(res.body.data, 'name', 'asc')
        );
      });
    });

    describe('when sort by createdAt desc', () => {
      it('should return desc ordered todo list', async () => {
        const res = await request(app)
          .get('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        const sortedRes = await request(app)
          .get('/v1/todos?sorts[0][column]=createdAt&sorts[0][order]=desc')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(sortedRes.headers['content-type']).toMatch(/json/);
        expect(sortedRes.status).toEqual(200);
        expect(sortedRes.body.meta.total).toEqual(res.body.meta.total);
        expect(sortedRes.body.data).toStrictEqual(
          sortByField(res.body.data, 'createdAt', 'desc')
        );
      });
    });

    describe('when sort by createdAt asc', () => {
      it('should return asc ordered todo list', async () => {
        const res = await request(app)
          .get('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        const sortedRes = await request(app)
          .get('/v1/todos?sorts[0][column]=createdAt')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(sortedRes.headers['content-type']).toMatch(/json/);
        expect(sortedRes.status).toEqual(200);
        expect(sortedRes.body.meta.total).toEqual(res.body.meta.total);
        expect(sortedRes.body.data).toStrictEqual(
          sortByField(res.body.data, 'createdAt', 'asc')
        );
      });
    });

    describe('when all filters are applied', () => {
      it('should return filtered todo list', async () => {
        const res = await request(app)
          .get(
            '/v1/todos?filters[name]=Laundry&sorts[0][column]=name&sorts[0][order]=desc&pagination[page]=1&pagination[items]=2'
          )
          .set('Authorization', 'Bearer ' + jwtTokens.idToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toEqual(2);
        expect(res.body.meta.total).toEqual(3);
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await request(app)
        .get('/v1/todos')
        .send(getTodoPayload())
        .expect('content-type', /json/)
        .expect(expectError(Unauthorized));
    });
  });
});
