import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { sortByField } from './utils/sortby-field-todos';
import { SortOrder } from '@utils/query';
import {
  ExecutionContext,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@api/auth/guards/auth.guard';
import { expectError } from '../utils/expect-error';
import { DatabaseService } from '@database/database.service';

describe('GET /v1/todos', () => {
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
        whitelist: true,
        transform: true,
      })
    );

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

  it('when no filters are applied - should return whole todos list', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => res.json())
      .then(({ items }) => {
        expect(items.length).toEqual(3);
      });
  });

  it('should return completed todo list - when completed=true filter is applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          completed: 'true',
        },
      })
      .then((res) => res.json())
      .then(({ items }) => {
        expect(items.length).toEqual(1);
      });
  });

  it('should return not completed todo list - when completed=false filter is applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          completed: 'false',
        },
      })
      .then((res) => res.json())
      .then(({ items }) => {
        expect(items.length).toEqual(2);
      });
  });

  it('should return todo list with matched results - when name = "Laundry" filter is applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos?filters[name]=Laundry',
        query: {
          name: 'Laundry 1',
        },
      })
      .then((res) => res.json())
      .then(({ items }) => {
        expect(items.length).toEqual(1);
      });
  });

  it('should return not completed todo list - when pagination items is applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          pageSize: '2',
        },
      })
      .then((res) => res.json())
      .then(({ items }) => {
        expect(items.length).toEqual(2);
      });
  });

  it('should return not completed todo list - when pagination items is applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          pageSize: '3',
          pageNumber: '2',
        },
      })
      .then((res) => res.json())
      .then(({ items, total }) => {
        expect(items.length).toEqual(0);
        expect(total).toEqual(3);
      });
  });

  it('should return desc ordered todo list - when sort by name desc', async () => {
    const response = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => res.json());

    const sortedRes = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          column: 'name',
          order: 'desc',
        },
      })
      .then((res) => res.json());

    expect(sortedRes.total).toEqual(response.total);
    expect(sortedRes.items).toStrictEqual(
      sortByField(response.items, 'name', SortOrder.Desc)
    );
  });

  it('should return asc ordered todo list - when sort by name asc', async () => {
    const response = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => res.json());

    const sortedRes = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          column: 'name',
          order: 'asc',
        },
      })
      .then((res) => res.json());

    expect(sortedRes.total).toEqual(response.total);
    expect(sortedRes.items).toStrictEqual(
      sortByField(response.items, 'name', SortOrder.Asc)
    );
  });

  it('should return desc ordered todo list - when sort by createdAt desc', async () => {
    const response = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => res.json());

    const sortedRes = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          column: 'createdAt',
          order: 'desc',
        },
      })
      .then((res) => res.json());

    expect(sortedRes.total).toEqual(response.total);
    expect(sortedRes.items).toStrictEqual(
      sortByField(response.items, 'createdAt', SortOrder.Desc)
    );
  });

  it('should return asc ordered todo list - when sort by createdAt asc', async () => {
    const response = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => res.json());

    const sortedRes = await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          column: 'createdAt',
          order: 'asc',
        },
      })
      .then((res) => res.json());

    expect(sortedRes.total).toEqual(response.total);
    expect(sortedRes.items).toStrictEqual(
      sortByField(response.items, 'createdAt', SortOrder.Asc)
    );
  });

  it('should return filtered todo list - when all filters are applied', async () => {
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
        query: {
          column: 'name',
          order: 'desc',
          pageNumber: '1',
          pageSize: '2',
        },
      })
      .then((res) => res.json())
      .then(({ items, total }) => {
        expect(items.length).toEqual(2);
        expect(total).toEqual(3);
      });
  });
});

describe('GET /v1/todos - real AuthGuard', () => {
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
    await app
      .inject({
        method: 'GET',
        url: '/v1/todos',
      })
      .then((res) => expectError(new UnauthorizedException(), res.json));
  });
});
