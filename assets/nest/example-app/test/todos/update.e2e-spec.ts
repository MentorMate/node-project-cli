import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getTodoPayload } from './utils/get-todo-payload';
import { AuthGuard } from '@api/auth/guards/auth.guard';
import { NestKnexService } from '@database/nest-knex.service';
import {
  ValidationPipe,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ServiceToHttpErrorsInterceptor } from '@utils/interceptors';
import { expectError } from '../utils/expect-error';

describe('PUT /v1/todos/:id', () => {
  let app: NestFastifyApplication;
  let nestKnexService: NestKnexService;
  const canActivate = jest.fn();

  class AuthGuardMock {
    canActivate = canActivate;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthGuard)
      .useClass(AuthGuardMock)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    app.useGlobalInterceptors(new ServiceToHttpErrorsInterceptor());

    await app.init();

    nestKnexService = app.get(NestKnexService);
  });

  beforeEach(async () => {
    await nestKnexService.connection.migrate.rollback();
    await nestKnexService.connection.migrate.latest();
    await nestKnexService.connection.seed.run();

    canActivate.mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'tz4a98xxat96iws9zmbrgj3a', email: 'hello@email' };
      return true;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the updated todo', async () => {
    await app
      .inject({
        method: 'PUT',
        url: '/v1/todos/1',
        payload: {
          name: 'updated',
          completed: true,
          note: 'updated',
        },
      })
      .then((res) => {
        const responseBody = res.json();
        expect(res.statusCode).toBe(200);

        expect(responseBody.name).toEqual('updated');
        expect(responseBody.note).toEqual('updated');
        expect(responseBody.completed).toEqual(true);
      });
  });

  it('should return the not updated todo', async () => {
    const todo = await nestKnexService
      .connection('todos')
      .where({ id: 1 })
      .first();

    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/1`,
        payload: {},
      })
      .then((res) => {
        const responseBody = res.json();
        expect(res.statusCode).toBe(200);

        expect(responseBody.id).toEqual(todo.id);
        expect(responseBody.name).toEqual(todo.name);
        expect(responseBody.note).toEqual(todo.note);
        expect(responseBody.completed).toEqual(todo.completed);
        expect(responseBody.userId).toEqual(todo.userId);
      });
  });

  it('should return 404', async () => {
    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/32131`,
        payload: getTodoPayload(),
      })
      .then((res) => {
        expectError(new NotFoundException(), res.json);
      });
  });
});

describe('PUT /v1/todos/:id - real AuthGuard', () => {
  let app: NestFastifyApplication;
  let nestKnexService: NestKnexService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();

    nestKnexService = app.get(NestKnexService);

    await nestKnexService.connection.migrate.rollback();
    await nestKnexService.connection.migrate.latest();
    await nestKnexService.connection.seed.run();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 error', async () => {
    await app
      .inject({
        method: 'PUT',
        url: '/v1/todos/1',
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
