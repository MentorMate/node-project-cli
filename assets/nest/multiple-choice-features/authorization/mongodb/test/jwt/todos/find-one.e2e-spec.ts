import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '@api/auth/guards/auth.guard';
import {
  ValidationPipe,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ServiceToHttpErrorsInterceptor } from '@utils/interceptors';
import { expectError } from '../utils/expect-error';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';

describe('GET /v1/todos/:id', () => {
  let app: NestFastifyApplication;
  let databaseService: DatabaseService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the todo - given todo id in the query', async () => {
    const todo = (
      await databaseService.connection.collection('todos').find().toArray()
    )[0];

    await app
      .inject({
        method: 'GET',
        url: `/v1/todos/${todo._id}`,
      })
      .then((res) => {
        const { id, name, note, completed } = res.json();
        expect(res.statusCode).toBe(200);

        expect(id).toEqual(todo.id);
        expect(name).toEqual(todo.name);
        expect(note).toEqual(todo.note);
        expect(completed).toEqual(todo.completed);
      });
  });

  it('should return 404', async () => {
    const objId = new ObjectId(1000);
    await app
      .inject({
        method: 'GET',
        url: `/v1/todos/${objId}`,
      })
      .then((res) => {
        expectError(new NotFoundException(), res.json);
      });
  });
});

describe('GET /v1/todos/:id - real AuthGuard', () => {
  let app: NestFastifyApplication;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 error', async () => {
    const objId = new ObjectId(1000);
    await app
      .inject({
        method: 'GET',
        url: `/v1/todos/${objId}`,
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
