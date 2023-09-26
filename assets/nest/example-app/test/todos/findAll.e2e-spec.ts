import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getUserCredentials } from '../utils/get-user-credentials';
import { registerUser } from '../utils/register-user';
import { JwtToken } from '@api/auth/entities';
import { expectError } from '../utils/expect-error';
import { Unauthorized } from '../utils/errors';
import { createTodo } from './utils/create-todo';
import { sortByField } from './utils/sortby-field-todos';
import { SortOrder } from '@utils/query';

describe('GET /v1/todos', () => {
  const credentials = getUserCredentials();

  let app: NestFastifyApplication;
  let jwtTokens: JwtToken;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    jwtTokens = await registerUser(app, credentials);
  });

  beforeAll(async () => {
    await createTodo(app, jwtTokens.idToken, true);
    await createTodo(app, jwtTokens.idToken);
    await createTodo(app, jwtTokens.idToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('when user is authenticated', () => {
    describe('when no filters are applied', () => {
      it('should return whole todos list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(3);
          });
      });
    });

    describe('when completed=true filter is applied', () => {
      it('should return completed todo list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
            query: {
              filters: '{"completed":"true"}',
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(1);
          });
      });
    });

    describe('when completed=false filter is applied', () => {
      it('should return not completed todo list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos?filters[completed]=false',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(2);
          });
      });
    });

    describe('when name = "Laundry" filter is applied', () => {
      it('should return todo list with matched results', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos?filters[name]=Laundry',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(3);
          });
      });
    });

    describe('when pagination items is applied', () => {
      it('should return not completed todo list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos?pagination[items]=2',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(2);
          });
      });
    });

    describe('when pagination page is applied', () => {
      it('should return not completed todo list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos?pagination[page]=2&pagination[items]=3',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(0);
            expect(res.json().meta.total).toEqual(3);
          });
      });
    });

    describe('when sort by name desc', () => {
      it('should return desc ordered todo list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/v1/todos',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        const sortedRes = await app.inject({
          method: 'GET',
          url: '/v1/todos?sorts[0][column]=name&sorts[0][order]=desc',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        expect(sortedRes.json().meta.total).toEqual(response.json().meta.total);
        expect(sortedRes.json().data).toStrictEqual(
          sortByField(response.json().data, 'name', SortOrder.Desc),
        );
      });
    });

    describe('when sort by name asc', () => {
      it('should return asc ordered todo list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/v1/todos',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        const sortedRes = await app.inject({
          method: 'GET',
          url: '/v1/todos?sorts[0][column]=name&sorts[0][order]=asc',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        expect(sortedRes.json().meta.total).toEqual(response.json().meta.total);
        expect(sortedRes.json().data).toStrictEqual(
          sortByField(response.json().data, 'name', SortOrder.Asc),
        );
      });
    });

    describe('when sort by createdAt desc', () => {
      it('should return desc ordered todo list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/v1/todos',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        const sortedRes = await app.inject({
          method: 'GET',
          url: '/v1/todos?sorts[0][column]=createdAt&sorts[0][order]=desc',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        expect(sortedRes.json().meta.total).toEqual(response.json().meta.total);
        expect(sortedRes.json().data).toStrictEqual(
          sortByField(response.json().data, 'createdAt', SortOrder.Desc),
        );
      });
    });

    describe('when sort by createdAt asc', () => {
      it('should return asc ordered todo list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/v1/todos',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        const sortedRes = await app.inject({
          method: 'GET',
          url: '/v1/todos?sorts[0][column]=createdAt',
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        });

        expect(sortedRes.json().meta.total).toEqual(response.json().meta.total);
        expect(sortedRes.json().data).toStrictEqual(
          sortByField(response.json().data, 'createdAt', SortOrder.Asc),
        );
      });
    });

    describe('when all filters are applied', () => {
      it('should return filtered todo list', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos?filters[name]=Laundry&sorts[0][column]=name&sorts[0][order]=desc&pagination[page]=1&pagination[items]=2',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            expect(res.json().data.length).toEqual(2);
            expect(res.json().meta.total).toEqual(3);
          });
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await app
        .inject({
          method: 'GET',
          url: '/v1/todos',
        })
        .then(() => {
          expect(expectError(Unauthorized));
        });
    });
  });
});
