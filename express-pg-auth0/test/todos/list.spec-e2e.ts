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
  getTodoPayload,
  sortByField,
  Unauthorized,
} from '../utils';
import { Knex } from 'knex';
import createError from 'http-errors';

describe('GET /v1/todos', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  const jwtTokens = {
    idToken: 'token',
  };
  let dbClient: Knex;

  beforeAll(() => {
    const { app: _app, destroy: _destroy, dbClient: _dbClient } = createApp();
    app = _app;
    destroy = _destroy;
    dbClient = _dbClient;
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
    jest.clearAllMocks();
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
      authMock.mockImplementation((request, response, next) => {
        next(createError(401, 'No authorization token was found'));
      });

      await request(app)
        .get('/v1/todos')
        .send(getTodoPayload())
        .expect('content-type', /json/)
        .expect(expectError(Unauthorized));
    });
  });
});
