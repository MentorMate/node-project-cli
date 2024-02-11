import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
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
import { Auth0Service } from '@api/auth/services';

describe('DELETE /v1/todos', () => {
  let app: NestFastifyApplication;
  let nestKnexService: NestKnexService;
  const canActivate = jest.fn();

  class AuthGuardMock {
    canActivate = canActivate;
  }

  class Auth0ServiceMock {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthGuard)
      .useClass(AuthGuardMock)
      .overrideProvider(Auth0Service)
      .useClass(Auth0ServiceMock)
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

  it('should return 200 when todo is deleted', async () => {
    const todo = await nestKnexService.connection('todos').first();

    await app
      .inject({
        method: 'DELETE',
        url: `/v1/todos/${todo.id}`,
      })
      .then(async ({ statusCode }) => {
        expect(statusCode).toBe(200);
        const deletedTodo = await nestKnexService
          .connection('todos')
          .where({ id: todo.id })
          .first();
        expect(deletedTodo).toBeUndefined();
      });
  });

  it('should return 404 - non existing todo', async () => {
    await app
      .inject({
        method: 'DELETE',
        url: `/v1/todos/1000`,
      })
      .then((res) => expectError(new NotFoundException(), res.json));
  });
});

describe('DELETE /v1/todos - real AuthGuard', () => {
  let app: NestFastifyApplication;
  let nestKnexService: NestKnexService;

  class Auth0ServiceMock {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Auth0Service)
      .useClass(Auth0ServiceMock)
      .compile();

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
        method: 'DELETE',
        url: `/v1/todos/1`,
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
