import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '@database/database.service';
import {
  BadRequestException,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import { expectError } from '../utils/expect-error';

describe('POST /auth/login', () => {
  const credentials = { email: 'user@email.com', password: 'pass@ord' };

  let app: NestFastifyApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  });

  beforeEach(async () => {
    await databaseService.migrate.rollback();
    await databaseService.migrate.latest();
    await databaseService.seed.run();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('given the email and password are valid', () => {
    it('should create a new user and return a jwt token', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/register',
          payload: credentials,
        })
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(typeof JSON.parse(res.body).idToken).toBe('string');
        });
    });

    describe('when there is an existing user', () => {
      it('should return 409 error', async () => {
        const newCredentials = {
          email: 'hello@email.com',
          password: credentials.password,
        };

        await app
          .inject({
            method: 'POST',
            url: '/auth/register',
            payload: newCredentials,
          })
          .then((res) => {
            expectError(new ConflictException(), res.json);
          });
      });
    });
  });

  describe('when there is invalid payload', () => {
    it('should return 400 error', async () => {
      await app
        .inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: 'test',
            password: 'test',
          },
        })
        .then((res) => {
          expectError(new BadRequestException(), res.json);
        });
    });
  });
});
