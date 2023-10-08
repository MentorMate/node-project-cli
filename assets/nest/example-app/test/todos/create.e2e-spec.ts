import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getTodoPayload } from './utils/get-todo-payload';
import { AuthGuard } from '@api/auth/guards/auth.guard';
import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { NestKnexService } from '@database/nest-knex.service';
import { expectError } from '../utils/expect-error';

describe('POST /v1/todos', () => {
  const todoPayload = getTodoPayload();

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

    await app.init();

    nestKnexService = app.get(NestKnexService);
  });

  beforeEach(async () => {
    await nestKnexService.connection.migrate.rollback();
    await nestKnexService.connection.migrate.latest();
    await nestKnexService.connection.seed.run();

    canActivate.mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 1, email: 'hello@email' };
      return true;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the created todo', async () => {
    await app
      .inject({
        method: 'POST',
        url: '/v1/todos',
        payload: todoPayload,
      })
      .then((res) => {
        const responseBody = res.json();
        expect(responseBody.name).toEqual(todoPayload.name);
        expect(responseBody.note).toEqual(todoPayload.note);
        expect(responseBody.completed).toEqual(todoPayload.completed);
      });
  });

  it('should throw error if a todo with the same name already exists', async () => {
    const { name, note, completed } = await app
      .inject({
        method: 'POST',
        url: '/v1/todos',
        payload: getTodoPayload(false),
      })
      .then((res) => res.json());

    await app
      .inject({
        method: 'POST',
        url: '/v1/todos',
        payload: { name, note, completed },
      })
      .then((res) => res.json())
      .then((response) => {
        expect(response).toEqual({
          statusCode: 422,
          message: 'Unprocessable Entity',
          error: 'Unprocessable Entity',
        });
      });
  });

  it('should return 422 error when empty payload is provided', async () => {
    await app
      .inject({
        method: 'POST',
        url: '/v1/todos',
        payload: {},
      })
      .then((res) => expectError(new BadRequestException(), res.json));
  });
});

describe('POST /v1/todos - real AuthGuard', () => {
  const todoPayload = getTodoPayload();

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

  it('should return 401 error when user is not authenticated', () => {
    return app
      .inject({
        method: 'POST',
        url: '/v1/todos',
        payload: todoPayload,
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
