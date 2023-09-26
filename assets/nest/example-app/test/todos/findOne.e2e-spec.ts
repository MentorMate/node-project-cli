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
import { createTodo } from './utils/create-todo';
import { TodoNotFound } from './utils/errors';
import { Todo } from '@api/todos/entities/todo.entity';

describe('GET /v1/todos/:id', () => {
  const credentials = getUserCredentials();

  let app: NestFastifyApplication;
  let jwtTokens: JwtToken;
  let todo: Todo;

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
    todo = await createTodo(app, jwtTokens.idToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('when user is authenticated', () => {
    describe('given todo id in the query', () => {
      it('should return the todo', async () => {
        await app
          .inject({
            method: 'GET',
            url: `/v1/todos/${todo.id}`,
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
          })
          .then((res) => {
            const responseBody = res.json();
            expect(res.statusCode).toBe(200);

            expect(responseBody.id).toEqual(todo.id);
            expect(responseBody.name).toEqual(todo.name);
            expect(responseBody.note).toEqual(todo.note);
            expect(responseBody.completed).toEqual(todo.completed);
          });
      });
    });

    describe('given not existing todo id in the query', () => {
      it('should return 404', async () => {
        await app
          .inject({
            method: 'GET',
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

    describe('given a text id in the query', () => {
      it('should return 422 error', async () => {
        await app
          .inject({
            method: 'GET',
            url: '/v1/todos/test',
            headers: {
              authorization: `Bearer ${jwtTokens.idToken}`,
            },
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
          method: 'GET',
          url: `/v1/todos/${todo.id}`,
        })
        .then(() => {
          expect(expectError(Unauthorized));
        });
    });
  });
});
