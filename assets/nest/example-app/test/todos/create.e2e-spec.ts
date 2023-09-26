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
import { Unauthorized, UnprocessableEntity } from '../utils/errors';
import { getTodoPayload } from './utils/get-todo-payload';

describe('POST /v1/todos', () => {
  const credentials = getUserCredentials();
  const todoPayload = getTodoPayload();

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

  afterAll(async () => {
    await app.close();
  });

  describe('when user is authenticated', () => {
    describe('given the todo payload', () => {
      it('should return the created todo', async () => {
        await app
          .inject({
            method: 'POST',
            url: '/v1/todos',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
            payload: todoPayload,
          })
          .then((res) => {
            const responseBody = res.json();
            expect(responseBody.name).toEqual(todoPayload.name);
            expect(responseBody.note).toEqual(todoPayload.note);
            expect(responseBody.completed).toEqual(todoPayload.completed);
          });
      });
    });

    describe('given an empty payload', () => {
      it('should return 422 error', async () => {
        await app
          .inject({
            method: 'POST',
            url: '/v1/todos',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
            payload: {},
          })
          .then(() => {
            expect(expectError(UnprocessableEntity));
          });
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/v1/todos',
          payload: todoPayload,
        })
        .then(() => {
          expect(expectError(Unauthorized));
        });
    });
  });
});
