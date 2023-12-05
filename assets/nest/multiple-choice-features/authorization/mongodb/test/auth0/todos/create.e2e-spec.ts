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
import { expectError, MongoDBTestSetup } from '@test/utils';
import { Auth0Service } from '@api/auth/services';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';

describe('POST /v1/todos', () => {
  const todoPayload = getTodoPayload();
  const userId = new ObjectId();

  let app: NestFastifyApplication;
  let databaseService: DatabaseService;
  let databaseTestSetup: MongoDBTestSetup;
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
      new FastifyAdapter()
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      })
    );

    await app.init();

    databaseService = app.get(DatabaseService);
    databaseTestSetup = new MongoDBTestSetup(databaseService.connection);
  });

  beforeEach(async () => {
    await databaseTestSetup.removeSeededData();
    await databaseTestSetup.seedData();

    canActivate.mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: userId, email: 'hello@email' };
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
      .then(async (res) => {
        const todo = await databaseService.connection
          .collection('todos')
          .findOne({ name: todoPayload.name });
        expect(res.statusCode).toEqual(201);
        expect(res.payload).toEqual(`"${todo?._id}"`);
        expect(todo?.note).toEqual(todoPayload.note);
        expect(todo?.completed).toEqual(todoPayload.completed);
      });
  });

  it('should throw error if a todo with the same name already exists', async () => {
    const { name, note, completed } = getTodoPayload(false);
    await app.inject({
      method: 'POST',
      url: '/v1/todos',
      payload: { name, note, completed },
    });

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
  let databaseService: DatabaseService;
  let databaseTestSetup: MongoDBTestSetup;

  class Auth0ServiceMock {}

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(Auth0Service)
      .useClass(Auth0ServiceMock)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();

    databaseService = app.get(DatabaseService);
    databaseTestSetup = new MongoDBTestSetup(databaseService.connection);

    await databaseTestSetup.removeSeededData();
    await databaseTestSetup.seedData();
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
