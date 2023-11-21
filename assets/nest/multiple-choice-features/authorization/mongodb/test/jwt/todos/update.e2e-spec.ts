import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getTodoPayload } from './utils/get-todo-payload';
import { AuthGuard } from '@api/auth/guards/auth.guard';
import { DatabaseService } from '@database/database.service';
import {
  ValidationPipe,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ServiceToHttpErrorsInterceptor } from '@utils/interceptors';
import { expectError } from '../utils/expect-error';
import { Todo } from '@api/todos/entities';
import { ObjectId, WithId } from 'mongodb';

describe('PUT /v1/todos/:id', () => {
  let app: NestFastifyApplication;
  let databaseService: DatabaseService;
  let todo: WithId<Todo>;
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
      new FastifyAdapter()
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      })
    );

    app.useGlobalInterceptors(new ServiceToHttpErrorsInterceptor());

    await app.init();

    databaseService = app.get(DatabaseService);
  });

  beforeEach(async () => {
    await databaseService.migrate.rollback();
    await databaseService.migrate.latest();
    await databaseService.seed.run();

    canActivate.mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'tz4a98xxat96iws9zmbrgj3a', email: 'hello@email' };
      return true;
    });

    todo = (
      await databaseService.connection
        .collection<Todo>('todos')
        .find()
        .toArray()
    )[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the updated todo', async () => {
    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/${todo._id}`,
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
    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/${todo._id}`,
        payload: {},
      })
      .then((res) => {
        const responseBody = res.json();
        expect(res.statusCode).toBe(200);

        expect(responseBody._id).toEqual(todo._id.toString());
        expect(responseBody.name).toEqual(todo.name);
        expect(responseBody.note).toEqual(todo.note);
        expect(responseBody.completed).toEqual(todo.completed);
        expect(responseBody.userId).toEqual(todo.userId);
      });
  });

  it('should return 404', async () => {
    const objId = new ObjectId(1000);
    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/${objId}`,
        payload: getTodoPayload(),
      })
      .then((res) => {
        expectError(new NotFoundException(), res.json);
      });
  });
});

describe('PUT /v1/todos/:id - real AuthGuard', () => {
  let app: NestFastifyApplication;
  let todo: WithId<Todo>;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    await app.init();

    databaseService = app.get(DatabaseService);

    await databaseService.migrate.rollback();
    await databaseService.migrate.latest();
    await databaseService.seed.run();

    todo = (
      await databaseService.connection
        .collection<Todo>('todos')
        .find()
        .toArray()
    )[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 error', async () => {
    await app
      .inject({
        method: 'PUT',
        url: `/v1/todos/${todo._id}`,
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
