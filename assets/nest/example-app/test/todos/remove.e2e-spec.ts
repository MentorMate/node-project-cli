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
import { TodoNotFound } from './utils/errors';

describe('DELETE /v1/todos', () => {
  const credentials = getUserCredentials();

  let app: NestFastifyApplication;
  let jwtTokens: JwtToken;
  let todoId: number;

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
    const todo = await createTodo(app, jwtTokens.idToken);
    todoId = todo.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('when user is authenticated', () => {
    describe('given todo id in the query', () => {
      it('should return 200 when todo is deleted', async () => {
        await app
          .inject({
            method: 'DELETE',
            url: `/v1/todos/${todoId}`,
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then(({ statusCode }) => {
            expect(statusCode).toBe(200);
          });
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        await app
          .inject({
            method: 'DELETE',
            url: `/v1/todos/${Date.now()}`,
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then(() => {
            expect(expectError(TodoNotFound));
          });
      });
    });
  });

  describe('when user is not authenticated', () => {
    it('should return 401 error', async () => {
      await app
        .inject({
          method: 'DELETE',
          url: `/v1/todos/${todoId}}`,
          headers: {
            authorization: `Bearer ${jwtTokens.idToken}`,
          },
        })
        .then(() => {
          expect(expectError(Unauthorized));
        });
    });
  });
});
